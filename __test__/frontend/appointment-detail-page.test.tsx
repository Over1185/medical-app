import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AppointmentDetailPage from "@/app/citas/[id]/page";
import type { Appointment } from "@/lib/appointments/types";

const { pushMock, hookState } = vi.hoisted(() => ({
    pushMock: vi.fn(),
    hookState: {
        appointments: [] as Appointment[],
        loading: false,
        deleteAppointment: vi.fn(),
        updateStatus: vi.fn(),
    },
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
    useParams: () => ({ id: "apt-1" }),
}));

vi.mock("@/hooks/useAppointments", () => ({
    useAppointments: () => hookState,
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe("AppointmentDetailPage", () => {
    beforeEach(() => {
        hookState.appointments = [];
        hookState.loading = false;
        hookState.deleteAppointment = vi.fn();
        hookState.updateStatus = vi.fn();
        pushMock.mockReset();
    });

    it("muestra estado de carga cuando loading es true", () => {
        hookState.loading = true;

        render(<AppointmentDetailPage />);

        expect(screen.getByText("Cargando detalles de consulta...")).toBeDefined();
    });

    it("muestra estado no encontrado cuando no existe la cita", () => {
        hookState.loading = false;
        hookState.appointments = [];

        render(<AppointmentDetailPage />);

        expect(screen.getByText("Cita no encontrada")).toBeDefined();
    });

    it("abre el modal de eliminacion al pulsar Eliminar Registro", () => {
        hookState.loading = false;
        hookState.appointments = [
            {
                id: "apt-1",
                patientName: "Ana Perez",
                doctorName: "Mario Soto",
                appointmentDate: "2026-04-10T09:00:00.000Z",
                reason: "Chequeo anual",
                status: "pendiente",
                createdAt: "2026-04-09T10:00:00.000Z",
                updatedAt: "2026-04-09T10:00:00.000Z",
            },
        ];

        render(<AppointmentDetailPage />);

        fireEvent.click(screen.getByRole("button", { name: "Eliminar Registro" }));

        expect(screen.getByText("¿Estás seguro de que deseas eliminar permanentemente esta cita? Esta acción no se puede deshacer.")).toBeDefined();
    });
});
