// @vitest-environment node

import { afterEach, describe, expect, it } from "vitest";
import { loadEnvFromDotEnvFile } from "@/__test__/helpers/load-env";

loadEnvFromDotEnvFile();

const createdIds: string[] = [];

async function deleteAppointmentById(id: string): Promise<void> {
    const { DELETE } = await import("@/app/appointments/[id]/route");

    await DELETE(new Request(`http://localhost:3000/appointments/${id}`, {
        method: "DELETE",
    }), {
        params: Promise.resolve({ id }),
    });
}

describe("Integracion real - POST /appointments", () => {
    afterEach(async () => {
        while (createdIds.length > 0) {
            const id = createdIds.pop();

            if (id) {
                await deleteAppointmentById(id);
            }
        }
    });

    it("retorna 422 cuando faltan campos obligatorios", async () => {
        const { POST } = await import("@/app/appointments/route");

        const request = new Request("http://localhost:3000/appointments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                patientName: "Paciente Incompleto",
            }),
        });

        const response = await POST(request);

        expect(response.status).toBe(422);
    });

    it("retorna 201 y persiste una cita valida en Turso", async () => {
        const { POST } = await import("@/app/appointments/route");

        const request = new Request("http://localhost:3000/appointments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                patientName: "Paciente Integracion",
                doctorName: "Dr Integracion",
                appointmentDate: "2026-04-10T10:30:00.000Z",
                reason: "Prueba de persistencia",
            }),
        });

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body.id).toBeTypeOf("string");
        expect(body.status).toBe("pendiente");

        createdIds.push(body.id);
    });
});
