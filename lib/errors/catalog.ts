/**
 * Catalogo de errores estable para contrato entre backend y frontend.
 *
 * El frontend debe depender de `code` y no del texto `message`,
 * para soportar cambios de copy sin romper flujos de UI.
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  APPOINTMENT_NOT_FOUND: "APPOINTMENT_NOT_FOUND",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INVALID_JSON_BODY: "INVALID_JSON_BODY",
  CORS_FORBIDDEN: "CORS_FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const ERROR_CATALOG: Record<ErrorCode, string> = {
  VALIDATION_ERROR:
    "El payload o parametros enviados no cumplen el esquema requerido.",
  APPOINTMENT_NOT_FOUND: "La cita solicitada no existe.",
  RATE_LIMIT_EXCEEDED: "Se alcanzo el limite de solicitudes permitido.",
  INVALID_JSON_BODY: "El body no contiene JSON valido.",
  CORS_FORBIDDEN: "El origen de la solicitud no esta permitido por CORS.",
  INTERNAL_ERROR: "Error interno no controlado en el servidor.",
};
