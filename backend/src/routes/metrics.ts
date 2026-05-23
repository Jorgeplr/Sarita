import { Hono } from "hono";
import type { DB } from "../db/client";
import { sessionAuth } from "../middleware/sessionAuth";
import { breakdownHandler, visitsPerDayHandler } from "../handlers/metrics.handler";

export function metricsRoutes(db: DB) {
  const app = new Hono();
  app.use("/api/admin/metrics/*", sessionAuth(db));
  app.get("/api/admin/metrics/visits-per-day", (c) => visitsPerDayHandler(c, db));
  app.get("/api/admin/metrics/breakdown", (c) => breakdownHandler(c, db));
  return app;
}
