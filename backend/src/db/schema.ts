import { pgEnum, pgTable, uuid, timestamp, text, index, integer, boolean } from "drizzle-orm/pg-core";

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
    opinion: text("opinion"),
    teEncanto: boolean("te_encanto"),
    salida: text("salida"),
  },
  (t) => ({
    respondedAtIdx: index("idx_responses_responded_at").on(t.respondedAt.desc()),
  })
);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    expiresIdx: index("idx_sessions_expires_at").on(t.expiresAt),
  })
);

export const cualidades = pgTable(
  "cualidades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    icon: text("icon").notNull(),
    text: text("text").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    orderIdx: index("idx_cualidades_sort_order").on(t.sortOrder),
  })
);

export const fotos = pgTable(
  "fotos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    filename: text("filename").notNull(),
    thumbFilename: text("thumb_filename").notNull(),
    originalName: text("original_name"),
    caption: text("caption"),
    sortOrder: integer("sort_order").notNull().default(0),
    sizeBytes: integer("size_bytes").notNull(),
    widthPx: integer("width_px").notNull(),
    heightPx: integer("height_px").notNull(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    orderIdx: index("idx_fotos_sort_order").on(t.sortOrder),
  })
);

export const cancionKind = pgEnum("cancion_kind", ["fondo", "playlist"]);

export const canciones = pgTable(
  "canciones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: cancionKind("kind").notNull(),
    filename: text("filename").notNull(),
    title: text("title").notNull(),
    artist: text("artist").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    sizeBytes: integer("size_bytes").notNull(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    kindIdx: index("idx_canciones_kind").on(t.kind),
  })
);

export type Visit = typeof visits.$inferSelect;
export type NewVisit = typeof visits.$inferInsert;
export type Response = typeof responses.$inferSelect;
export type NewResponse = typeof responses.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Cualidad = typeof cualidades.$inferSelect;
export type NewCualidad = typeof cualidades.$inferInsert;
export type Foto = typeof fotos.$inferSelect;
export type NewFoto = typeof fotos.$inferInsert;
export type Cancion = typeof canciones.$inferSelect;
export type NewCancion = typeof canciones.$inferInsert;
