import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "brewbuddy_session";

export function buildSessionToken(
  userId: string,
  expiresAtMs: number,
  secret: string
): string {
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, exp: expiresAtMs }),
    "utf8"
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function parseSessionToken(
  token: string,
  secret: string
): { sub: string } | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const sigBuf = Buffer.from(sig, "utf8");
  const expBuf = Buffer.from(expected, "utf8");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { sub?: unknown; exp?: unknown };
    if (typeof data.exp !== "number" || Date.now() > data.exp) return null;
    if (typeof data.sub !== "string" || data.sub.length === 0) return null;
    return { sub: data.sub };
  } catch {
    return null;
  }
}
