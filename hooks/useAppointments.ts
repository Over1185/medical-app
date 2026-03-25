import { useState, useCallback, useEffect } from 'react';
import type { Appointment, CreateAppointmentInput, AppointmentStatus } from '@/lib/appointments/types';

export function useAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/appointments');
            if (!res.ok) throw new Error('Error al cargar las citas');
            const json = await res.json();
            setAppointments(json.data || []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createAppointment = async (input: CreateAppointmentInput) => {
        const res = await fetch('/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error('Error al crear la cita');
        await fetchAppointments();
    };

    const updateStatus = async (id: string, status: AppointmentStatus) => {
        const res = await fetch(`/appointments/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Error al actualizar el estado');
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    };

    const deleteAppointment = async (id: string) => {
        const res = await fetch(`/appointments/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar la cita');
        setAppointments(prev => prev.filter(a => a.id !== id));
    };

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
