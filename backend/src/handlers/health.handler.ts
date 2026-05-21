import type { Context } from "hono";
import { sql } from "drizzle-orm";
import type { DB } from "../db/client";

const VERSION = "1.0.0";

export async function healthHandler(c: Context, db: DB) {
  try {
    await Promise.race([
      db.execute(sql`SELECT 1`),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB timeout")), 1000)
      ),
    ]);
    return c.json({ status: "ok", db: "connected", version: VERSION }, 200);
  } catch {
    return c.json({ status: "degraded", db: "disconnected", version: VERSION }, 503);
  }
}
