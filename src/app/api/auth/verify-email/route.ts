import { NextRequest, NextResponse } from "next/server";
import { consumeVerificationToken } from "../../../../lib/auth/verification";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/verify-email?error=missing", req.url));
  }

  const result = await consumeVerificationToken(token);

  if (!result.ok) {
    const params = new URLSearchParams({ error: result.error });
    return NextResponse.redirect(new URL(`/verify-email?${params}`, req.url));
  }

  return NextResponse.redirect(new URL("/login?verified=true", req.url));
}