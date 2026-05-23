import type { Context } from "hono";
import { readMedia } from "../lib/storage";

const CACHE_HEADER = "public, max-age=31536000, immutable";

const AUDIO_CONTENT_TYPES: Record<string, string> = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  mp4: "audio/mp4",
  aac: "audio/aac",
};

function audioContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return AUDIO_CONTENT_TYPES[ext] ?? "audio/mpeg";
}

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
  return c.body(file.stream(), 200, { "Content-Type": audioContentType(filename) });
}
