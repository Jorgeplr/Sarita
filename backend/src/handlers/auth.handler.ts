import type { Context } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import type { DB } from "../db/client";
import type { Env } from "../env";
import { sessions, users } from "../db/schema";
import { hashPassword, verifyPassword } from "../lib/hashPassword";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const changeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;
const THIRTY_DAYS_MS = THIRTY_DAYS_SECONDS * 1000;

function isSecureOrigin(env: Env): boolean {
  return env.ADMIN_ORIGIN.startsWith("https://");
}

function setSessionCookie(c: Context, env: Env, sid: string) {
  setCookie(c, "sid", sid, {
    httpOnly: true,
    secure: isSecureOrigin(env),
    sameSite: "Lax",
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
  });
}

function clearSessionCookie(c: Context, env: Env) {
  setCookie(c, "sid", "", {
    httpOnly: true,
    secure: isSecureOrigin(env),
    sameSite: "Lax",
    path: "/",
    maxAge: 0,
  });
}

export async function loginHandler(c: Context, db: DB, env: Env) {
  const raw = await c.req.json().catch(() => ({}));
  const body = loginSchema.parse(raw);

  const [user] = await db
    .select({ id: users.id, username: users.username, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.username, body.username))
    .limit(1);

  if (!user) {
    return c.json({ error: "Invalid credentials", code: "INVALID_CREDENTIALS" }, 401);
  }

  const ok = await verifyPassword(body.password, user.passwordHash);
  if (!ok) {
    return c.json({ error: "Invalid credentials", code: "INVALID_CREDENTIALS" }, 401);
  }

  const sid = randomBytes(32).toString("hex");
  await db.insert(sessions).values({
    id: sid,
    userId: user.id,
    expiresAt: new Date(Date.now() + THIRTY_DAYS_MS),
  });

  setSessionCookie(c, env, sid);
  return c.json({ user: { id: user.id, username: user.username } });
}

export async function logoutHandler(c: Context, db: DB, env: Env) {
  const sid = getCookie(c, "sid");
  if (sid) {
    await db.delete(sessions).where(eq(sessions.id, sid));
  }
  clearSessionCookie(c, env);
  return c.json({ ok: true });
}

export async function meHandler(c: Context) {
  const user = c.get("user") as { id: string; username: string } | undefined;
  if (!user) {
    return c.json({ error: "Not authenticated", code: "UNAUTHED" }, 401);
  }
  return c.json({ user });
}

export async function changePasswordHandler(c: Context, db: DB) {
  const user = c.get("user") as { id: string; username: string } | undefined;
  if (!user) {
    return c.json({ error: "Not authenticated", code: "UNAUTHED" }, 401);
  }

  const raw = await c.req.json().catch(() => ({}));
  const body = changeSchema.parse(raw);

  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!row) {
    return c.json({ error: "Not authenticated", code: "UNAUTHED" }, 401);
  }

  const ok = await verifyPassword(body.currentPassword, row.passwordHash);
  if (!ok) {
    return c.json({ error: "Invalid credentials", code: "INVALID_CREDENTIALS" }, 401);
  }

  const nextHash = await hashPassword(body.newPassword);
  await db
    .update(users)
    .set({ passwordHash: nextHash, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  return c.body(null, 204);
}
