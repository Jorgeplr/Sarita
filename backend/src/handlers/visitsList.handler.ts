import type { Context } from "hono";
import { sql, desc } from "drizzle-orm";
import type { DB } from "../db/client";
import { visits } from "../db/schema";

export async function visitsListHandler(c: Context, db: DB) {
  const limitRaw = parseInt(c.req.query("limit") ?? "50", 10);
  const offsetRaw = parseInt(c.req.query("offset") ?? "0", 10);
  const limit = Math.max(1, Math.min(200, isNaN(limitRaw) ? 50 : limitRaw));
  const offset = Math.max(0, isNaN(offsetRaw) ? 0 : offsetRaw);

  const [totalRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(visits);

  const rows = await db
    .select({
      id: visits.id,
      visitedAt: visits.visitedAt,
      device: visits.device,
      browser: visits.browser,
      os: visits.os,
      ipHash: visits.ipHash,
    })
    .from(visits)
    .orderBy(desc(visits.visitedAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    total: totalRow?.total ?? 0,
    limit,
    offset,
    items: rows.map((r) => ({
      id: r.id,
      visitedAt: r.visitedAt,
      device: r.device,
      browser: r.browser,
      os: r.os,
      ipHashPrefix: r.ipHash.slice(0, 8),
    })),
  });
}
