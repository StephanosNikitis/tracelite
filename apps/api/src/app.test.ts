import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

const dbUp = { pingDatabase: async () => true };
const dbDown = { pingDatabase: async () => false };
const dbThrows = {
  pingDatabase: async (): Promise<boolean> => {
    throw new Error("secret connection details");
  },
};

describe("GET /api/v1/health", () => {
  it("returns ok with a numeric uptime", async () => {
    const res = await request(createApp(dbUp)).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.uptimeSeconds).toBe("number");
  });

  it("stays ok even when the database is down (liveness, not readiness)", async () => {
    const res = await request(createApp(dbDown)).get("/api/v1/health");
    expect(res.status).toBe(200);
  });

  it("does not advertise the framework in response headers", async () => {
    const res = await request(createApp(dbUp)).get("/api/v1/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

describe("GET /api/v1/ready", () => {
  it("returns 200 when the database responds", async () => {
    const res = await request(createApp(dbUp)).get("/api/v1/ready");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ready", checks: { database: "up" } });
  });

  it("returns 503 when the database is unreachable", async () => {
    const res = await request(createApp(dbDown)).get("/api/v1/ready");

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: "not_ready", checks: { database: "down" } });
  });

  it("returns 503 without leaking error details when the ping throws", async () => {
    const res = await request(createApp(dbThrows)).get("/api/v1/ready");

    expect(res.status).toBe(503);
    expect(JSON.stringify(res.body)).not.toContain("secret");
  });
});

describe("request body limits", () => {
  it("rejects JSON bodies larger than 100kb with 413", async () => {
    const res = await request(createApp(dbUp))
      .post("/api/v1/health")
      .send({ data: "x".repeat(200_000) });

    expect(res.status).toBe(413);
  });
});
