import { ZodError } from "zod";
import {
  AppointmentNotFoundError,
  appointmentService,
} from "@/lib/appointments/service";
import {
  idParamSchema,
  updateAppointmentSchema,
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
 * PUT /appointments/:id
 * Actualiza campos de una cita existente.
 */
export async function PUT(
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
    const input = updateAppointmentSchema.parse(payload);
    const updated = await appointmentService.update(parsedId, input);

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
        { error: { message: "Datos invalidos", details: error.flatten() } },
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

/**
 * DELETE /appointments/:id
 * Elimina una cita existente.
 */
export async function DELETE(
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
    await appointmentService.remove(parsedId);

    return new Response(null, {
      status: 204,
      headers: buildSecurityHeaders(origin),
    });
  } catch (error) {
    if (error instanceof AppointmentNotFoundError) {
      return jsonResponse(
        { error: { message: error.message } },
        { status: 404, origin },
      );
    }

    if (error instanceof ZodError) {
      return jsonResponse(
        { error: { message: "El id es invalido", details: error.flatten() } },
        { status: 422, origin },
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
