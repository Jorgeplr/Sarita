import type { Context } from "hono";
import { sql, desc, and, gte, lte, eq, SQL } from "drizzle-orm";
import type { DB } from "../db/client";
import { visits } from "../db/schema";

export async function visitsListHandler(c: Context, db: DB) {
  const limitRaw = parseInt(c.req.query("limit") ?? "50", 10);
  const offsetRaw = parseInt(c.req.query("offset") ?? "0", 10);
  const limit = Math.max(1, Math.min(200, isNaN(limitRaw) ? 50 : limitRaw));
  const offset = Math.max(0, isNaN(offsetRaw) ? 0 : offsetRaw);

  const device = c.req.query("device") ?? undefined;
  const from = c.req.query("from") ? new Date(c.req.query("from") as string) : undefined;
  const to = c.req.query("to") ? new Date(c.req.query("to") as string) : undefined;
  const conditions: SQL[] = [
    device ? eq(visits.device, device) : undefined,
    from && !isNaN(from.getTime()) ? gte(visits.visitedAt, from) : undefined,
    to && !isNaN(to.getTime()) ? lte(visits.visitedAt, to) : undefined,
  ].filter(Boolean) as SQL[];
  const whereClause = conditions.length ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(visits)
    .where(whereClause);

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
    .where(whereClause)
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
