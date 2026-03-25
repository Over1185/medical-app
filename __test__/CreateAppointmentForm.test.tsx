import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateAppointmentForm } from "@/components/appointments/CreateAppointmentForm";

const { createAppointmentMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
    createAppointmentMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
}));

vi.mock("@/hooks/useAppointments", () => ({
    useAppointments: () => ({
        createAppointment: createAppointmentMock,
    }),
}));

vi.mock("sonner", () => ({
    toast: {
        success: toastSuccessMock,
        error: toastErrorMock,
    },
}));

describe("CreateAppointmentForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it("envia el formulario y ejecuta onSuccess", async () => {
        createAppointmentMock.mockResolvedValue(undefined);

        const onSuccess = vi.fn();
        const onCancel = vi.fn();

        render(<CreateAppointmentForm onSuccess={onSuccess} onCancel={onCancel} />);

        fireEvent.change(screen.getByLabelText("Nombre del Paciente"), {
            target: { value: "Laura Diaz" },
        });
        fireEvent.change(screen.getByLabelText("Nombre del Doctor"), {
            target: { value: "Carlos Ruiz" },
        });
        fireEvent.change(screen.getByLabelText("Fecha y Hora"), {
            target: { value: "2026-03-25T16:30" },
        });
        fireEvent.change(screen.getByLabelText("Motivo de la Consulta"), {
            target: { value: "Dolor de cabeza" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Confirmar Cita" }));

        await waitFor(() => {
            expect(createAppointmentMock).toHaveBeenCalledTimes(1);
        });

        const payload = createAppointmentMock.mock.calls[0][0] as {
            patientName: string;
            doctorName: string;
            appointmentDate: string;
            reason: string;
        };

        expect(payload.patientName).toBe("Laura Diaz");
        expect(payload.doctorName).toBe("Carlos Ruiz");
        expect(payload.reason).toBe("Dolor de cabeza");
        expect(payload.appointmentDate).toBe(new Date("2026-03-25T16:30").toISOString());

        expect(toastSuccessMock).toHaveBeenCalledWith("¡Cita creada con éxito!");
        expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("muestra errores por campo cuando backend responde validation error", async () => {
        createAppointmentMock.mockRejectedValue({
            fieldErrors: {
                patientName: ["Nombre requerido"],
            },
        });

        render(<CreateAppointmentForm onSuccess={vi.fn()} onCancel={vi.fn()} />);

        fireEvent.change(screen.getByLabelText("Nombre del Paciente"), {
            target: { value: "Paciente con error" },
        });
        fireEvent.change(screen.getByLabelText("Nombre del Doctor"), {
            target: { value: "Carlos Ruiz" },
        });
        fireEvent.change(screen.getByLabelText("Fecha y Hora"), {
            target: { value: "2026-03-25T16:30" },
        });
        fireEvent.change(screen.getByLabelText("Motivo de la Consulta"), {
            target: { value: "Consulta" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Confirmar Cita" }));

        await waitFor(() => {
            expect(screen.getByText("Nombre requerido")).toBeDefined();
        });

        expect(toastErrorMock).toHaveBeenCalledWith("Por favor revisa los campos señalados");
    });

    it("ejecuta onCancel al pulsar el boton cancelar", () => {
        const onCancel = vi.fn();

        render(<CreateAppointmentForm onSuccess={vi.fn()} onCancel={onCancel} />);

        fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
