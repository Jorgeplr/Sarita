import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  IP_HASH_SALT: z.string().min(32, "IP_HASH_SALT must be at least 32 characters"),
  ADMIN_TOKEN: z.string().min(32, "ADMIN_TOKEN must be at least 32 characters"),
  FRONTEND_ORIGIN: z.string().default("http://localhost"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error("Invalid environment variables:\n" + issues);
    process.exit(1);
  }
  return parsed.data;
}
