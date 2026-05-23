import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import type { DB } from "../db/client";
import { sessions, users } from "../db/schema";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function sessionAuth(db: DB): MiddlewareHandler {
  return async (c, next) => {
    const sid = getCookie(c, "sid");
    if (!sid) {
      return c.json({ error: "Not authenticated", code: "UNAUTHED" }, 401);
    }

    const [session] = await db
      .select({
        sessionId: sessions.id,
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
        username: users.username,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.id, sid))
      .limit(1);

    if (!session || session.expiresAt < new Date()) {
      return c.json({ error: "Session expired", code: "UNAUTHED" }, 401);
    }

    db.update(sessions)
      .set({
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + THIRTY_DAYS_MS),
      })
      .where(eq(sessions.id, sid))
      .catch(() => {});

    c.set("user", { id: session.userId, username: session.username });
    await next();
  };
}
