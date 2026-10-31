import argon2 from "argon2";

const HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456, // KiB (about 19 MiB)
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, HASH_OPTIONS);
}

export async function verifyPassword(storedHash: string, attempt: string): Promise<boolean> {
  try {
    return await argon2.verify(storedHash, attempt);
  } catch {
    return false;
  }
}
