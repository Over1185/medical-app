"use client";

import { useState } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { CreateAppointmentForm } from "@/components/appointments/CreateAppointmentForm";
import { IconPlus, IconTrash, IconCheck, IconX, IconCalendarEvent, IconStethoscope } from "@tabler/icons-react";
import Link from "next/link";
import type { AppointmentStatus } from "@/lib/appointments/types";
import { toast } from "sonner";

export default function AppointmentsPage() {
  const { appointments, loading, error, deleteAppointment, updateStatus, refresh } = useAppointments();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

  const getStatusBadgeVariant = (status: AppointmentStatus) => {
    if (status === 'confirmada') return 'success';
    if (status === 'cancelada') return 'danger';
    return 'warning';
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Citas Médicas</h1>
          <p className="text-gray-500 mt-1">Gestiona los pacientes y horarios</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <IconPlus className="w-5 h-5 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {loading && appointments.length === 0 ? (
        <div className="relative mt-6">
          <div className="grid gap-4 opacity-50 blur-[2px] pointer-events-none">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl flex flex-col items-center">
              <Spinner className="w-12 h-12 text-primary" />
              <p className="text-gray-800 font-medium mt-4">Actualizando citas médicas...</p>
            </div>
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-border mt-6">
          <IconCalendarEvent className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay citas</h3>
          <p className="text-gray-500 mt-1">Comienza creando una nueva cita médica.</p>
          <Button variant="secondary" onClick={() => setIsCreateModalOpen(true)} className="mt-4">
            Crear Cita
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 mt-6">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{appointment.patientName}</h3>
                      <Badge variant={getStatusBadgeVariant(appointment.status)}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <IconStethoscope className="w-4 h-4" />
                        Dr. {appointment.doctorName}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IconCalendarEvent className="w-4 h-4" />
                        {new Date(appointment.appointmentDate).toLocaleString('es-ES', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {appointment.status === 'pendiente' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={async () => {
                            try {
                              await updateStatus(appointment.id, 'confirmada');
                              toast.success("Cita confirmada correctamente");
                            } catch (e: any) {
                              toast.error("Error al confirmar cita");
                            }
                          }}
                          title="Confirmar"
                        >
                          <IconCheck className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={async () => {
                            try {
                              await updateStatus(appointment.id, 'cancelada');
                              toast.success("Cita cancelada correctamente");
                            } catch (e: any) {
                              toast.error("Error al cancelar cita");
                            }
                          }}
                          title="Cancelar"
                        >
                          <IconX className="w-5 h-5" />
                        </Button>
                      </>
                    )}
                    <Link href={`/citas/${appointment.id}`}>
                      <Button variant="secondary" size="sm">Ver Detalles</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => setAppointmentToDelete(appointment.id)}
                    >
                      <IconTrash className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Creación Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Agendar Nueva Cita"
      >
        <CreateAppointmentForm
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refresh();
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Eliminación Modal */}
      <Modal
        isOpen={appointmentToDelete !== null}
        onClose={() => setAppointmentToDelete(null)}
        title="Eliminar Cita"
      >
        <div className="space-y-4">
          <p className="text-gray-600">¿Estás seguro de que deseas eliminar permanentemente esta cita? Esta acción no se puede deshacer.</p>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Button variant="ghost" onClick={() => setAppointmentToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (appointmentToDelete) {
                  deleteAppointment(appointmentToDelete).then(() => { toast.success("Cita eliminada correctamente"); }).catch(() => toast.error("Error al eliminar cita")); setAppointmentToDelete(null);
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
