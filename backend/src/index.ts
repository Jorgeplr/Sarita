import { loadEnv } from "./env";
import { createDb } from "./db/client";
import { buildApp } from "./app";
import { logger } from "./middleware/logger";
import { seedAdmin } from "./db/seedAdmin";
import { ensureMediaDirs } from "./lib/storage";
import { startSessionPurger } from "./jobs/purgeSessions";

async function main() {
  const env = loadEnv();
  const db = createDb(env.DATABASE_URL);

  await ensureMediaDirs();
  await seedAdmin(db, env);

  const app = buildApp({ db, env });
  const server = Bun.serve({
    port: env.PORT,
    fetch: app.fetch,
  });

  startSessionPurger(db);
  logger.info({ port: server.port, env: env.NODE_ENV }, "Backend listening");
}

main();
