"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../../DashboardLayout";
import { Calendar, Clock, Stethoscope, Save, X, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
}

const APPOINTMENT_TYPES = [
  "Check-up Geral",
  "Retorno",
  "Consulta",
  "Emergência",
  "Revisão de Exames",
  "Vacinação",
  "Exame Físico",
];

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30", "17:00",
];

export default function PatientBookAppointmentPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patientId: user?._id || "",
    doctorId: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    type: "Check-up Geral",
    reason: "",
    notes: "",
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await apiFetch("/api/users/doctors");
        setDoctors(res.data || []);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctorId || !formData.time || !formData.reason) {
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          patientId: formData.patientId,
          doctorId: formData.doctorId,
          date: formData.date,
          timeSlot: formData.time,
          reason: formData.reason,
          notes: formData.notes,
        }),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          patientId: user?._id || "",
          doctorId: "",
          date: new Date().toISOString().split("T")[0],
          time: "",
          type: "Check-up Geral",
          reason: "",
          notes: "",
        });
      }, 2000);
    } catch (err) {
      setError("Falha ao agendar consulta. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="patient">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Agendar Consulta</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Agende uma nova consulta com seu médico</p>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Consulta agendada com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="med-card p-6 space-y-5 max-w-2xl">
        <div className="grid grid-cols-1 gap-5">
          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Selecionar Médico <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
              required
            >
              <option value="">Escolha um médico...</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.name} - {doc.specialization || "Clínica Geral"}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Data <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
              required
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Horário <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
              required
            >
              <option value="">Selecione um horário</option>
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Appointment Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tipo de Consulta
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
            >
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Motivo da Visita <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Descreva brevemente por que você precisa consultar o médico..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med resize-none"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Observações Adicionais (Opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Qualquer informação adicional que gostaria de compartilhar..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-med shadow-md"
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Agendando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Agendar Consulta
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setFormData({
              patientId: user?._id || "",
              doctorId: "",
              date: new Date().toISOString().split("T")[0],
              time: "",
              type: "Check-up Geral",
              reason: "",
              notes: "",
            })}
            className="px-6 py-2.5 rounded-xl border border-border hover:bg-muted transition-med flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Limpar
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
