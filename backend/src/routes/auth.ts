import { Hono } from "hono";
import type { DB } from "../db/client";
import type { Env } from "../env";
import { rateLimit } from "../middleware/rateLimit";
import { sessionAuth } from "../middleware/sessionAuth";
import { loginHandler, logoutHandler, meHandler, changePasswordHandler } from "../handlers/auth.handler";

export function authRoutes(db: DB, env: Env) {
  const app = new Hono();

  app.post("/api/auth/login", rateLimit({ max: 5, windowMs: 60_000 }), (c) =>
    loginHandler(c, db, env)
  );
  app.post("/api/auth/logout", sessionAuth(db), (c) => logoutHandler(c, db, env));
  app.get("/api/auth/me", sessionAuth(db), (c) => meHandler(c));
  app.post("/api/auth/change-password", sessionAuth(db), (c) => changePasswordHandler(c, db));

  return app;
}
