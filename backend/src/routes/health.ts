import { Hono } from "hono";
import type { DB } from "../db/client";
import { healthHandler } from "../handlers/health.handler";

export function healthRoutes(db: DB) {
  const app = new Hono();
  app.get("/api/health", (c) => healthHandler(c, db));
  return app;
}
