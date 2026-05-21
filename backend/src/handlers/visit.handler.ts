import type { Context } from "hono";
import type { DB } from "../db/client";
import type { Env } from "../env";
import { visits } from "../db/schema";
import { hashIp } from "../lib/hashIp";
import { parseUA } from "../lib/parseUA";
import { getClientIp } from "../lib/getClientIp";

export async function visitHandler(c: Context, db: DB, env: Env) {
  const ip = getClientIp(c);
  const ua = c.req.header("user-agent") ?? "";
  const parsed = parseUA(ua);

  await db.insert(visits).values({
    ipHash: hashIp(ip, env.IP_HASH_SALT),
    userAgent: ua || null,
    device: parsed.device,
    browser: parsed.browser,
    os: parsed.os,
  });

  return c.json({ ok: true }, 201);
}
