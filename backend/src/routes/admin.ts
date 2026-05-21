import { Hono } from "hono";
import type { DB } from "../db/client";
import type { Env } from "../env";
import { adminAuth } from "../middleware/adminAuth";
import { statsHandler } from "../handlers/stats.handler";
import { visitsListHandler } from "../handlers/visitsList.handler";

export function adminRoutes(db: DB, env: Env) {
  const app = new Hono();
  app.use("/api/admin/*", adminAuth(env));
  app.get("/api/admin/stats", (c) => statsHandler(c, db));
  app.get("/api/admin/visits", (c) => visitsListHandler(c, db));
  return app;
}
