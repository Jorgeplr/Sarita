import { mkdir } from "node:fs/promises";

const MEDIA_ROOT = "/app/media";

export async function ensureMediaDirs() {
  await mkdir(`${MEDIA_ROOT}/fotos`, { recursive: true });
  await mkdir(`${MEDIA_ROOT}/musica`, { recursive: true });
}

export async function saveFoto(uuid: string, main: Buffer, thumb: Buffer) {
  await Bun.write(`${MEDIA_ROOT}/fotos/${uuid}.webp`, main);
  await Bun.write(`${MEDIA_ROOT}/fotos/${uuid}.thumb.webp`, thumb);
}

export async function saveCancion(filename: string, file: Buffer) {
  await Bun.write(`${MEDIA_ROOT}/musica/${filename}`, file);
}

export async function deleteFoto(filename: string, thumbFilename: string) {
  await Promise.all([
    Bun.file(`${MEDIA_ROOT}/fotos/${filename}`).unlink().catch(() => {}),
    Bun.file(`${MEDIA_ROOT}/fotos/${thumbFilename}`).unlink().catch(() => {}),
  ]);
}

export async function deleteCancion(filename: string) {
  await Bun.file(`${MEDIA_ROOT}/musica/${filename}`).unlink().catch(() => {});
}

export function readMedia(category: "fotos" | "musica", filename: string) {
  return Bun.file(`${MEDIA_ROOT}/${category}/${filename}`);
}
