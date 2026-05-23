import { count } from "drizzle-orm";
import type { DB } from "./client";
import { users } from "./schema";
import type { Env } from "../env";
import { hashPassword } from "../lib/hashPassword";
import { logger } from "../middleware/logger";

export async function seedAdmin(db: DB, env: Env) {
  const [row] = await db.select({ count: count() }).from(users);
  const hasUsers = (row?.count ?? 0) > 0;
  if (hasUsers) return;
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) return;

  const hash = await hashPassword(env.ADMIN_PASSWORD);
  await db.insert(users).values({
    username: env.ADMIN_USERNAME,
    passwordHash: hash,
  });

  logger.info({ username: env.ADMIN_USERNAME }, "Admin user seeded");
}
