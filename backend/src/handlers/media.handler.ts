import type { Context } from "hono";
import { readMedia } from "../lib/storage";

const CACHE_HEADER = "public, max-age=31536000, immutable";

export async function mediaFotoHandler(c: Context) {
  const filename = c.req.param("filename");
  if (!filename) {
    return c.notFound();
  }
  const file = readMedia("fotos", filename);
  if (!(await file.exists())) {
    return c.notFound();
  }
  c.header("Cache-Control", CACHE_HEADER);
  return c.body(file.stream(), 200, { "Content-Type": file.type || "image/webp" });
}

export async function mediaCancionHandler(c: Context) {
  const filename = c.req.param("filename");
  if (!filename) {
    return c.notFound();
  }
  const file = readMedia("musica", filename);
  if (!(await file.exists())) {
    return c.notFound();
  }
  c.header("Cache-Control", CACHE_HEADER);
  return c.body(file.stream(), 200, { "Content-Type": file.type || "audio/mpeg" });
}
