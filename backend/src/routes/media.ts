import { Hono } from "hono";
import { mediaCancionHandler, mediaFotoHandler } from "../handlers/media.handler";

export function mediaRoutes() {
  const app = new Hono();
  app.get("/api/media/foto/:filename", mediaFotoHandler);
  app.get("/api/media/musica/:filename", mediaCancionHandler);
  return app;
}
