import { loadEnv } from "./env";
import { createDb } from "./db/client";
import { buildApp } from "./app";
import { logger } from "./middleware/logger";

const env = loadEnv();
const db = createDb(env.DATABASE_URL);
const app = buildApp({ db, env });

const server = Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
});

logger.info({ port: server.port, env: env.NODE_ENV }, "Backend listening");
