import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { setupTestStack, truncateAll, type TestStack } from "./helpers/setup";
import { _resetRateLimit } from "../../src/middleware/rateLimit";
import { responses } from "../../src/db/schema";

describe("POST /api/respuesta", () => {
  let stack: TestStack;

  beforeAll(async () => { stack = await setupTestStack(); }, 60_000);
  afterAll(async () => { await stack.cleanup(); }, 30_000);
  beforeEach(async () => {
    await truncateAll(stack.db);
    _resetRateLimit();
  });

  const validUuid = "550e8400-e29b-41d4-a716-446655440000";

  it("inserts a row on first call with a new UUID", async () => {
    const res = await stack.app.request("/api/respuesta", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" },
      body: JSON.stringify({ visitorUuid: validUuid }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ ok: true, duplicate: false });

    const rows = await stack.db.select().from(responses);
    expect(rows.length).toBe(1);
    expect(rows[0]?.visitorUuid).toBe(validUuid);
  });

  it("returns 200 duplicate:true on second call with same UUID without inserting", async () => {
    const make = () =>
      stack.app.request("/api/respuesta", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" },
        body: JSON.stringify({ visitorUuid: validUuid }),
      });

    const first = await make();
    expect(first.status).toBe(201);
    const second = await make();
    expect(second.status).toBe(200);
    const body = await second.json();
    expect(body).toEqual({ ok: true, duplicate: true });

    const rows = await stack.db.select().from(responses);
    expect(rows.length).toBe(1);
  });

  it("rejects invalid UUID with 400", async () => {
    const res = await stack.app.request("/api/respuesta", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitorUuid: "not-a-uuid" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("rejects empty body with 400", async () => {
    const res = await stack.app.request("/api/respuesta", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    expect(res.status).toBe(400);
  });

  it("rate-limits after 5 requests from same IP", async () => {
    for (let i = 0; i < 5; i++) {
      const uuid = `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`;
      const res = await stack.app.request("/api/respuesta", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "5.5.5.5" },
        body: JSON.stringify({ visitorUuid: uuid }),
      });
      expect(res.status).toBe(201);
    }
    const sixth = await stack.app.request("/api/respuesta", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "5.5.5.5" },
      body: JSON.stringify({ visitorUuid: "00000000-0000-4000-8000-999999999999" }),
    });
    expect(sixth.status).toBe(429);
  });
});
