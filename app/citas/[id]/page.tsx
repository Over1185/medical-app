"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { SkeletonDetail } from "@/components/ui/Skeleton";
import { IconArrowLeft, IconTrash, IconCalendarEvent } from "@tabler/icons-react";
import Link from "next/link";
import { useAppointments } from "@/hooks/useAppointments";
import { toast } from "sonner";
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
        if (!confirm("¿Estás seguro de que deseas eliminar permanentemente esta cita?")) return;

        try {
            await deleteAppointment(id);
            toast.success("Cita eliminada correctamente");
            router.push("/");
        } catch (err: any) {
            toast.error(err.message || "Error al eliminar cita");
        }
    };

    const handleStatusChange = async (newStatus: AppointmentStatus) => {
        try {
            await updateStatus(id, newStatus);
            if (appointment) setAppointment({ ...appointment, status: newStatus });
            toast.success(`Cita marcada como ${newStatus}`);
        } catch (err: any) {
            toast.error(err.message || "Error al actualizar estado");
        }
    };

    const getStatusBadgeVariant = (status: AppointmentStatus) => {
        if (status === 'confirmada') return 'success';
        if (status === 'cancelada') return 'danger';
        return 'warning';
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-500 relative">
                <Link href="/">
                    <Button variant="ghost" className="mb-2 -ml-3 text-gray-500 hover:text-gray-900" disabled>
                        <IconArrowLeft className="w-5 h-5 mr-2" />
                        Volver al Panel
                    </Button>
                </Link>
                <div className="opacity-50 blur-[2px] pointer-events-none">
                    <SkeletonDetail />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl flex flex-col items-center">
                        <Spinner className="w-12 h-12 text-primary" />
                        <p className="text-gray-800 font-medium mt-4">Cargando detalles de consulta...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 mt-10 max-w-3xl mx-auto shadow-sm animate-in fade-in duration-500">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cita no encontrada</h3>
                <p className="text-gray-500 mb-6">El registro que buscas no existe o ha sido eliminado.</p>
                <Link href="/">
                    <Button>Ir al Panel Principal</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
            <Link href="/">
                <Button variant="ghost" className="mb-2 -ml-3 text-gray-500 hover:text-gray-900">
                    <IconArrowLeft className="w-5 h-5 mr-2" />
                    Volver al Panel
                </Button>
            </Link>

            <Card className="shadow-lg border-border">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 gap-4 bg-gray-50/50 rounded-t-xl">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-gray-900">Consulta de Paciente</CardTitle>
                        <p className="text-sm text-gray-500">Gestión individual de la cita médica</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(appointment.status)} className="text-sm px-4 py-1.5 shadow-sm self-start sm:self-center">
                        {appointment.status.toUpperCase()}
                    </Badge>
                </CardHeader>
                <CardContent className="pt-8 px-6 sm:px-10 pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-8">
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <IconCalendarEvent className="w-4 h-4" />
                                    Fecha Programada
                                </h4>
                                <p className="text-xl font-semibold text-gray-900">
                                    {new Date(appointment.appointmentDate).toLocaleString('es-ES', {
                                        dateStyle: 'full',
                                    })}
                                </p>
                                <p className="text-md text-gray-600 mt-1">
                                    {new Date(appointment.appointmentDate).toLocaleString('es-ES', {
                                        timeStyle: 'short'
                                    })} Hrs
                                </p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Paciente</h4>
                                <p className="text-xl font-medium text-gray-900">{appointment.patientName}</p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Especialista</h4>
                                <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                        {appointment.doctorName.charAt(0)}
                                    </span>
                                    Dr. {appointment.doctorName}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col h-full">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Motivo de Consulta</h4>
                            <div className="p-6 bg-yellow-50/50 border border-yellow-100 rounded-xl flex-grow text-gray-700 leading-relaxed shadow-inner">
                                {appointment.reason}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button
                                variant="secondary"
                                onClick={() => handleStatusChange('confirmada')}
                                disabled={appointment.status === 'confirmada'}
                                className="w-full sm:w-auto shadow-sm"
                            >
                                Confirmar Asistencia
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => handleStatusChange('cancelada')}
                                disabled={appointment.status === 'cancelada'}
                                className="w-full sm:w-auto shadow-sm"
                            >
                                Cancelar Cita
                            </Button>
                        </div>

                        <Button variant="danger" onClick={handleDelete} className="w-full sm:w-auto mt-4 sm:mt-0 shadow-sm">
                            <IconTrash className="w-5 h-5 mr-2" />
                            Eliminar Registro
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}