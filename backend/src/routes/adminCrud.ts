import { Hono } from "hono";
import type { DB } from "../db/client";
import { sessionAuth } from "../middleware/sessionAuth";
import {
  createCualidadHandler,
  deleteCualidadHandler,
  reorderCualidadesHandler,
  updateCualidadHandler,
} from "../handlers/cualidades.handler";
import {
  deleteFotoHandler,
  reorderFotosHandler,
  updateFotoHandler,
  uploadFotoHandler,
} from "../handlers/fotos.handler";
import {
  deleteCancionHandler,
  reorderCancionesHandler,
  updateCancionHandler,
  uploadCancionHandler,
} from "../handlers/canciones.handler";

export function adminCrudRoutes(db: DB) {
  const app = new Hono();

  app.post("/api/admin/cualidades", sessionAuth(db), (c) => createCualidadHandler(c, db));
  app.patch("/api/admin/cualidades/:id", sessionAuth(db), (c) => updateCualidadHandler(c, db));
  app.delete("/api/admin/cualidades/:id", sessionAuth(db), (c) => deleteCualidadHandler(c, db));
  app.patch("/api/admin/cualidades/reorder", sessionAuth(db), (c) =>
    reorderCualidadesHandler(c, db)
  );

  app.post("/api/admin/fotos", sessionAuth(db), (c) => uploadFotoHandler(c, db));
  app.patch("/api/admin/fotos/:id", sessionAuth(db), (c) => updateFotoHandler(c, db));
  app.delete("/api/admin/fotos/:id", sessionAuth(db), (c) => deleteFotoHandler(c, db));
  app.patch("/api/admin/fotos/reorder", sessionAuth(db), (c) => reorderFotosHandler(c, db));

  app.post("/api/admin/canciones", sessionAuth(db), (c) => uploadCancionHandler(c, db));
  app.patch("/api/admin/canciones/:id", sessionAuth(db), (c) => updateCancionHandler(c, db));
  app.delete("/api/admin/canciones/:id", sessionAuth(db), (c) => deleteCancionHandler(c, db));
  app.patch("/api/admin/canciones/reorder", sessionAuth(db), (c) =>
    reorderCancionesHandler(c, db)
  );

  return app;
}
