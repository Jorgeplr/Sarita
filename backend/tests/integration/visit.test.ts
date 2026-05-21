import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { setupTestStack, truncateAll, type TestStack } from "./helpers/setup";
import { _resetRateLimit } from "../../src/middleware/rateLimit";
import { visits } from "../../src/db/schema";
import { sql } from "drizzle-orm";

describe("POST /api/visit", () => {
  let stack: TestStack;

  beforeAll(async () => { stack = await setupTestStack(); }, 60_000);
  afterAll(async () => { await stack.cleanup(); }, 30_000);
  beforeEach(async () => {
    await truncateAll(stack.db);
    _resetRateLimit();
  });

  it("inserts a row with parsed UA fields", async () => {
    const res = await stack.app.request("/api/visit", {
      method: "POST",
      headers: {
        "user-agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1",
        "x-forwarded-for": "203.0.113.1",
      },
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);

    const rows = await stack.db.select().from(visits);
    expect(rows.length).toBe(1);
    expect(rows[0]?.device).toBe("mobile");
    expect(rows[0]?.os).toBe("iOS");
    expect(rows[0]?.browser).toBe("Safari");
    expect(rows[0]?.ipHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("stores null UA fields when no user-agent is sent", async () => {
    const res = await stack.app.request("/api/visit", {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.2" },
    });
    expect(res.status).toBe(201);

    const rows = await stack.db.select().from(visits);
    expect(rows[0]?.device).toBeNull();
    expect(rows[0]?.browser).toBeNull();
    expect(rows[0]?.os).toBeNull();
  });

  it("rate-limits after 10 requests from the same IP", async () => {
    for (let i = 0; i < 10; i++) {
      const res = await stack.app.request("/api/visit", {
        method: "POST",
        headers: { "x-forwarded-for": "203.0.113.3" },
      });
      expect(res.status).toBe(201);
    }
    const eleventh = await stack.app.request("/api/visit", {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.3" },
    });
    expect(eleventh.status).toBe(429);
  });

  it("does NOT rate-limit different IPs", async () => {
    for (let i = 0; i < 12; i++) {
      const res = await stack.app.request("/api/visit", {
        method: "POST",
        headers: { "x-forwarded-for": `203.0.113.${10 + i}` },
      });
      expect(res.status).toBe(201);
    }
    const [{ total }] = await stack.db
      .select({ total: sql<number>`count(*)::int` })
      .from(visits);
    expect(total).toBe(12);
  });
});
