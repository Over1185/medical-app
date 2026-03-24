import { ZodError } from "zod";
import {
  AppointmentNotFoundError,
  appointmentService,
} from "@/lib/appointments/service";
import {
  idParamSchema,
  updateAppointmentStatusSchema,
} from "@/lib/appointments/validation";
import { enforceWriteRateLimit } from "@/lib/http/rate-limit";
import { errorResponse, HttpError, jsonResponse } from "@/lib/http/response";
import { buildSecurityHeaders, isOriginAllowed } from "@/lib/http/security";

export const runtime = "nodejs";

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

  try {
    if (!isOriginAllowed(origin)) {
      throw new HttpError(403, "Origen no permitido por CORS");
    }

    enforceWriteRateLimit(request);

    const { id } = await context.params;
    const parsedId = idParamSchema.parse(id);
    const payload = await request.json();
    const { status } = updateAppointmentStatusSchema.parse(payload);

    const updated = await appointmentService.updateStatus(parsedId, status);

    return jsonResponse(updated, { origin });
  } catch (error) {
    if (error instanceof AppointmentNotFoundError) {
      return jsonResponse(
        { error: { message: error.message } },
        { status: 404, origin },
      );
    }

    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: {
            message: "Datos invalidos para cambiar estado",
            details: error.flatten(),
          },
        },
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
