import { NextRequest } from "next/server";

export type GeoResult = {
  city?: string;
  region?: string;
  country?: string;
};

export function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

export function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip === "127.0.0.1" || ip === "localhost") return true;
  const v4 = ip.replace(/^::ffff:/, "");
  if (/^10\./.test(v4)) return true;
  if (/^192\.168\./.test(v4)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(v4)) return true;
  if (/^127\./.test(v4)) return true;
  return false;
}

// Free, keyless IP geolocation — see CLAUDE.md for rate limit notes (ip-api.com: ~45 req/min, HTTP only on free tier).
export async function geolocate(ip: string): Promise<GeoResult | null> {
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
