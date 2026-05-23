import type { Context } from "hono";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import type { DB } from "../db/client";
import { fotos } from "../db/schema";
import { processImage } from "../lib/processImage";
import { deleteFoto as deleteFotoFile, saveFoto } from "../lib/storage";

const MAX_BYTES = 15 * 1024 * 1024;

const updateSchema = z.object({
  caption: z.string().optional(),
});

const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});

function isValidImageType(type: string) {
  return type.startsWith("image/");
}

export async function uploadFotoHandler(c: Context, db: DB) {
  const body = await c.req.parseBody();
  const file = body.file;
  const caption = typeof body.caption === "string" ? body.caption : undefined;

  if (!(file instanceof File)) {
    return c.json({ error: "Missing file", code: "MISSING_FILE" }, 400);
  }

  if (!isValidImageType(file.type)) {
    return c.json({ error: "Invalid file type", code: "INVALID_FILE" }, 400);
  }

  if (file.size > MAX_BYTES) {
    return c.json({ error: "File too large", code: "FILE_TOO_LARGE" }, 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const processed = await processImage(buffer);

  const fileId = crypto.randomUUID();
  await saveFoto(fileId, processed.main, processed.thumb);

  const [row] = await db
    .select({ max: sql<number>`max(${fotos.sortOrder})` })
    .from(fotos);
  const nextOrder = (row?.max ?? -1) + 1;

  const [created] = await db
    .insert(fotos)
    .values({
      filename: `${fileId}.webp`,
      thumbFilename: `${fileId}.thumb.webp`,
      originalName: file.name || null,
      caption: caption ?? null,
      sortOrder: nextOrder,
      sizeBytes: processed.main.length,
      widthPx: processed.width,
      heightPx: processed.height,
    })
    .returning();

  return c.json(
    {
      ...created,
      url: `/api/media/foto/${created.filename}`,
      thumbUrl: `/api/media/foto/${created.thumbFilename}`,
    },
    201
  );
}

export async function updateFotoHandler(c: Context, db: DB) {
  const id = c.req.param("id");
  const raw = await c.req.json().catch(() => ({}));
  const body = updateSchema.parse(raw);

  const update: Record<string, unknown> = {};
  if (body.caption !== undefined) update.caption = body.caption;

  if (Object.keys(update).length === 0) {
    return c.json({ error: "No fields to update", code: "NO_FIELDS" }, 400);
  }

  const [updated] = await db
    .update(fotos)
    .set(update)
    .where(eq(fotos.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Not found", code: "NOT_FOUND" }, 404);
  }

  return c.json(updated);
}

export async function deleteFotoHandler(c: Context, db: DB) {
  const id = c.req.param("id");
  const [row] = await db
    .select({ filename: fotos.filename, thumbFilename: fotos.thumbFilename })
    .from(fotos)
    .where(eq(fotos.id, id))
    .limit(1);

  if (!row) {
    return c.json({ error: "Not found", code: "NOT_FOUND" }, 404);
  }

  await db.delete(fotos).where(eq(fotos.id, id));
  await deleteFotoFile(row.filename, row.thumbFilename);
  return c.body(null, 204);
}

export async function reorderFotosHandler(c: Context, db: DB) {
  const raw = await c.req.json().catch(() => ({}));
  const body = reorderSchema.parse(raw);

  const rows = await db.select({ id: fotos.id }).from(fotos);
  const ids = body.orderedIds;
  const existing = new Set(rows.map((r) => r.id));

  const unique = new Set(ids);
  if (rows.length !== ids.length || unique.size !== ids.length || ids.some((id) => !existing.has(id))) {
    return c.json({ error: "Invalid orderedIds", code: "INVALID_ORDER" }, 400);
  }

  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i += 1) {
      await tx.update(fotos).set({ sortOrder: i }).where(eq(fotos.id, ids[i]));
    }
  });

  return c.body(null, 204);
}
