import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAppointments } from "@/hooks/useAppointments";
import type { Appointment, CreateAppointmentInput } from "@/lib/appointments/types";

const baseAppointment: Appointment = {
    id: "apt-1",
    patientName: "Juan Perez",
    doctorName: "Ana Gomez",
    appointmentDate: "2026-03-24T15:00:00.000Z",
    reason: "Control general",
    status: "pendiente",
    createdAt: "2026-03-24T12:00:00.000Z",
    updatedAt: "2026-03-24T12:00:00.000Z",
};

/**
 * Pruebas unitarias del hook de datos de citas.
 */
describe("useAppointments", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    /**
     * Confirma la carga inicial de datos al montar el hook.
     */
    it("carga citas al montar el hook", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: [baseAppointment] }),
        });

        vi.stubGlobal("fetch", fetchMock);

        const { result } = renderHook(() => useAppointments());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBeNull();
        expect(result.current.appointments).toHaveLength(1);
        expect(result.current.appointments[0]?.id).toBe("apt-1");
        expect(fetchMock).toHaveBeenCalledWith("/appointments");
    });

    /**
     * Valida rollback local cuando falla la actualización optimista de estado.
     */
    it("revierte el cambio optimista de estado cuando PATCH falla", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [baseAppointment] }),
            })
            .mockResolvedValueOnce({
                ok: false,
            });

        vi.stubGlobal("fetch", fetchMock);

        const { result } = renderHook(() => useAppointments());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await expect(result.current.updateStatus("apt-1", "confirmada")).rejects.toThrow(
            "Error al actualizar el estado",
        );

        await waitFor(() => {
            expect(result.current.appointments[0]?.status).toBe("pendiente");
        });

        expect(fetchMock).toHaveBeenNthCalledWith(2, "/appointments/apt-1/status", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "confirmada" }),
        });
    });

    /**
     * Verifica creación y posterior sincronización del listado.
     */
    it("crea una cita y refresca la lista", async () => {
        const createdAppointment = {
            ...baseAppointment,
            id: "apt-2",
            status: "confirmada",
        } as Appointment;

        const input: CreateAppointmentInput = {
            patientName: "Maria Lopez",
            doctorName: "Pedro Soto",
            appointmentDate: "2026-03-26T10:00:00.000Z",
            reason: "Chequeo",
        };

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: createdAppointment }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [createdAppointment] }),
            });

        vi.stubGlobal("fetch", fetchMock);

        const { result } = renderHook(() => useAppointments());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.appointments).toHaveLength(0);
        });

        await act(async () => {
            await result.current.createAppointment(input);
        });

        await waitFor(() => {
            expect(result.current.appointments).toHaveLength(1);
            expect(result.current.appointments[0]?.id).toBe("apt-2");
        });

        expect(fetchMock).toHaveBeenNthCalledWith(2, "/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });
        expect(fetchMock).toHaveBeenNthCalledWith(3, "/appointments");
    });
});
