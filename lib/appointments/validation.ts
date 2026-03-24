import { z } from "zod";
import { APPOINTMENT_STATUSES } from "@/lib/appointments/types";

const nameSchema = z
  .string()
  .trim()
  .min(2, "Debe tener al menos 2 caracteres")
  .max(120, "No puede exceder 120 caracteres");

const reasonSchema = z
  .string()
  .trim()
  .min(5, "Debe tener al menos 5 caracteres")
  .max(500, "No puede exceder 500 caracteres");

const appointmentDateSchema = z.string().datetime({ offset: true });

export const createAppointmentSchema = z.object({
  patientName: nameSchema,
  doctorName: nameSchema,
  appointmentDate: appointmentDateSchema,
  reason: reasonSchema,
});

export const updateAppointmentSchema = z
  .object({
    patientName: nameSchema.optional(),
    doctorName: nameSchema.optional(),
    appointmentDate: appointmentDateSchema.optional(),
    reason: reasonSchema.optional(),
    status: z.enum(APPOINTMENT_STATUSES).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Debes enviar al menos un campo a actualizar",
  });

export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const idParamSchema = z.uuid("El id de la cita debe ser un UUID valido");
