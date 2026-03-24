import { appointmentRepository } from "@/lib/appointments/repository";
import type {
  AppointmentStatus,
  CreateAppointmentInput,
  PaginatedAppointments,
  UpdateAppointmentInput,
} from "@/lib/appointments/types";

export class AppointmentNotFoundError extends Error {
  constructor() {
    super("Cita no encontrada");
    this.name = "AppointmentNotFoundError";
  }
}

export const appointmentService = {
  async list(limit: number, offset: number): Promise<PaginatedAppointments> {
    const result = await appointmentRepository.list({ limit, offset });

    return {
      data: result.data,
      total: result.total,
      limit,
      offset,
    };
  },

  async create(input: CreateAppointmentInput) {
    return appointmentRepository.create(input);
  },

  async update(id: string, input: UpdateAppointmentInput) {
    const updated = await appointmentRepository.update(id, input);

    if (!updated) {
      throw new AppointmentNotFoundError();
    }

    return updated;
  },

  async updateStatus(id: string, status: AppointmentStatus) {
    const updated = await appointmentRepository.update(id, { status });

    if (!updated) {
      throw new AppointmentNotFoundError();
    }

    return updated;
  },

  async remove(id: string): Promise<void> {
    const deleted = await appointmentRepository.delete(id);

    if (!deleted) {
      throw new AppointmentNotFoundError();
    }
  },
};
