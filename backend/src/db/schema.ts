import { pgTable, uuid, timestamp, text, index } from "drizzle-orm/pg-core";

export const visits = pgTable(
  "visits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    visitedAt: timestamp("visited_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    ipHash: text("ip_hash").notNull(),
    userAgent: text("user_agent"),
    device: text("device"),
    browser: text("browser"),
    os: text("os"),
  },
  (t) => ({
    visitedAtIdx: index("idx_visits_visited_at").on(t.visitedAt.desc()),
    ipHashIdx: index("idx_visits_ip_hash").on(t.ipHash),
  })
);

export const responses = pgTable(
  "responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    respondedAt: timestamp("responded_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    visitorUuid: text("visitor_uuid").notNull().unique(),
    ipHash: text("ip_hash").notNull(),
    device: text("device"),
    browser: text("browser"),
    os: text("os"),
  },
  (t) => ({
    respondedAtIdx: index("idx_responses_responded_at").on(t.respondedAt.desc()),
  })
);

export type Visit = typeof visits.$inferSelect;
export type NewVisit = typeof visits.$inferInsert;
export type Response = typeof responses.$inferSelect;
export type NewResponse = typeof responses.$inferInsert;
