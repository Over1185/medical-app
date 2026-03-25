import { ERROR_CODES, type ErrorCode } from "@/lib/errors/catalog";
import { buildSecurityHeaders } from "@/lib/http/security";

export class HttpError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(
    public readonly status: number,
    code: ErrorCode,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
    this.code = code;
    this.details = details;
  }
}

type ErrorBody = {
  error: {
    code: ErrorCode;
    message: string;
    requestId: string;
    details?: unknown;
  };
};

export function getRequestId(request: Request): string {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

function buildErrorBody(input: {
  code: ErrorCode;
  message: string;
  requestId: string;
  details?: unknown;
}): ErrorBody {
  return {
    error: {
      code: input.code,
      message: input.message,
      requestId: input.requestId,
      details: input.details,
    },
  };
}

export function jsonResponse<T>(
  payload: T,
  init: {
    status?: number;
    origin: string | null;
    requestId?: string;
  },
): Response {
  const headers = buildSecurityHeaders(init.origin);

  if (init.requestId) {
    headers.set("X-Request-Id", init.requestId);
  }

  return new Response(JSON.stringify(payload), {
    status: init.status ?? 200,
    headers,
  });
}

export function errorResponse(
  error: unknown,
  input: {
    origin: string | null;
    requestId: string;
  },
): Response {
  if (error instanceof HttpError) {
    const body = buildErrorBody({
      code: error.code,
      message: error.message,
      requestId: input.requestId,
      details: error.details,
    });

    return jsonResponse(body, {
      status: error.status,
      origin: input.origin,
      requestId: input.requestId,
    });
  }

  const body = buildErrorBody({
    code: ERROR_CODES.INTERNAL_ERROR,
    message: "Error interno del servidor",
    requestId: input.requestId,
  });

  return jsonResponse(body, {
    status: 500,
    origin: input.origin,
    requestId: input.requestId,
  });
}
