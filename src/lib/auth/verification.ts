import { randomBytes } from "crypto";
import { prisma } from "../prisma";

export async function createVerificationToken(userId: string): Promise<string> {
  // Delete any existing tokens for this user first
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.emailVerificationToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

export async function consumeVerificationToken(
  token: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record) return { ok: false, error: "Invalid or expired link." };
  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { token } });
    return { ok: false, error: "This link has expired. Please request a new one." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return { ok: true };
}