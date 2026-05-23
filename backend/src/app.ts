import { Hono } from "hono";
import { cors } from "hono/cors";
import type { DB } from "./db/client";
import type { Env } from "./env";
import { loggerMiddleware } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import { healthRoutes } from "./routes/health";
import { publicRoutes } from "./routes/public";
import { adminRoutes } from "./routes/admin";
import { authRoutes } from "./routes/auth";
import { contentRoutes } from "./routes/content";
import { adminCrudRoutes } from "./routes/adminCrud";
import { mediaRoutes } from "./routes/media";
import { metricsRoutes } from "./routes/metrics";

export function buildApp(deps: { db: DB; env: Env }): Hono {
  const app = new Hono();

  app.onError(errorHandler);
  app.use("*", loggerMiddleware);
  const allowedOrigins = new Set([deps.env.FRONTEND_ORIGIN, deps.env.ADMIN_ORIGIN]);
  app.use(
    "*",
    cors({
      origin: (origin) => (origin && allowedOrigins.has(origin) ? origin : undefined),
      credentials: true,
    })
  );

  app.route("/", healthRoutes(deps.db));
  app.route("/", publicRoutes(deps.db, deps.env));
  app.route("/", authRoutes(deps.db, deps.env));
  app.route("/", contentRoutes(deps.db));
  app.route("/", adminCrudRoutes(deps.db));
  app.route("/", mediaRoutes());
  app.route("/", metricsRoutes(deps.db));
  app.route("/", adminRoutes(deps.db, deps.env));

  return app;
}
