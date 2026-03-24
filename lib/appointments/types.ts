/**
 * Estados permitidos para una cita medica.
 */
export const APPOINTMENT_STATUSES = [
  "pendiente",
  "confirmada",
  "cancelada",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/**
 * Entidad principal de una cita.
 */
export type Appointment = {
  id: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateAppointmentInput = {
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  reason: string;
};

export type UpdateAppointmentInput = Partial<CreateAppointmentInput> & {
  status?: AppointmentStatus;
};

export type PaginationInput = {
  limit: number;
  offset: number;
};

export type PaginatedAppointments = {
  data: Appointment[];
  total: number;
  limit: number;
  offset: number;
};
