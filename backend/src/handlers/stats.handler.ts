import type { Context } from "hono";
import { sql, desc, countDistinct } from "drizzle-orm";
import type { DB } from "../db/client";
import { visits, responses } from "../db/schema";

export async function statsHandler(c: Context, db: DB) {
  const [vRow] = await db
    .select({
      total: sql<number>`count(*)::int`,
      unique: countDistinct(visits.ipHash),
      first: sql<Date | null>`min(${visits.visitedAt})`,
      last: sql<Date | null>`max(${visits.visitedAt})`,
    })
    .from(visits);

  const [rRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(responses);

  const preview = await db
    .select({
      respondedAt: responses.respondedAt,
      visitorUuid: responses.visitorUuid,
      device: responses.device,
      browser: responses.browser,
      os: responses.os,
      opinion: responses.opinion,
      teEncanto: responses.teEncanto,
      salida: responses.salida,
    })
    .from(responses)
    .orderBy(desc(responses.respondedAt))
    .limit(10);

  return c.json({
    totalVisits: vRow?.total ?? 0,
    uniqueVisitors: vRow?.unique ?? 0,
    totalResponses: rRow?.total ?? 0,
    firstVisitAt: vRow?.first ?? null,
    lastVisitAt: vRow?.last ?? null,
    responsesPreview: preview,
  });
}
