import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { createDb, type DB } from "../../../src/db/client";
import { buildApp } from "../../../src/app";
import { _resetRateLimit } from "../../../src/middleware/rateLimit";
import type { Env } from "../../../src/env";
import type { Hono } from "hono";

const TEST_DB_URL =
  process.env.TEST_DATABASE_URL ??
  "postgres://carta:dev@localhost:5434/carta_test";

export interface TestStack {
  db: DB;
  app: Hono;
  env: Env;
  cleanup: () => Promise<void>;
}

export async function setupTestStack(): Promise<TestStack> {
  const migrationSql = postgres(TEST_DB_URL, { max: 1 });
  await migrate(drizzle(migrationSql), { migrationsFolder: "./drizzle" });
  await migrationSql.end();

  const db = createDb(TEST_DB_URL);

  const env: Env = {
    NODE_ENV: "test",
    PORT: 0,
    DATABASE_URL: TEST_DB_URL,
    IP_HASH_SALT: "test-salt-".padEnd(40, "x"),
    ADMIN_TOKEN: "test-token-".padEnd(40, "y"),
    FRONTEND_ORIGIN: "http://localhost",
  };

  const app = buildApp({ db, env });

  _resetRateLimit();
  await db.execute(sql`TRUNCATE TABLE visits, responses RESTART IDENTITY CASCADE`);

  return {
    db,
    app,
    env,
    cleanup: async () => {
      _resetRateLimit();
    },
  };
}

export async function truncateAll(db: DB) {
  await db.execute(sql`TRUNCATE TABLE visits, responses RESTART IDENTITY CASCADE`);
}
