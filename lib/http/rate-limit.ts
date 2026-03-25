import { env } from "@/lib/config/env";
import { ERROR_CODES } from "@/lib/errors/catalog";
import { HttpError } from "@/lib/http/response";

type RateLimitState = {
  count: number;
  windowStartedAt: number;
};

const WINDOW_MS = env.rateLimitWindowMs;
const MAX_REQUESTS = env.rateLimitMaxRequests;
const ipBuckets = new Map<string, RateLimitState>();

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (!forwardedFor) {
    return "unknown";
  }

  return forwardedFor.split(",")[0]?.trim() || "unknown";
}

/**
 * Limita escrituras para reducir abuso y ataques de fuerza bruta basicos.
 */
export function enforceWriteRateLimit(request: Request): void {
  const now = Date.now();
  const clientIp = getClientIp(request);
  const current = ipBuckets.get(clientIp);

  if (!current) {
    ipBuckets.set(clientIp, { count: 1, windowStartedAt: now });
    return;
  }

  const isNewWindow = now - current.windowStartedAt >= WINDOW_MS;

  if (isNewWindow) {
    ipBuckets.set(clientIp, { count: 1, windowStartedAt: now });
    return;
  }

  if (current.count >= MAX_REQUESTS) {
    throw new HttpError(
      429,
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      "Demasiadas solicitudes. Intenta nuevamente en un minuto",
    );
  }

  current.count += 1;
  ipBuckets.set(clientIp, current);
}
