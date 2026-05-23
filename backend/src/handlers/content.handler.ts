import type { Context } from "hono";
import { asc, eq } from "drizzle-orm";
import type { DB } from "../db/client";
import { cualidades, fotos, canciones } from "../db/schema";

const CACHE_HEADER = "public, max-age=60";

export async function cualidadesContentHandler(c: Context, db: DB) {
  const rows = await db
    .select({ id: cualidades.id, icon: cualidades.icon, text: cualidades.text, sortOrder: cualidades.sortOrder })
    .from(cualidades)
    .orderBy(asc(cualidades.sortOrder));

  c.header("Cache-Control", CACHE_HEADER);
  return c.json(rows);
}

export async function fotosContentHandler(c: Context, db: DB) {
  const rows = await db
    .select({
      id: fotos.id,
      filename: fotos.filename,
      thumbFilename: fotos.thumbFilename,
      caption: fotos.caption,
      sortOrder: fotos.sortOrder,
    })
    .from(fotos)
    .orderBy(asc(fotos.sortOrder));

  c.header("Cache-Control", CACHE_HEADER);
  return c.json(
    rows.map((r) => ({
      id: r.id,
      url: `/api/media/foto/${r.filename}`,
      thumbUrl: `/api/media/foto/${r.thumbFilename}`,
      caption: r.caption,
      sortOrder: r.sortOrder,
    }))
  );
}

export async function playlistContentHandler(c: Context, db: DB) {
  const rows = await db
    .select({
      id: canciones.id,
      filename: canciones.filename,
      title: canciones.title,
      artist: canciones.artist,
      sortOrder: canciones.sortOrder,
    })
    .from(canciones)
    .where(eq(canciones.kind, "playlist"))
    .orderBy(asc(canciones.sortOrder));

  c.header("Cache-Control", CACHE_HEADER);
  return c.json(
    rows.map((r) => ({
      id: r.id,
      url: `/api/media/musica/${r.filename}`,
      title: r.title,
      artist: r.artist,
      sortOrder: r.sortOrder,
    }))
  );
}

export async function fondoContentHandler(c: Context, db: DB) {
  const [row] = await db
    .select({ id: canciones.id, filename: canciones.filename, title: canciones.title, artist: canciones.artist })
    .from(canciones)
    .where(eq(canciones.kind, "fondo"))
    .limit(1);

  c.header("Cache-Control", CACHE_HEADER);
  if (!row) return c.json(null);

  return c.json({
    id: row.id,
    url: `/api/media/musica/${row.filename}`,
    title: row.title,
    artist: row.artist,
  });
}
