import type {
  Appointment,
  CreateAppointmentInput,
  PaginationInput,
  UpdateAppointmentInput,
} from "@/lib/appointments/types";

export interface AppointmentRepository {
  list(input: PaginationInput): Promise<{ data: Appointment[]; total: number }>;
  findById(id: string): Promise<Appointment | null>;
  create(input: CreateAppointmentInput): Promise<Appointment>;
  update(
    id: string,
    input: UpdateAppointmentInput,
  ): Promise<Appointment | null>;
  delete(id: string): Promise<boolean>;
}

/**
 * Implementacion simple para desarrollo local.
 *
 * La API y la capa de servicio dependen de la interfaz `AppointmentRepository`,
 * por lo que migrar a Postgres/Neon solo requiere otra implementacion.
 */
class InMemoryAppointmentRepository implements AppointmentRepository {
  private readonly store = new Map<string, Appointment>();

  async list(
    input: PaginationInput,
  ): Promise<{ data: Appointment[]; total: number }> {
    const { limit, offset } = input;
    const items = Array.from(this.store.values()).sort((a, b) => {
      return a.appointmentDate.localeCompare(b.appointmentDate);
    });

    return {
      data: items.slice(offset, offset + limit),
      total: items.length,
    };
  }

  async findById(id: string): Promise<Appointment | null> {
    return this.store.get(id) ?? null;
  }

  async create(input: CreateAppointmentInput): Promise<Appointment> {
    const now = new Date().toISOString();
    const appointment: Appointment = {
      id: crypto.randomUUID(),
      patientName: input.patientName,
      doctorName: input.doctorName,
      appointmentDate: input.appointmentDate,
      reason: input.reason,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    };

    this.store.set(appointment.id, appointment);
    return appointment;
  }

  async update(
    id: string,
    input: UpdateAppointmentInput,
  ): Promise<Appointment | null> {
    const current = this.store.get(id);

    if (!current) {
      return null;
    }

    const updated: Appointment = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

export const appointmentRepository: AppointmentRepository =
  new InMemoryAppointmentRepository();
