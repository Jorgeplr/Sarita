import type { ErrorHandler } from "hono";
import { ZodError } from "zod";
import { logger } from "./logger";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof ZodError) {
    return c.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        issues: err.issues.map((i) => ({ path: i.path, message: i.message })),
      },
      400
    );
  }

  logger.error({ err: err.message, stack: err.stack }, "Unhandled error");

  const isProd = process.env.NODE_ENV === "production";
  return c.json(
    {
      error: isProd ? "Internal server error" : err.message,
      code: "INTERNAL_ERROR",
    },
    500
  );
};
