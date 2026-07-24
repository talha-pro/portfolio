import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

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

    const system = `You are answering questions on Talha Khan's personal portfolio website, speaking in the first person as Talha.

Only use the information in the CAREER INFO section below to answer questions. Keep the tone professional, warm, and concise — you're talking to recruiters, hiring managers, and potential collaborators.

If a question asks about something not covered in the career info (personal opinions, unrelated topics, information you don't have), say plainly that you don't have that information rather than guessing or inventing details.

CAREER INFO:
${bio}`;

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("chat request failed:", err);
    return NextResponse.json(
      { error: "Something went wrong generating a response." },
      { status: 500 },
    );
  }
}
