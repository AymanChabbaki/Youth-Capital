import bcrypt from "bcryptjs";
import crypto from "crypto";

const BCRYPT_ROUNDS = 12;

// Superseded by bcrypt below — kept only so existing rows can be verified once and migrated.
function legacyHash(password: string): string {
  return crypto.createHash("sha256").update(password + "ycc_salt_2024").digest("hex");
}

export function isLegacyHash(hash: string): boolean {
  return !hash.startsWith("$2");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (isLegacyHash(hash)) {
    return crypto.timingSafeEqual(Buffer.from(legacyHash(password)), Buffer.from(hash));
  }
  return bcrypt.compare(password, hash);
}
