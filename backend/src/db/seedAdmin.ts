import { eq } from "drizzle-orm";
import type { DB } from "./client";
import { users } from "./schema";
import type { Env } from "../env";
import { hashPassword, verifyPassword } from "../lib/hashPassword";
import { logger } from "../middleware/logger";

export async function seedAdmin(db: DB, env: Env) {
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) return;

  const [existing] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.username, env.ADMIN_USERNAME))
    .limit(1);

  if (!existing) {
    const hash = await hashPassword(env.ADMIN_PASSWORD);
    await db.insert(users).values({
      username: env.ADMIN_USERNAME,
      passwordHash: hash,
    });
    logger.info({ username: env.ADMIN_USERNAME }, "Admin user seeded");
    return;
  }

  const matches = await verifyPassword(env.ADMIN_PASSWORD, existing.passwordHash);
  if (matches) return;

  const hash = await hashPassword(env.ADMIN_PASSWORD);
  await db
    .update(users)
    .set({ passwordHash: hash, updatedAt: new Date() })
    .where(eq(users.id, existing.id));
  logger.info({ username: env.ADMIN_USERNAME }, "Admin password synced from env");
}
