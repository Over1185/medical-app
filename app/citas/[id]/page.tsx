"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { SkeletonDetail } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { IconArrowLeft, IconTrash, IconCalendarEvent } from "@tabler/icons-react";
import Link from "next/link";
import { useAppointments } from "@/hooks/useAppointments";
import { toast } from "sonner";
import type { Appointment, AppointmentStatus } from "@/lib/appointments/types";

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error) {
        return error.message;
    }

    return fallback;
};

/**
 * Vista de detalle para una cita individual.
 * Permite consultar datos, cambiar estado y eliminar el registro.
 */
export default function AppointmentDetailPage() {
    const router = useRouter();
    const { id } = useParams() as { id: string };
    const { appointments, loading, deleteAppointment, updateStatus, updateAppointment } = useAppointments();

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        patientName: "",
        doctorName: "",
        appointmentDate: "",
        reason: "",
    });

    const toLocalDateTime = (isoDate: string): string => {
        const date = new Date(isoDate);
        const timezoneOffsetInMs = date.getTimezoneOffset() * 60 * 1000;
        return new Date(date.getTime() - timezoneOffsetInMs).toISOString().slice(0, 16);
    };

    const syncEditForm = (source: Appointment) => {
        setEditFormData({
            patientName: source.patientName,
            doctorName: source.doctorName,
            appointmentDate: toLocalDateTime(source.appointmentDate),
            reason: source.reason,
        });
    };

    // Resuelve la cita actual a partir del id de la ruta y la lista cargada.
    useEffect(() => {
        if (appointments && appointments.length > 0) {
            const found = appointments.find(a => a.id === id);
            if (found) {
                setAppointment(found);
                syncEditForm(found);
            }
        }
    }, [appointments, id]);

    /**
     * Ejecuta eliminación confirmada y redirige al dashboard al finalizar.
     */
    const confirmDelete = async () => {
        try {
            await deleteAppointment(id);
            toast.success("Cita eliminada correctamente");
            router.push("/");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Error al eliminar cita"));
            setIsDeleteModalOpen(false);
        }
    };

    /**
     * Cambia el estado remoto y sincroniza la copia local del detalle.
     */
    const handleStatusChange = async (newStatus: AppointmentStatus) => {
        try {
            await updateStatus(id, newStatus);
            if (appointment) setAppointment({ ...appointment, status: newStatus });
            toast.success(`Cita marcada como ${newStatus}`);
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Error al actualizar estado"));
        }
    };

    const handleEditFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        try {
            const updated = await updateAppointment(id, {
                patientName: editFormData.patientName,
                doctorName: editFormData.doctorName,
                appointmentDate: new Date(editFormData.appointmentDate).toISOString(),
                reason: editFormData.reason,
            });
            setAppointment(updated);
            setIsEditing(false);
            toast.success("Cita actualizada correctamente");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Error al actualizar la cita"));
        }
    };

    const handleCancelEdit = () => {
        if (appointment) {
            syncEditForm(appointment);
        }
        setIsEditing(false);
    };

    /**
     * Traduce estado de negocio a variante visual del badge.
     */
    const getStatusBadgeVariant = (status: AppointmentStatus) => {
        if (status === 'confirmada') return 'success';
        if (status === 'cancelada') return 'danger';
        return 'warning';
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-500 relative w-full flex flex-col">
                <Link href="/">
                    <Button variant="ghost" className="mb-2 -ml-3 text-gray-500 hover:text-gray-900" disabled>
                        <IconArrowLeft className="w-5 h-5 mr-2" />
                        Volver al Panel
                    </Button>
                </Link>
                <div className="relative w-full">
                    <div className="opacity-50 blur-[2px] pointer-events-none w-full">
                        <SkeletonDetail />
                    </div>
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-2 pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center w-full max-w-70 sm:max-w-sm border border-gray-100">
                            <Spinner className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                            <p className="text-gray-800 font-medium mt-3 sm:mt-4 text-sm sm:text-base">Cargando detalles de consulta...</p>
                        </div>
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
                                {isEditing ? (
                                    <input
                                        aria-label="Fecha Programada"
                                        type="datetime-local"
                                        name="appointmentDate"
                                        value={editFormData.appointmentDate}
                                        onChange={handleEditFieldChange}
                                        className="w-full h-10 px-3 py-2 rounded-lg border border-border focus:ring-primary focus:outline-none focus:ring-2 bg-white text-gray-900"
                                    />
                                ) : (
                                    <>
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
                                    </>
                                )}
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Paciente</h4>
                                {isEditing ? (
                                    <input
                                        aria-label="Paciente"
                                        type="text"
                                        name="patientName"
                                        value={editFormData.patientName}
                                        onChange={handleEditFieldChange}
                                        className="w-full h-10 px-3 py-2 rounded-lg border border-border focus:ring-primary focus:outline-none focus:ring-2 bg-white text-gray-900"
                                    />
                                ) : (
                                    <p className="text-xl font-medium text-gray-900">{appointment.patientName}</p>
                                )}
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Especialista</h4>
                                {isEditing ? (
                                    <input
                                        aria-label="Especialista"
                                        type="text"
                                        name="doctorName"
                                        value={editFormData.doctorName}
                                        onChange={handleEditFieldChange}
                                        className="w-full h-10 px-3 py-2 rounded-lg border border-border focus:ring-primary focus:outline-none focus:ring-2 bg-white text-gray-900"
                                    />
                                ) : (
                                    <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shadow-sm">
                                            {appointment.doctorName.charAt(0).toUpperCase()}
                                        </span>
                                        Dr. {appointment.doctorName}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col h-full">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Motivo de Consulta</h4>
                            {isEditing ? (
                                <textarea
                                    aria-label="Motivo de Consulta"
                                    name="reason"
                                    rows={4}
                                    value={editFormData.reason}
                                    onChange={handleEditFieldChange}
                                    className="p-4 bg-white border border-border rounded-xl grow text-gray-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            ) : (
                                <div className="p-6 bg-yellow-50/50 border border-yellow-100 rounded-xl grow text-gray-700 leading-relaxed shadow-inner">
                                    {appointment.reason}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="primary"
                                        onClick={handleSaveChanges}
                                        className="w-full sm:w-auto shadow-sm"
                                    >
                                        Guardar Cambios
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handleCancelEdit}
                                        className="w-full sm:w-auto"
                                    >
                                        Cancelar Edicion
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsEditing(true)}
                                    className="w-full sm:w-auto shadow-sm"
                                >
                                    Editar Datos
                                </Button>
                            )}
                            <Button
                                variant="secondary"
                                onClick={() => handleStatusChange('confirmada')}
                                disabled={isEditing || appointment.status === 'confirmada'}
                                className="w-full sm:w-auto shadow-sm"
                            >
                                Confirmar Asistencia
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => handleStatusChange('cancelada')}
                                disabled={isEditing || appointment.status === 'cancelada'}
                                className="w-full sm:w-auto shadow-sm"
                            >
                                Cancelar Cita
                            </Button>
                        </div>

                        <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)} className="w-full md:w-auto shadow-sm">
                            <IconTrash className="w-5 h-5 mr-2" />
                            Eliminar Registro
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Eliminar Cita"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">¿Estás seguro de que deseas eliminar permanentemente esta cita? Esta acción no se puede deshacer.</p>
                    <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100">
                        <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="w-full sm:w-auto">
                            Cancelar
                        </Button>
                        <Button variant="danger" onClick={confirmDelete} className="w-full sm:w-auto">
                            Eliminar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
