import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// tune cost if needed; safe defaults for interactive login.
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;
const KEYLEN = 64;
const SALT_LEN = 16;

// store in `User.passwordHash`. format is versioned for future algorithm changes.
export function hashPassword(plain: string): string {
  const salt = randomBytes(SALT_LEN);
  const hash = scryptSync(plain, salt, KEYLEN, SCRYPT_PARAMS);
  return `scrypt:v1:${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const prefix = "scrypt:v1:";
  if (!stored.startsWith(prefix)) return false;
  const rest = stored.slice(prefix.length);
  const [saltB64, hashB64] = rest.split(":");
  if (!saltB64 || !hashB64) return false;
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltB64, "base64url");
    expected = Buffer.from(hashB64, "base64url");
  } catch {
    return false;
  }
  if (salt.length !== SALT_LEN || expected.length !== KEYLEN) return false;
  const hash = scryptSync(plain, salt, KEYLEN, SCRYPT_PARAMS);
  return timingSafeEqual(hash, expected);
}
