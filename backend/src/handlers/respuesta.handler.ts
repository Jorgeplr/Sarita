import type { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { DB } from "../db/client";
import type { Env } from "../env";
import { responses } from "../db/schema";
import { hashIp } from "../lib/hashIp";
import { parseUA } from "../lib/parseUA";
import { getClientIp } from "../lib/getClientIp";

const bodySchema = z.object({
  visitorUuid: z.string().uuid(),
  opinion: z.string().trim().max(1000).optional().nullable(),
  teEncanto: z.boolean().optional().nullable(),
  salida: z.enum(["si", "tal_vez", "no"]).optional().nullable(),
});

export async function respuestaHandler(c: Context, db: DB, env: Env) {
  const raw = await c.req.json().catch(() => ({}));
  const body = bodySchema.parse(raw);

  const ip = getClientIp(c);
  const ua = c.req.header("user-agent") ?? "";
  const parsed = parseUA(ua);

  const opinion = body.opinion?.trim() || null;
  const teEncanto = body.teEncanto ?? null;
  const salida = body.salida ?? null;

  try {
    await db.insert(responses).values({
      visitorUuid: body.visitorUuid,
      ipHash: hashIp(ip, env.IP_HASH_SALT),
      device: parsed.device,
      browser: parsed.browser,
      os: parsed.os,
      opinion,
      teEncanto,
      salida,
    });
    return c.json({ ok: true, duplicate: false }, 201);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      await db
        .update(responses)
        .set({ opinion, teEncanto, salida, respondedAt: new Date() })
        .where(eq(responses.visitorUuid, body.visitorUuid));
      return c.json({ ok: true, duplicate: true }, 200);
    }
    throw err;
  }
}
