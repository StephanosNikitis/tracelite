import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

describe("GET /api/v1/health", () => {
  it("returns ok with a numeric uptime", async () => {
    const res = await request(createApp()).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.uptimeSeconds).toBe("number");
  });

  it("does not advertise the framework in response headers", async () => {
    const res = await request(createApp()).get("/api/v1/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

describe("request body limits", () => {
  it("rejects JSON bodies larger than 100kb with 413", async () => {
    const res = await request(createApp())
      .post("/api/v1/health")
      .send({ data: "x".repeat(200_000) });

    expect(res.status).toBe(413);
  });
});
