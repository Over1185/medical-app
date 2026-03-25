"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useAppointments } from "@/hooks/useAppointments";
import type { Appointment, AppointmentStatus } from "@/lib/appointments/types";

export default function AppointmentDetailPage() {
    const router = useRouter();
    const { id } = useParams() as { id: string };
    const { appointments, loading, deleteAppointment, updateStatus } = useAppointments();

    const [appointment, setAppointment] = useState<Appointment | null>(null);

    useEffect(() => {
        if (appointments && appointments.length > 0) {
            const found = appointments.find(a => a.id === id);
            if (found) setAppointment(found);
        }
    }, [appointments, id]);

    const handleDelete = async () => {
        if (confirm("¿Estás seguro de que deseas eliminar esta cita?")) {
            await deleteAppointment(id);
            router.push("/");
        }
    };

    const handleStatusChange = async (newStatus: AppointmentStatus) => {
        await updateStatus(id, newStatus);
        if (appointment) {
            setAppointment({ ...appointment, status: newStatus });
        }
    };

    const getStatusBadgeVariant = (status: AppointmentStatus) => {
        if (status === 'confirmada') return 'success';
        if (status === 'cancelada') return 'danger';
        return 'warning';
    };

    if (loading) return <div className="text-center py-12">Cargando detalles...</div>;
    if (!appointment) return <div className="text-center py-12">Cita no encontrada</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <Link href="/">
                <Button variant="ghost" className="mb-4 -ml-4">
                    <IconArrowLeft className="w-5 h-5 mr-2" />
                    Volver
                </Button>
            </Link>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                    <CardTitle>Detalles de la Cita</CardTitle>
                    <Badge variant={getStatusBadgeVariant(appointment.status)} className="text-sm px-3 py-1">
                        {appointment.status.toUpperCase()}
                    </Badge>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Paciente</h4>
                                <p className="text-lg font-medium text-gray-900 mt-1">{appointment.patientName}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Doctor</h4>
                                <p className="text-lg font-medium text-gray-900 mt-1">Dr. {appointment.doctorName}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</h4>
                                <p className="text-lg font-medium text-gray-900 mt-1">
                                    {new Date(appointment.appointmentDate).toLocaleString('es-ES', {
                                        dateStyle: 'full',
                                        timeStyle: 'short'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Motivo de Consulta</h4>
                            <div className="mt-2 p-4 bg-gray-50 rounded-lg min-h-[100px] text-gray-700">
                                {appointment.reason}
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t flex flex-wrap gap-4 items-center justify-between">
                        <div className="space-x-2">
                            <Button
                                variant="secondary"
                                onClick={() => handleStatusChange('confirmada')}
                                disabled={appointment.status === 'confirmada'}
                            >
                                Confirmar Cita
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => handleStatusChange('cancelada')}
                                disabled={appointment.status === 'cancelada'}
                            >
                                Cancelar Cita
                            </Button>
                        </div>

                        <Button variant="danger" onClick={handleDelete}>
                            <IconTrash className="w-5 h-5 mr-2" />
                            Eliminar Registro
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}