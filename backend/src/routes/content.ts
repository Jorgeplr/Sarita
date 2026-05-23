import { Hono } from "hono";
import type { DB } from "../db/client";
import {
  cualidadesContentHandler,
  fotosContentHandler,
  playlistContentHandler,
  fondoContentHandler,
} from "../handlers/content.handler";

export function contentRoutes(db: DB) {
  const app = new Hono();
  app.get("/api/content/cualidades", (c) => cualidadesContentHandler(c, db));
  app.get("/api/content/fotos", (c) => fotosContentHandler(c, db));
  app.get("/api/content/playlist", (c) => playlistContentHandler(c, db));
  app.get("/api/content/fondo", (c) => fondoContentHandler(c, db));
  return app;
}
