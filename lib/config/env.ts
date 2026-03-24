import { z } from "zod";

const envSchema = z.object({
  ALLOWED_ORIGINS: z.string().min(1),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive(),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Variables de entorno invalidas: ${issues}`);
}

export const env = {
  allowedOrigins: parsedEnv.data.ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  rateLimitWindowMs: parsedEnv.data.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: parsedEnv.data.RATE_LIMIT_MAX_REQUESTS,
};
