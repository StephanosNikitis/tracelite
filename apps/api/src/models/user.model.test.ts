import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { User } from "./user.model.js";
import { clearDb, connectTestDb, disconnectTestDb } from "../test/db.js";

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
beforeEach(clearDb);

describe("User model", () => {
  it("lowercases and trims the email before saving", async () => {
    const user = await User.create({ email: "  Alice@Example.COM ", passwordHash: "hash" });
    expect(user.email).toBe("alice@example.com");
  });

  it("rejects a duplicate email, even with different casing", async () => {
    await User.create({ email: "alice@example.com", passwordHash: "hash" });

    await expect(
      User.create({ email: "ALICE@example.com", passwordHash: "hash" }),
    ).rejects.toMatchObject({ code: 11000 });
  });

  it("lets only one of two simultaneous inserts with the same email succeed", async () => {
    const results = await Promise.allSettled([
      User.create({ email: "race@example.com", passwordHash: "hash" }),
      User.create({ email: "race@example.com", passwordHash: "hash" }),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(await User.countDocuments({ email: "race@example.com" })).toBe(1);
  });

  it("requires both an email and a password hash", async () => {
    await expect(User.create({ email: "a@example.com" })).rejects.toThrow(/passwordHash/);
    await expect(User.create({ passwordHash: "hash" })).rejects.toThrow(/email/);
  });

  it("omits the password hash from query results unless explicitly selected", async () => {
    const created = await User.create({ email: "alice@example.com", passwordHash: "secret-hash" });

    const plain = await User.findById(created._id);
    expect(plain?.passwordHash).toBeUndefined();

    const withHash = await User.findById(created._id).select("+passwordHash");
    expect(withHash?.passwordHash).toBe("secret-hash");
  });

  it("never includes the password hash when serialized to JSON", async () => {
    const created = await User.create({ email: "alice@example.com", passwordHash: "secret-hash" });
    const json = created.toJSON();

    expect(json).not.toHaveProperty("passwordHash");
    expect(JSON.stringify(json)).not.toContain("secret-hash");
  });

  it("records creation and update timestamps", async () => {
    const user = await User.create({ email: "alice@example.com", passwordHash: "hash" });

    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });
});
