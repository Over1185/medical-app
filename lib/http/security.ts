import { env } from "@/lib/config/env";

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    return true;
  }

  return env.allowedOrigins.includes(origin);
}

export function buildSecurityHeaders(origin: string | null): Headers {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (origin && isOriginAllowed(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  return headers;
}
