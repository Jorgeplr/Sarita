import { Hono } from "hono";
import { cors } from "hono/cors";
import type { DB } from "./db/client";
import type { Env } from "./env";
import { loggerMiddleware } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import { healthRoutes } from "./routes/health";
import { publicRoutes } from "./routes/public";
import { adminRoutes } from "./routes/admin";

export function buildApp(deps: { db: DB; env: Env }): Hono {
  const app = new Hono();

  app.onError(errorHandler);
  app.use("*", loggerMiddleware);
  app.use("*", cors({ origin: deps.env.FRONTEND_ORIGIN }));

  app.route("/", healthRoutes(deps.db));
  app.route("/", publicRoutes(deps.db, deps.env));
  app.route("/", adminRoutes(deps.db, deps.env));

  return app;
}
