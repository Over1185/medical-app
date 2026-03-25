// @vitest-environment node

import { afterEach, describe, expect, it } from "vitest";
import { loadEnvFromDotEnvFile } from "@/__test__/helpers/load-env";

loadEnvFromDotEnvFile();

/**
 * Estrategia de limpieza:
 * al ser pruebas de integracion contra Turso real, hacemos cleanup manual por id
 * para mantener independencia entre casos y ejecuciones repetidas.
 */
const createdIds: string[] = [];

async function createAppointmentForTest(): Promise<string> {
  const { POST } = await import("@/app/appointments/route");

  const request = new Request("http://localhost:3000/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      patientName: "Paciente Status",
      doctorName: "Dra. Status",
      appointmentDate: "2026-04-11T08:00:00.000Z",
      reason: "Prueba de cambio de estado",
    }),
  });

  const response = await POST(request);
  const body = await response.json();

  if (response.status !== 201) {
    throw new Error("No se pudo crear cita para test de integracion");
  }

  createdIds.push(body.id);
  return body.id;
}

async function deleteAppointmentById(id: string): Promise<void> {
  const { DELETE } = await import("@/app/appointments/[id]/route");

  await DELETE(
    new Request(`http://localhost:3000/appointments/${id}`, {
      method: "DELETE",
    }),
    {
      params: Promise.resolve({ id }),
    },
  );
}

describe("Integracion real - PATCH /appointments/:id/status", () => {
  afterEach(async () => {
    while (createdIds.length > 0) {
      const id = createdIds.pop();

      if (id) {
        await deleteAppointmentById(id);
      }
    }
  });

  it("retorna 422 cuando el estado no es valido", async () => {
    const { PATCH } = await import("@/app/appointments/[id]/status/route");
    const id = await createAppointmentForTest();

    const request = new Request(
      `http://localhost:3000/appointments/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "archivada",
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ id }),
    });

    expect(response.status).toBe(422);
  });

  it("retorna 200 y actualiza estado real en Turso", async () => {
    const { PATCH } = await import("@/app/appointments/[id]/status/route");
    const id = await createAppointmentForTest();

    const request = new Request(
      `http://localhost:3000/appointments/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "confirmada",
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ id }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe(id);
    expect(body.status).toBe("confirmada");
  });
});
