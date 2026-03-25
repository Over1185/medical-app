import { ZodError } from "zod";
import { appointmentService } from "@/lib/appointments/service";
import {
  createAppointmentSchema,
  listQuerySchema,
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

/**
 * GET /appointments
 * Lista paginada de citas medicas.
 */
export async function GET(request: Request): Promise<Response> {
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

    const { searchParams } = new URL(request.url);
    const parsedQuery = listQuerySchema.parse({
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    });

    const appointments = await appointmentService.list(
      parsedQuery.limit,
      parsedQuery.offset,
    );

    return jsonResponse(appointments, { origin, requestId });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        new HttpError(
          422,
          ERROR_CODES.VALIDATION_ERROR,
          "Parametros invalidos",
          error.flatten(),
        ),
        { origin, requestId },
      );
    }

    return errorResponse(error, { origin, requestId });
  }
}

/**
 * POST /appointments
 * Crea una nueva cita medica.
 */
export async function POST(request: Request): Promise<Response> {
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

    const payload = await request.json();
    const input = createAppointmentSchema.parse(payload);
    const appointment = await appointmentService.create(input);

    return jsonResponse(appointment, { status: 201, origin, requestId });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        new HttpError(
          422,
          ERROR_CODES.VALIDATION_ERROR,
          "Payload invalido",
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
 * OPTIONS /appointments
 * Responde preflight CORS para clientes web.
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
