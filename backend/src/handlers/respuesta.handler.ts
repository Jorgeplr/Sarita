import type { Context } from "hono";
import { z } from "zod";
import type { DB } from "../db/client";
import type { Env } from "../env";
import { responses } from "../db/schema";
import { hashIp } from "../lib/hashIp";
import { parseUA } from "../lib/parseUA";
import { getClientIp } from "../lib/getClientIp";

const bodySchema = z.object({
  visitorUuid: z.string().uuid(),
});

export async function respuestaHandler(c: Context, db: DB, env: Env) {
  const raw = await c.req.json().catch(() => ({}));
  const body = bodySchema.parse(raw);

  const ip = getClientIp(c);
  const ua = c.req.header("user-agent") ?? "";
  const parsed = parseUA(ua);

  try {
    await db.insert(responses).values({
      visitorUuid: body.visitorUuid,
      ipHash: hashIp(ip, env.IP_HASH_SALT),
      device: parsed.device,
      browser: parsed.browser,
      os: parsed.os,
    });
    return c.json({ ok: true, duplicate: false }, 201);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      return c.json({ ok: true, duplicate: true }, 200);
    }
    throw err;
  }
}
