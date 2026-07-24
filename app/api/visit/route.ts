import { NextRequest, NextResponse } from "next/server";

type GeoResult = {
  city?: string;
  region?: string;
  country?: string;
};

function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip === "127.0.0.1" || ip === "localhost") return true;
  const v4 = ip.replace(/^::ffff:/, "");
  if (/^10\./.test(v4)) return true;
  if (/^192\.168\./.test(v4)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(v4)) return true;
  if (/^127\./.test(v4)) return true;
  return false;
}

// Free, keyless IP geolocation — see CLAUDE.md for rate limit notes (ip-api.com: ~45 req/min, HTTP only on free tier).
async function geolocate(ip: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,regionName,country`,
      { signal: AbortSignal.timeout(3000) },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== "success") return null;
    return { city: data.city, region: data.regionName, country: data.country };
  } catch (err) {
    console.error("geolocation lookup failed:", err);
    return null;
  }
}

async function notifySlack(ip: string, geo: GeoResult | null) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const location = geo
    ? [geo.city, geo.region, geo.country].filter(Boolean).join(", ")
    : "unknown location";

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `👀 Someone visited your portfolio! Location: ${location} (IP: ${ip})`,
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    console.error("slack notification failed:", err);
  }
}

export async function POST(req: NextRequest) {
  const notificationsEnabled =
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_VISITOR_NOTIFICATIONS === "true";

  if (!notificationsEnabled) {
    return NextResponse.json({ ok: true, skipped: "dev" });
  }

  const ip = getClientIp(req);
  if (!ip || isPrivateIp(ip)) {
    return NextResponse.json({ ok: true, skipped: "local-ip" });
  }

  try {
    const geo = await geolocate(ip);
    await notifySlack(ip, geo);
  } catch (err) {
    console.error("visit notification failed:", err);
  }

  return NextResponse.json({ ok: true });
}
