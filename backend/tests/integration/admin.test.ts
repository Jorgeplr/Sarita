import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { setupTestStack, truncateAll, type TestStack } from "./helpers/setup";
import { _resetRateLimit } from "../../src/middleware/rateLimit";

describe("GET /api/admin/*", () => {
  let stack: TestStack;

  beforeAll(async () => { stack = await setupTestStack(); }, 60_000);
  afterAll(async () => { await stack.cleanup(); }, 30_000);
  beforeEach(async () => {
    await truncateAll(stack.db);
    _resetRateLimit();
  });

  async function seed() {
    await stack.app.request("/api/visit", {
      method: "POST",
      headers: { "x-forwarded-for": "10.0.0.1", "user-agent": "Mozilla/5.0 (iPhone)" },
    });
    await stack.app.request("/api/visit", {
      method: "POST",
      headers: { "x-forwarded-for": "10.0.0.2" },
    });
    await stack.app.request("/api/respuesta", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "10.0.0.1" },
      body: JSON.stringify({ visitorUuid: "550e8400-e29b-41d4-a716-446655440000" }),
    });
  }

  it("rejects request with no Authorization header (401)", async () => {
    const res = await stack.app.request("/api/admin/stats");
    expect(res.status).toBe(401);
  });

  it("rejects request with wrong token (401)", async () => {
    const res = await stack.app.request("/api/admin/stats", {
      headers: { authorization: "Bearer wrong" },
    });
    expect(res.status).toBe(401);
  });

  it("returns stats with correct counts", async () => {
    await seed();
    const res = await stack.app.request("/api/admin/stats", {
      headers: { authorization: `Bearer ${stack.env.ADMIN_TOKEN}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totalVisits).toBe(2);
    expect(body.uniqueVisitors).toBe(2);
    expect(body.totalResponses).toBe(1);
    expect(body.responsesPreview.length).toBe(1);
    expect(body.firstVisitAt).toBeDefined();
    expect(body.lastVisitAt).toBeDefined();
  });

  it("returns paginated visits with ipHashPrefix only", async () => {
    await seed();
    const res = await stack.app.request("/api/admin/visits?limit=10&offset=0", {
      headers: { authorization: `Bearer ${stack.env.ADMIN_TOKEN}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(2);
    expect(body.limit).toBe(10);
    expect(body.offset).toBe(0);
    expect(body.items.length).toBe(2);
    expect(body.items[0].ipHashPrefix).toMatch(/^[0-9a-f]{8}$/);
    expect(body.items[0]).not.toHaveProperty("ipHash");
  });

  it("clamps limit to 200", async () => {
    const res = await stack.app.request("/api/admin/visits?limit=9999", {
      headers: { authorization: `Bearer ${stack.env.ADMIN_TOKEN}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.limit).toBe(200);
  });
});
