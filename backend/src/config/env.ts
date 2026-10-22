import { config as loadEnv } from "dotenv";
import { z } from "zod";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(here, "../../../.env") });
loadEnv({ path: path.resolve(here, "../../.env") });

const defaultUrl = process.env.RENDER_EXTERNAL_URL || "http://localhost:5173";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(Number(process.env.PORT) || 4000),
  DATABASE_URL: z.string().min(1).default("postgresql://wimp:wimp@localhost:5432/wimp"),
  FRONTEND_ORIGIN: z.string().url().default(defaultUrl),
  PUBLIC_BASE_URL: z.string().url().default(defaultUrl),
  SESSION_SECRET: z.string().min(8).default("local-dev-only-session-secret"),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((value) => value === "true" || process.env.NODE_ENV === "production"),
  STATUS_DEFAULT_TTL_MINUTES: z.coerce.number().int().positive().default(240),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadAppEnv(overrides: Record<string, string | undefined> = {}): AppEnv {
  return envSchema.parse({ ...process.env, ...overrides });
}

export const env = loadAppEnv();
