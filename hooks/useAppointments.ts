import { useState, useCallback, useEffect } from 'react';
import type { Appointment, CreateAppointmentInput, AppointmentStatus } from '@/lib/appointments/types';

type FieldErrors = Record<string, string[]>;
type CreateAppointmentApiError = Error & {
    fieldErrors?: FieldErrors;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error) {
        return error.message;
    }

    return fallback;
};

/**
 * Hook de acceso y gestión de citas en el frontend.
 * Expone estado local, acciones CRUD y refresco manual de datos.
 */
export function useAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Obtiene todas las citas desde la API y sincroniza estado local.
     */
    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/appointments');
            if (!res.ok) throw new Error('Error al cargar las citas');
            const json = await res.json();
            setAppointments(json.data || []);
            setError(null);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Error al cargar las citas'));
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Crea una cita y vuelve a sincronizar la lista para mantener consistencia.
     */
    const createAppointment = async (input: CreateAppointmentInput) => {
        const res = await fetch('/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            if (errorData?.error) {
                const errorMessage = errorData.error.message || 'Error al crear la cita';
                const newErr = new Error(errorMessage) as CreateAppointmentApiError;
                if (errorData.error.code === 'VALIDATION_ERROR' && errorData.error.details?.fieldErrors) {
                    newErr.fieldErrors = errorData.error.details.fieldErrors;
                }
                throw newErr;
            }
            throw new Error('Error al crear la cita');
        }

        await fetchAppointments();
    };

    /**
     * Actualiza estado con enfoque optimista para feedback inmediato.
     * Si la API falla, revierte al estado previo.
     */
    const updateStatus = async (id: string, status: AppointmentStatus) => {
        const previousState = [...appointments];
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));

        try {
            const res = await fetch(`/appointments/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error('Error al actualizar el estado');
        } catch (error) {
            setAppointments(previousState);
            throw error;
        }
    };

    /**
     * Elimina una cita con actualización optimista y rollback en caso de error.
     */
    const deleteAppointment = async (id: string) => {
        const previousState = [...appointments];
        setAppointments(prev => prev.filter(a => a.id !== id));
        try {
            const res = await fetch(`/appointments/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar la cita');
        } catch (err: unknown) {
            setAppointments(previousState);
            throw err;
        }
    };

    // Carga inicial al montar el hook.
    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    return {
        appointments,
        loading,
        error,
        createAppointment,
        updateStatus,
        deleteAppointment,
        refresh: fetchAppointments
    };
}
