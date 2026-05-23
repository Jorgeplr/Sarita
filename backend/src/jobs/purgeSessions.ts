import { lt } from "drizzle-orm";
import type { DB } from "../db/client";
import { sessions } from "../db/schema";
import { logger } from "../middleware/logger";

export function startSessionPurger(db: DB) {
  const run = async () => {
    try {
      const result = await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
      logger.debug({ purged: result.rowCount ?? 0 }, "Purged expired sessions");
    } catch (err) {
      logger.error({ err }, "Session purge failed");
    }
  };

  run();
  setInterval(run, 3_600_000);
}
