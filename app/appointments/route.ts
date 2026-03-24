import { ZodError } from "zod";
import { appointmentService } from "@/lib/appointments/service";
import {
  createAppointmentSchema,
  listQuerySchema,
} from "@/lib/appointments/validation";
import { enforceWriteRateLimit } from "@/lib/http/rate-limit";
import { errorResponse, HttpError, jsonResponse } from "@/lib/http/response";
import { buildSecurityHeaders, isOriginAllowed } from "@/lib/http/security";

export const runtime = "nodejs";

/**
 * GET /appointments
 * Lista paginada de citas medicas.
 */
export async function GET(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");

  try {
    if (!isOriginAllowed(origin)) {
      throw new HttpError(403, "Origen no permitido por CORS");
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

    return jsonResponse(appointments, { origin });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: { message: "Parametros invalidos", details: error.flatten() },
        },
        { status: 422, origin },
      );
    }

    return errorResponse(error, origin);
  }
}

/**
 * POST /appointments
 * Crea una nueva cita medica.
 */
export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");

  try {
    if (!isOriginAllowed(origin)) {
      throw new HttpError(403, "Origen no permitido por CORS");
    }

    enforceWriteRateLimit(request);

    const payload = await request.json();
    const input = createAppointmentSchema.parse(payload);
    const appointment = await appointmentService.create(input);

    return jsonResponse(appointment, { status: 201, origin });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        { error: { message: "Payload invalido", details: error.flatten() } },
        { status: 422, origin },
      );
    }

    if (error instanceof SyntaxError) {
      return jsonResponse(
        { error: { message: "JSON invalido en el body" } },
        { status: 400, origin },
      );
    }

    return errorResponse(error, origin);
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");

  if (!isOriginAllowed(origin)) {
    return jsonResponse(
      { error: { message: "Origen no permitido por CORS" } },
      { status: 403, origin },
    );
  }

  return new Response(null, {
    status: 204,
    headers: buildSecurityHeaders(origin),
  });
}
