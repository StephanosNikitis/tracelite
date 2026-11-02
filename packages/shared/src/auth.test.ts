import { describe, expect, it } from "vitest";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, loginSchema, registerSchema } from "./auth.js";

const goodPassword = "a-long-enough-passphrase";
const register = (email: unknown, password: unknown) =>
  registerSchema.safeParse({ email, password });

describe("registerSchema", () => {
  it("trims and lowercases the email", () => {
    const result = registerSchema.parse({ email: "  Alice@Example.COM ", password: goodPassword });
    expect(result.email).toBe("alice@example.com");
  });

  it("rejects invalid emails", () => {
    for (const email of ["", "plain", "a@", "@b.com", "a b@c.com"]) {
      expect(register(email, goodPassword).success, `email: "${email}"`).toBe(false);
    }
  });

  it("rejects an email longer than 254 characters", () => {
    expect(register(`${"a".repeat(250)}@x.com`, goodPassword).success).toBe(false);
  });

  it("enforces the minimum password length at the boundary", () => {
    expect(register("a@b.co", "x".repeat(PASSWORD_MIN_LENGTH - 1)).success).toBe(false);
    expect(register("a@b.co", "x".repeat(PASSWORD_MIN_LENGTH)).success).toBe(true);
  });

  it("enforces the maximum password length at the boundary", () => {
    expect(register("a@b.co", "x".repeat(PASSWORD_MAX_LENGTH)).success).toBe(true);
    expect(register("a@b.co", "x".repeat(PASSWORD_MAX_LENGTH + 1)).success).toBe(false);
  });

  it("does not trim or otherwise alter the password", () => {
    const password = "  spaces are allowed  ";
    expect(registerSchema.parse({ email: "a@b.co", password }).password).toBe(password);
  });

  it("strips unknown fields instead of passing them through", () => {
    const result = registerSchema.parse({ email: "a@b.co", password: goodPassword, isAdmin: true });
    expect(result).not.toHaveProperty("isAdmin");
  });

  it("rejects non-string values, including NoSQL operator objects", () => {
    expect(register(123, goodPassword).success).toBe(false);
    expect(register("a@b.co", { $gt: "" }).success).toBe(false);
    expect(register({ $gt: "" }, goodPassword).success).toBe(false);
    expect(registerSchema.safeParse({}).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a short password, because login must not enforce the signup policy", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "short" }).success).toBe(true);
  });

  it("rejects an empty password and an oversized one", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
    const huge = "x".repeat(PASSWORD_MAX_LENGTH + 1);
    expect(loginSchema.safeParse({ email: "a@b.co", password: huge }).success).toBe(false);
  });

  it("normalizes the email exactly like registration", () => {
    expect(loginSchema.parse({ email: " BOB@X.COM", password: "p" }).email).toBe("bob@x.com");
  });
});
