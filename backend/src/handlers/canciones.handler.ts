import type { Context } from "hono";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import type { DB } from "../db/client";
import { canciones } from "../db/schema";
import { deleteCancion as deleteCancionFile, saveCancion } from "../lib/storage";

const MAX_BYTES = 25 * 1024 * 1024;

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  artist: z.string().min(1).optional(),
  kind: z.enum(["fondo", "playlist"]).optional(),
});

const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});

function isValidAudioType(type: string) {
  return type === "audio/mpeg" || type === "audio/mp3";
}

async function ensureSingleFondo(db: DB, excludeId?: string) {
  const [existing] = await db
    .select({ id: canciones.id })
    .from(canciones)
    .where(eq(canciones.kind, "fondo"))
    .limit(1);

  if (!existing || existing.id === excludeId) return;

  const [row] = await db
    .select({ max: sql<number>`max(${canciones.sortOrder})` })
    .from(canciones)
    .where(eq(canciones.kind, "playlist"));
  const nextOrder = (row?.max ?? -1) + 1;

  await db
    .update(canciones)
    .set({ kind: "playlist", sortOrder: nextOrder })
    .where(eq(canciones.id, existing.id));
}

export async function uploadCancionHandler(c: Context, db: DB) {
  const body = await c.req.parseBody();
  const file = body.file;
  const title = typeof body.title === "string" ? body.title : "";
  const artist = typeof body.artist === "string" ? body.artist : "";
  const kind = typeof body.kind === "string" ? body.kind : "playlist";

  if (!(file instanceof File)) {
    return c.json({ error: "Missing file", code: "MISSING_FILE" }, 400);
  }

  if (!isValidAudioType(file.type)) {
    return c.json({ error: "Invalid file type", code: "INVALID_FILE" }, 400);
  }

  if (file.size > MAX_BYTES) {
    return c.json({ error: "File too large", code: "FILE_TOO_LARGE" }, 400);
  }

  const parsed = updateSchema.extend({
    title: z.string().min(1),
    artist: z.string().min(1),
    kind: z.enum(["fondo", "playlist"]),
  }).parse({ title, artist, kind });

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileId = crypto.randomUUID();
  await saveCancion(fileId, buffer);

  if (parsed.kind === "fondo") {
    await ensureSingleFondo(db);
  }

  const [row] = await db
    .select({ max: sql<number>`max(${canciones.sortOrder})` })
    .from(canciones)
    .where(eq(canciones.kind, "playlist"));
  const nextOrder = (row?.max ?? -1) + 1;

  const [created] = await db
    .insert(canciones)
    .values({
      kind: parsed.kind,
      filename: `${fileId}.mp3`,
      title: parsed.title,
      artist: parsed.artist,
      sortOrder: parsed.kind === "playlist" ? nextOrder : 0,
      sizeBytes: file.size,
    })
    .returning();

  return c.json(
    {
      ...created,
      url: `/api/media/musica/${created.filename}`,
    },
    201
  );
}

export async function updateCancionHandler(c: Context, db: DB) {
  const id = c.req.param("id");
  const raw = await c.req.json().catch(() => ({}));
  const body = updateSchema.parse(raw);

  const [existing] = await db
    .select({ id: canciones.id, kind: canciones.kind })
    .from(canciones)
    .where(eq(canciones.id, id))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Not found", code: "NOT_FOUND" }, 404);
  }

  let nextSortOrder: number | undefined;
  if (body.kind === "playlist" && existing.kind === "fondo") {
    const [row] = await db
      .select({ max: sql<number>`max(${canciones.sortOrder})` })
      .from(canciones)
      .where(eq(canciones.kind, "playlist"));
    nextSortOrder = (row?.max ?? -1) + 1;
  }

  if (body.kind === "fondo") {
    await ensureSingleFondo(db, id);
  }

  const update: Record<string, unknown> = {};
  if (body.title) update.title = body.title;
  if (body.artist) update.artist = body.artist;
  if (body.kind) update.kind = body.kind;
  if (typeof nextSortOrder === "number") update.sortOrder = nextSortOrder;

  if (Object.keys(update).length === 0) {
    return c.json({ error: "No fields to update", code: "NO_FIELDS" }, 400);
  }

  const [updated] = await db
    .update(canciones)
    .set(update)
    .where(eq(canciones.id, id))
    .returning();

  return c.json(updated);
}

export async function deleteCancionHandler(c: Context, db: DB) {
  const id = c.req.param("id");
  const [row] = await db
    .select({ filename: canciones.filename })
    .from(canciones)
    .where(eq(canciones.id, id))
    .limit(1);

  if (!row) {
    return c.json({ error: "Not found", code: "NOT_FOUND" }, 404);
  }

  await db.delete(canciones).where(eq(canciones.id, id));
  await deleteCancionFile(row.filename);
  return c.body(null, 204);
}

export async function reorderCancionesHandler(c: Context, db: DB) {
  const raw = await c.req.json().catch(() => ({}));
  const body = reorderSchema.parse(raw);

  const rows = await db
    .select({ id: canciones.id })
    .from(canciones)
    .where(eq(canciones.kind, "playlist"));

  const ids = body.orderedIds;
  const existing = new Set(rows.map((r) => r.id));

  const unique = new Set(ids);
  if (rows.length !== ids.length || unique.size !== ids.length || ids.some((id) => !existing.has(id))) {
    return c.json({ error: "Invalid orderedIds", code: "INVALID_ORDER" }, 400);
  }

  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i += 1) {
      await tx.update(canciones).set({ sortOrder: i }).where(eq(canciones.id, ids[i]));
    }
  });

  return c.body(null, 204);
}
