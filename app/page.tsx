"use client";

import React, { useState } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IconPlus, IconTrash, IconCheck, IconX, IconCalendarEvent, IconUser, IconStethoscope } from "@tabler/icons-react";
import Link from "next/link";
import type { AppointmentStatus } from "@/lib/appointments/types";

export default function AppointmentsPage() {
  const { appointments, loading, error, deleteAppointment, updateStatus } = useAppointments();

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
        <Link href="/citas/create">
          <Button>
            <IconPlus className="w-5 h-5 mr-2" />
            Nueva Cita
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando citas...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-border mt-6">
          <IconCalendarEvent className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay citas</h3>
          <p className="text-gray-500 mt-1">Comienza creando una nueva cita médica.</p>
          <Link href="/citas/create" className="inline-block mt-4">
            <Button variant="secondary">Crear Cita</Button>
          </Link>
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
                          onClick={() => updateStatus(appointment.id, 'confirmada')}
                          title="Confirmar"
                        >
                          <IconCheck className="w-5 h-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => updateStatus(appointment.id, 'cancelada')}
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
                      onClick={() => {
                        if(confirm('¿Eliminar cita?')) deleteAppointment(appointment.id);
                      }}
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
    </div>
  );
}
