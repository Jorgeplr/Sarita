import type { MiddlewareHandler } from "hono";
import type { Env } from "../env";

export function adminAuth(env: Env): MiddlewareHandler {
  return async (c, next) => {
    const auth = c.req.header("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return c.json({ error: "Missing or malformed Authorization header", code: "UNAUTHORIZED" }, 401);
    }
    const token = auth.slice("Bearer ".length).trim();
    if (token !== env.ADMIN_TOKEN) {
      return c.json({ error: "Invalid token", code: "UNAUTHORIZED" }, 401);
    }
    await next();
  };
}
