import type { Context } from "hono";
import { sql } from "drizzle-orm";
import type { DB } from "../db/client";
import { visits } from "../db/schema";

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export async function visitsPerDayHandler(c: Context, db: DB) {
  const rawDays = parseInt(c.req.query("days") ?? "7", 10);
  const days = clampInt(isNaN(rawDays) ? 7 : rawDays, 1, 90);

  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${visits.visitedAt}), 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
      uniqueVisitors: sql<number>`count(distinct ${visits.ipHash})::int`,
    })
    .from(visits)
    .where(sql`${visits.visitedAt} >= ${since}`)
    .groupBy(sql`date_trunc('day', ${visits.visitedAt})`)
    .orderBy(sql`date_trunc('day', ${visits.visitedAt})`);

  return c.json(rows);
}

function mapBreakdown(rows: Array<{ key: string | null; count: number }>) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = row.key || "unknown";
    acc[key] = row.count;
    return acc;
  }, {});
}

export async function breakdownHandler(c: Context, db: DB) {
  const devices = await db
    .select({ key: visits.device, count: sql<number>`count(*)::int` })
    .from(visits)
    .groupBy(visits.device);

  const browsers = await db
    .select({ key: visits.browser, count: sql<number>`count(*)::int` })
    .from(visits)
    .groupBy(visits.browser);

  const oss = await db
    .select({ key: visits.os, count: sql<number>`count(*)::int` })
    .from(visits)
    .groupBy(visits.os);

  return c.json({
    devices: mapBreakdown(devices),
    browsers: mapBreakdown(browsers),
    oss: mapBreakdown(oss),
  });
}
