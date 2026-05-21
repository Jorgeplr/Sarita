import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type DB = ReturnType<typeof createDb>;

export function createDb(connectionString: string) {
  const sql = postgres(connectionString, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
  });
  return drizzle(sql, { schema });
}

export type { schema };
