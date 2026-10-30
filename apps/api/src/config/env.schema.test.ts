import { describe, expect, it } from "vitest";
import { parseEnv } from "./env.schema.js";

const valid = {
  MONGODB_URI: "mongodb://localhost:27018/tracelite?replicaSet=rs0",
  REDIS_URL: "redis://localhost:6379",
};

describe("parseEnv", () => {
  it("applies defaults for optional variables", () => {
    const env = parseEnv(valid);
    expect(env.API_PORT).toBe(4000);
    expect(env.NODE_ENV).toBe("development");
  });

  it("converts the port from a string to a number", () => {
    expect(parseEnv({ ...valid, API_PORT: "5001" }).API_PORT).toBe(5001);
  });

  it("throws and names the variable when a required value is missing", () => {
    expect(() => parseEnv({ REDIS_URL: valid.REDIS_URL })).toThrow(/MONGODB_URI/);
  });

  it("rejects a MongoDB URI with the wrong scheme", () => {
    expect(() => parseEnv({ ...valid, MONGODB_URI: "http://localhost" })).toThrow(/MONGODB_URI/);
  });

  it("rejects an out-of-range port", () => {
    expect(() => parseEnv({ ...valid, API_PORT: "70000" })).toThrow(/API_PORT/);
  });
});
