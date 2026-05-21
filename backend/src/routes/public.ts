import { Hono } from "hono";
import type { DB } from "../db/client";
import type { Env } from "../env";
import { rateLimit } from "../middleware/rateLimit";
import { visitHandler } from "../handlers/visit.handler";
import { respuestaHandler } from "../handlers/respuesta.handler";

export function publicRoutes(db: DB, env: Env) {
  const app = new Hono();
  app.post(
    "/api/visit",
    rateLimit({ max: 10, windowMs: 60_000 }),
    (c) => visitHandler(c, db, env)
  );
  app.post(
    "/api/respuesta",
    rateLimit({ max: 5, windowMs: 60_000 }),
    (c) => respuestaHandler(c, db, env)
  );
  return app;
}
