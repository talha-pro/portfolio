import { NextRequest, NextResponse } from "next/server";
import { getClientIp, isPrivateIp, geolocate, type GeoResult } from "@/app/lib/geolocation";
import { postSlackMessage } from "@/app/lib/slack";

async function notifySlack(ip: string, geo: GeoResult | null) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const location = geo
    ? [geo.city, geo.region, geo.country].filter(Boolean).join(", ")
    : "unknown location";

  try {
    await postSlackMessage(
      webhookUrl,
      `👀 Someone visited your portfolio! Location: ${location} (IP: ${ip})`,
    );
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
