import type { Context } from "hono";
import { z } from "zod";
import { sql, eq } from "drizzle-orm";
import type { DB } from "../db/client";
import { cualidades } from "../db/schema";

const createSchema = z.object({
  icon: z.string().min(1),
  text: z.string().min(1),
});

const updateSchema = z.object({
  icon: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
});

const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});

export async function createCualidadHandler(c: Context, db: DB) {
  const raw = await c.req.json().catch(() => ({}));
  const body = createSchema.parse(raw);

  const [row] = await db
    .select({ max: sql<number>`max(${cualidades.sortOrder})` })
    .from(cualidades);
  const nextOrder = (row?.max ?? -1) + 1;

  const [created] = await db
    .insert(cualidades)
    .values({
      icon: body.icon,
      text: body.text,
      sortOrder: nextOrder,
    })
    .returning();

  return c.json(created, 201);
}

export async function updateCualidadHandler(c: Context, db: DB) {
  const id = c.req.param("id");
  const raw = await c.req.json().catch(() => ({}));
  const body = updateSchema.parse(raw);

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (body.icon !== undefined) update.icon = body.icon;
  if (body.text !== undefined) update.text = body.text;

  const [updated] = await db
    .update(cualidades)
    .set(update)
    .where(eq(cualidades.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Not found", code: "NOT_FOUND" }, 404);
  }

  return c.json(updated);
}

export async function deleteCualidadHandler(c: Context, db: DB) {
  const id = c.req.param("id");
  const [deleted] = await db.delete(cualidades).where(eq(cualidades.id, id)).returning();
  if (!deleted) {
    return c.json({ error: "Not found", code: "NOT_FOUND" }, 404);
  }
  return c.body(null, 204);
}

export async function reorderCualidadesHandler(c: Context, db: DB) {
  const raw = await c.req.json().catch(() => ({}));
  const body = reorderSchema.parse(raw);

  const rows = await db.select({ id: cualidades.id }).from(cualidades);
  const ids = body.orderedIds;
  const existing = new Set(rows.map((r) => r.id));

  const unique = new Set(ids);
  if (rows.length !== ids.length || unique.size !== ids.length || ids.some((id) => !existing.has(id))) {
    return c.json({ error: "Invalid orderedIds", code: "INVALID_ORDER" }, 400);
  }

  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i += 1) {
      await tx.update(cualidades).set({ sortOrder: i, updatedAt: new Date() }).where(eq(cualidades.id, ids[i]));
    }
  });

  return c.body(null, 204);
}
