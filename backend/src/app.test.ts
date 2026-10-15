import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { loadAppEnv } from "./config/env.js";

const app = createApp(
  loadAppEnv({
    NODE_ENV: "test",
    PUBLIC_BASE_URL: "https://campus.example/wimp",
    FRONTEND_ORIGIN: "http://localhost:5173",
    SESSION_SECRET: "test-session-secret",
  }),
);

describe("foundation API", () => {
  it("returns health", async () => {
    const response = await request(app).get("/api/v1/health");
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  it("exposes the configured public base URL without secrets", async () => {
    const response = await request(app).get("/api/v1/meta");
    expect(response.status).toBe(200);
    expect(response.body.publicBaseUrl).toBe("https://campus.example/wimp");
    expect(response.body.locationTracking).toBe(false);
    expect(JSON.stringify(response.body)).not.toMatch(/SESSION_SECRET|password/i);
  });

  it("returns a structured 404", async () => {
    const response = await request(app).get("/api/v1/does-not-exist");
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });
});
