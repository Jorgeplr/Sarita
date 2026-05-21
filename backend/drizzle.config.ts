import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://carta:dev@localhost:5432/carta",
  },
  verbose: true,
  strict: true,
} satisfies Config;
