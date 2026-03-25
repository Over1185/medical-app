import { ZodError } from "zod";
import {
  AppointmentNotFoundError,
  appointmentService,
} from "@/lib/appointments/service";
import {
  idParamSchema,
  updateAppointmentStatusSchema,
} from "@/lib/appointments/validation";
import { ERROR_CODES } from "@/lib/errors/catalog";
import { enforceWriteRateLimit } from "@/lib/http/rate-limit";
import {
  errorResponse,
  getRequestId,
  HttpError,
  jsonResponse,
} from "@/lib/http/response";
import { buildSecurityHeaders, isOriginAllowed } from "@/lib/http/security";

export const runtime = "nodejs";

/** Contexto de ruta dinámica en Next.js para resolver params asíncronos. */
type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * PATCH /appointments/:id/status
 * Cambia unicamente el estado de una cita.
 */
export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const origin = request.headers.get("origin");
  const requestId = getRequestId(request);

  try {
    if (!isOriginAllowed(origin)) {
      throw new HttpError(
        403,
        ERROR_CODES.CORS_FORBIDDEN,
        "Origen no permitido por CORS",
      );
    }

    enforceWriteRateLimit(request);

    const { id } = await context.params;
    const parsedId = idParamSchema.parse(id);
    const payload = await request.json();
    const { status } = updateAppointmentStatusSchema.parse(payload);

    const updated = await appointmentService.updateStatus(parsedId, status);

    return jsonResponse(updated, { origin, requestId });
  } catch (error) {
    if (error instanceof AppointmentNotFoundError) {
      return errorResponse(
        new HttpError(404, ERROR_CODES.APPOINTMENT_NOT_FOUND, error.message),
        { origin, requestId },
      );
    }

    if (error instanceof ZodError) {
      return errorResponse(
        new HttpError(
          422,
          ERROR_CODES.VALIDATION_ERROR,
          "Datos invalidos para cambiar estado",
          error.flatten(),
        ),
        { origin, requestId },
      );
    }

    if (error instanceof SyntaxError) {
      return errorResponse(
        new HttpError(
          400,
          ERROR_CODES.INVALID_JSON_BODY,
          "JSON invalido en el body",
        ),
        { origin, requestId },
      );
    }

    return errorResponse(error, { origin, requestId });
  }
}

/**
 * OPTIONS /appointments/:id/status
 * Responde preflight CORS para cambio de estado.
 */
export async function OPTIONS(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  const requestId = getRequestId(request);

  if (!isOriginAllowed(origin)) {
    return errorResponse(
      new HttpError(
        403,
        ERROR_CODES.CORS_FORBIDDEN,
        "Origen no permitido por CORS",
      ),
      { origin, requestId },
    );
  }

  return new Response(null, {
    status: 204,
    headers: (() => {
      const headers = buildSecurityHeaders(origin);
      headers.set("X-Request-Id", requestId);
      return headers;
    })(),
  });
}
