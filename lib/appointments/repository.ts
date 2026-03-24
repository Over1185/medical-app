import type {
  Appointment,
  CreateAppointmentInput,
  PaginationInput,
  UpdateAppointmentInput,
} from "@/lib/appointments/types";
import { tursoClient } from "@/lib/db/turso";

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

type AppointmentRow = {
  id: string;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  reason: string;
  status: Appointment["status"];
  created_at: string;
  updated_at: string;
};

function mapAppointmentRow(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    patientName: row.patient_name,
    doctorName: row.doctor_name,
    appointmentDate: row.appointment_date,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class TursoAppointmentRepository implements AppointmentRepository {
  async list(
    input: PaginationInput,
  ): Promise<{ data: Appointment[]; total: number }> {
    const { limit, offset } = input;
    const rowsResult = await tursoClient.execute({
      sql: `
        SELECT
          id,
          patient_name,
          doctor_name,
          appointment_date,
          reason,
          status,
          created_at,
          updated_at
        FROM appointments
        ORDER BY appointment_date ASC
        LIMIT :limit OFFSET :offset
      `,
      args: { limit, offset },
    });

    const countResult = await tursoClient.execute(
      "SELECT COUNT(*) AS total FROM appointments",
    );

    const data = rowsResult.rows.map((row) => {
      return mapAppointmentRow(row as unknown as AppointmentRow);
    });

    const total = Number(countResult.rows[0]?.total ?? 0);

    return {
      data,
      total,
    };
  }

  async findById(id: string): Promise<Appointment | null> {
    const result = await tursoClient.execute({
      sql: `
        SELECT
          id,
          patient_name,
          doctor_name,
          appointment_date,
          reason,
          status,
          created_at,
          updated_at
        FROM appointments
        WHERE id = :id
        LIMIT 1
      `,
      args: { id },
    });

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return mapAppointmentRow(row as unknown as AppointmentRow);
  }

  async create(input: CreateAppointmentInput): Promise<Appointment> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await tursoClient.execute({
      sql: `
        INSERT INTO appointments (
          id,
          patient_name,
          doctor_name,
          appointment_date,
          reason,
          status,
          created_at,
          updated_at
        ) VALUES (
          :id,
          :patientName,
          :doctorName,
          :appointmentDate,
          :reason,
          :status,
          :createdAt,
          :updatedAt
        )
      `,
      args: {
        id,
        patientName: input.patientName,
        doctorName: input.doctorName,
        appointmentDate: input.appointmentDate,
        reason: input.reason,
        status: "pendiente",
        createdAt: now,
        updatedAt: now,
      },
    });

    const appointment: Appointment = {
      id,
      patientName: input.patientName,
      doctorName: input.doctorName,
      appointmentDate: input.appointmentDate,
      reason: input.reason,
      status: "pendiente",
      createdAt: now,
      updatedAt: now,
    };

    return appointment;
  }

  async update(
    id: string,
    input: UpdateAppointmentInput,
  ): Promise<Appointment | null> {
    const sets: string[] = [];
    const args: Record<string, string> = { id };

    if (input.patientName !== undefined) {
      sets.push("patient_name = :patientName");
      args.patientName = input.patientName;
    }

    if (input.doctorName !== undefined) {
      sets.push("doctor_name = :doctorName");
      args.doctorName = input.doctorName;
    }

    if (input.appointmentDate !== undefined) {
      sets.push("appointment_date = :appointmentDate");
      args.appointmentDate = input.appointmentDate;
    }

    if (input.reason !== undefined) {
      sets.push("reason = :reason");
      args.reason = input.reason;
    }

    if (input.status !== undefined) {
      sets.push("status = :status");
      args.status = input.status;
    }

    args.updatedAt = new Date().toISOString();
    sets.push("updated_at = :updatedAt");

    if (sets.length === 0) {
      return this.findById(id);
    }

    const result = await tursoClient.execute({
      sql: `UPDATE appointments SET ${sets.join(", ")} WHERE id = :id`,
      args,
    });

    if (result.rowsAffected === 0) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await tursoClient.execute({
      sql: "DELETE FROM appointments WHERE id = :id",
      args: { id },
    });

    return result.rowsAffected > 0;
  }
}

export const appointmentRepository: AppointmentRepository =
  new TursoAppointmentRepository();
