import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { setupTestStack, type TestStack } from "./helpers/setup";

describe("GET /api/health", () => {
  let stack: TestStack;

  beforeAll(async () => { stack = await setupTestStack(); }, 60_000);
  afterAll(async () => { await stack.cleanup(); }, 30_000);

  it("returns 200 with status ok when DB is healthy", async () => {
    const res = await stack.app.request("/api/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ status: "ok", db: "connected", version: "1.0.0" });
  });
});
