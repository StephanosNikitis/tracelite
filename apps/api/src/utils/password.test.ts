import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password.js";

describe("password hashing", () => {
  it("produces an argon2id hash that does not contain the plaintext", async () => {
    const hash = await hashPassword("correct horse battery staple");

    expect(hash.startsWith("$argon2id$")).toBe(true);
    expect(hash).not.toContain("correct horse");
  });

  it("uses a fresh salt, so the same password hashes differently each time", async () => {
    const [a, b] = await Promise.all([
      hashPassword("same-password"),
      hashPassword("same-password"),
    ]);

    expect(a).not.toBe(b);
    expect(await verifyPassword(a, "same-password")).toBe(true);
    expect(await verifyPassword(b, "same-password")).toBe(true);
  });

  it("accepts the correct password", async () => {
    const hash = await hashPassword("s3cret-Passw0rd");
    expect(await verifyPassword(hash, "s3cret-Passw0rd")).toBe(true);
  });

  it("rejects a wrong password, including near-misses", async () => {
    const hash = await hashPassword("s3cret-Passw0rd");

    expect(await verifyPassword(hash, "s3cret-Passw0rd ")).toBe(false);
    expect(await verifyPassword(hash, "S3cret-Passw0rd")).toBe(false);
    expect(await verifyPassword(hash, "")).toBe(false);
  });

  it("returns false instead of throwing for a malformed stored hash", async () => {
    expect(await verifyPassword("not-a-real-hash", "anything")).toBe(false);
    expect(await verifyPassword("", "anything")).toBe(false);
  });
});
