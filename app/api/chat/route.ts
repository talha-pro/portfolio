import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  APICallError,
  type UIMessage,
  type UIMessageStreamWriter,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse, after } from "next/server";
import { isPrivateIp, geolocate } from "@/app/lib/geolocation";
import { postSlackMessage } from "@/app/lib/slack";

export const maxDuration = 30;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

// Best-effort only: this Map lives in a single serverless instance's memory,
// so it resets on redeploy/cold-start and isn't shared across instances.
// Good enough to blunt casual abuse of the OpenAI key without adding infra.
const requestLog = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requestLog.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    requestLog.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() ?? "unknown";
}

let cachedBio: string | null = null;
async function getBio(): Promise<string> {
  if (cachedBio) return cachedBio;
  const filePath = path.join(process.cwd(), "content", "about-me.md");
  cachedBio = await readFile(filePath, "utf-8");
  return cachedBio;
}

const CHAT_ALERT_TEXT_LIMIT = 500;

// Assumes the AI SDK v7 useChat wire format: the client POSTs the full
// message history with the newly-submitted user message appended last.
function getLastUserMessageText(messages: UIMessage[]): string | null {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") return null;

  const text = last.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join(" ")
    .trim();

  if (!text) return null;
  return text.length > CHAT_ALERT_TEXT_LIMIT
    ? `${text.slice(0, CHAT_ALERT_TEXT_LIMIT)}…`
    : text;
}

// Separate webhook/channel from the visitor-notification one (SLACK_WEBHOOK_URL) — see CLAUDE.md.
// Runs via next/server's `after()` so it never delays the streamed chat response, and any
// failure here (bad webhook, geolocation timeout, etc.) is only ever logged, never surfaced to the user.
async function notifyChatSlack(ip: string, messageText: string) {
  const webhookUrl = process.env.SLACK_CHAT_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const geo = ip !== "unknown" && !isPrivateIp(ip) ? await geolocate(ip) : null;
    const location = geo
      ? [geo.city, geo.region, geo.country].filter(Boolean).join(", ")
      : null;
    const suffix = location ? ` (from ${location})` : "";

    await postSlackMessage(
      webhookUrl,
      `💬 New chat message on your portfolio${suffix}: "${messageText}"`,
    );
  } catch (err) {
    console.error("chat slack notification failed:", err);
  }
}

const OPENAI_FALLBACK_MESSAGE =
  "I'm temporarily unable to respond right now — please reach out to Talha directly via email or phone, he'd be happy to help.";

type OpenAIErrorKind = "insufficient_quota" | "rate_limited" | "api_error" | "network";

function parseJsonSafe(text?: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Distinguishes billing failures (insufficient_quota — the OpenAI account is out of
// credit/over its spending limit) from a generic rate-limit 429 (same HTTP status,
// different error.code/type in the body) and from network-level failures, where the
// call never got a response at all (timeout, DNS, connection reset — not an APICallError).
function classifyOpenAIError(err: unknown): OpenAIErrorKind {
  if (!APICallError.isInstance(err)) return "network";
  if (err.statusCode !== 429) return "api_error";

  const body = parseJsonSafe(err.responseBody) as { error?: { code?: string; type?: string } } | null;
  const code = body?.error?.code;
  const type = body?.error?.type;
  return code === "insufficient_quota" || type === "insufficient_quota"
    ? "insufficient_quota"
    : "rate_limited";
}

// Best-effort, in-memory cooldown (same tradeoff as the rate limiter above) so a burst
// of failed chat requests during an outage sends one Slack alert, not one per message.
const QUOTA_ALERT_COOLDOWN_MS = 60 * 60 * 1000;
let lastQuotaAlertAt = 0;

async function alertQuotaExhausted() {
  const now = Date.now();
  if (now - lastQuotaAlertAt < QUOTA_ALERT_COOLDOWN_MS) return;
  lastQuotaAlertAt = now;

  const webhookUrl = process.env.SLACK_CHAT_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await postSlackMessage(
      webhookUrl,
      "🚨 OpenAI quota/billing error on the portfolio chat — visitors are seeing a fallback message. Check your OpenAI account's balance or spending limit.",
    );
  } catch (err) {
    console.error("quota alert slack notification failed:", err);
  }
}

// Writes a normal, complete assistant text message into the UI message stream —
// indistinguishable from a real reply on the client, with no error state involved.
function writeFallbackAssistantMessage(
  writer: UIMessageStreamWriter,
  messageAlreadyStarted: boolean,
) {
  if (!messageAlreadyStarted) {
    writer.write({ type: "start" });
  }
  const id = "fallback";
  writer.write({ type: "text-start", id });
  writer.write({ type: "text-delta", id, delta: OPENAI_FALLBACK_MESSAGE });
  writer.write({ type: "text-end", id });
  writer.write({ type: "finish" });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests — please try again in a few minutes." },
      { status: 429 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Chat is not configured on this deployment." },
      { status: 503 },
    );
  }

  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const bio = await getBio();

    const lastUserText = getLastUserMessageText(messages);
    if (lastUserText) {
      after(() => notifyChatSlack(ip, lastUserText));
    }

    const system = `You are Talha Khan's AI assistant on his personal portfolio website. You are not Talha — you are an assistant that speaks about him in the third person, to recruiters, hiring managers, and potential collaborators visiting his site.

Only use the information in the CAREER INFO section below to answer questions. Keep the tone professional, warm, and concise.

Always refer to Talha in the third person. For example, when asked about his experience, respond like: "Talha has 5 years of experience..." or "He has worked extensively with React and Next.js..." — never "I have 5 years of experience" or "I have worked with...".

If a question asks about something not covered in the career info (personal details, opinions, or anything you don't have data on), don't guess or invent an answer. Instead, respond along these lines: "That's not something I have details on — it'd be best to reach out to Talha directly via email or phone, he can guide you better on that. I'm mainly set up to answer questions about his career, skills, and experience."

CAREER INFO:
${bio}`;

    const modelMessages = await convertToModelMessages(messages);

    // Built manually (rather than result.toUIMessageStreamResponse()) so an OpenAI-side
    // failure can be swapped for a normal-looking assistant message instead of an error
    // chunk — see classifyOpenAIError / writeFallbackAssistantMessage above.
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          model: openai("gpt-4o-mini"),
          system,
          messages: modelMessages,
        });

        let messageStarted = false;
        let lastErrorKind: OpenAIErrorKind | null = null;

        for await (const chunk of result.toUIMessageStream({
          onError: (error) => {
            lastErrorKind = classifyOpenAIError(error);
            console.error(`OpenAI chat call failed (${lastErrorKind}):`, error);
            return OPENAI_FALLBACK_MESSAGE;
          },
        })) {
          if (chunk.type === "start") messageStarted = true;

          if (chunk.type === "error") {
            if (lastErrorKind === "insufficient_quota") {
              after(() => alertQuotaExhausted());
            }
            writeFallbackAssistantMessage(writer, messageStarted);
            break;
          }

          writer.write(chunk);
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (err) {
    console.error("chat request failed:", err);
    return NextResponse.json(
      { error: "Something went wrong generating a response." },
      { status: 500 },
    );
  }
}
