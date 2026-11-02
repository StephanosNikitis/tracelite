import { describe, expect, it } from "vitest";
import { registerSchema, type RegisterInput } from "@tracelite/shared";

describe("@tracelite/shared wiring", () => {
  it("is importable from the API, with working runtime code and types", () => {
    const input: RegisterInput = registerSchema.parse({
      email: " A@B.CO ",
      password: "a-long-enough-passphrase",
    });

    expect(input.email).toBe("a@b.co");
  });
});
