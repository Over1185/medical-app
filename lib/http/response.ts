import { buildSecurityHeaders } from "@/lib/http/security";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

type ErrorBody = {
  error: {
    message: string;
  };
};

export function jsonResponse<T>(
  payload: T,
  init: {
    status?: number;
    origin: string | null;
  },
): Response {
  return new Response(JSON.stringify(payload), {
    status: init.status ?? 200,
    headers: buildSecurityHeaders(init.origin),
  });
}

export function errorResponse(error: unknown, origin: string | null): Response {
  if (error instanceof HttpError) {
    const body: ErrorBody = { error: { message: error.message } };
    return jsonResponse(body, { status: error.status, origin });
  }

  const body: ErrorBody = {
    error: {
      message: "Error interno del servidor",
    },
  };

  return jsonResponse(body, { status: 500, origin });
}
