import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconCheck } from "@tabler/icons-react";
import { useAppointments } from "@/hooks/useAppointments";
import { toast } from "sonner";

interface CreateAppointmentFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function CreateAppointmentForm({ onSuccess, onCancel }: CreateAppointmentFormProps) {
    const { createAppointment } = useAppointments();

    const [formData, setFormData] = useState({
        patientName: "",
        doctorName: "",
        appointmentDate: "",
        reason: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFieldErrors({}); 

        try {
            const dateIso = new Date(formData.appointmentDate).toISOString();
            await createAppointment({
                ...formData,
                appointmentDate: dateIso
            });
            toast.success("¡Cita creada con éxito!");
            onSuccess();
        } catch (err: any) {
            if (err.fieldErrors) {
                setFieldErrors(err.fieldErrors);
                toast.error("Por favor revisa los campos señalados");
            } else {
                toast.error(err.message || "Ocurrió un error al crear la cita");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: [] }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nombre del Paciente</label>
                <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    required
                    className={`w-full h-10 px-3 py-2 rounded-lg border ${fieldErrors.patientName?.length ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'} focus:outline-none focus:ring-2 bg-white text-gray-900`}
                    placeholder="Ej. Juan Pérez"
                />
                {fieldErrors.patientName?.length > 0 && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.patientName[0]}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nombre del Doctor</label>
                <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    required
                    className={`w-full h-10 px-3 py-2 rounded-lg border ${fieldErrors.doctorName?.length ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'} focus:outline-none focus:ring-2 bg-white text-gray-900`}
                    placeholder="Ej. Dra. Ana Gómez"
                />
                {fieldErrors.doctorName?.length > 0 && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.doctorName[0]}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Fecha y Hora</label>
                <input
                    type="datetime-local"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    required
                    className={`w-full h-10 px-3 py-2 rounded-lg border ${fieldErrors.appointmentDate?.length ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'} focus:outline-none focus:ring-2 bg-white text-gray-900`}
                />
                {fieldErrors.appointmentDate?.length > 0 && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.appointmentDate[0]}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Motivo de la Consulta</label>
                <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    rows={3}
                    className={`w-full p-3 rounded-lg border ${fieldErrors.reason?.length ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'} focus:outline-none focus:ring-2 bg-white text-gray-900 resize-none`}
                    placeholder="Síntomas, chequeo general, etc."
                />
                {fieldErrors.reason?.length > 0 && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.reason[0]}</p>
                )}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </Button>
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
    );
}