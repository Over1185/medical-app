"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import Link from "next/link";
import { useAppointments } from "@/hooks/useAppointments";

export default function CreateAppointmentPage() {
    const router = useRouter();
    const { createAppointment } = useAppointments();

    const [formData, setFormData] = useState({
        patientName: "",
        doctorName: "",
        appointmentDate: "",
        reason: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Necesitamos enviar ISO string real a la API
            const dateIso = new Date(formData.appointmentDate).toISOString();
            await createAppointment({
                ...formData,
                appointmentDate: dateIso
            });
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Error al crear la cita");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <Link href="/">
                <Button variant="ghost" className="mb-4 -ml-4">
                    <IconArrowLeft className="w-5 h-5 mr-2" />
                    Volver
                </Button>
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Agendar Nueva Cita</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nombre del Paciente</label>
                            <input
                                type="text"
                                name="patientName"
                                value={formData.patientName}
                                onChange={handleChange}
                                required
                                className="w-full h-10 px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Ej. Juan Pérez"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nombre del Doctor</label>
                            <input
                                type="text"
                                name="doctorName"
                                value={formData.doctorName}
                                onChange={handleChange}
                                required
                                className="w-full h-10 px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Ej. Dra. Ana Gómez"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Fecha y Hora</label>
                            <input
                                type="datetime-local"
                                name="appointmentDate"
                                value={formData.appointmentDate}
                                onChange={handleChange}
                                required
                                className="w-full h-10 px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Motivo de la Consulta</label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full p-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Síntomas, chequeo general, etc."
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : (
                                    <>
                                        <IconCheck className="w-5 h-5 mr-2" />
                                        Confirmar Cita
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}