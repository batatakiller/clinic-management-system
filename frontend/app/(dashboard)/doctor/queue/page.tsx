"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../DashboardLayout";
import { Clock, CheckCircle, SkipForward, AlertCircle, User, RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Appointment {
  _id: string;
  patientId: { _id: string; name: string };
  doctorId: { _id: string; name: string };
  date: string;
  timeSlot: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no_show";
  reason: string;
  notes?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  "in-progress": "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-gray-100 text-gray-700",
};

const STATUS_TRANSLATION: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  "in-progress": "Em Atendimento",
  completed: "Concluída",
  cancelled: "Cancelada",
  no_show: "Não Compareceu",
};

export default function DoctorQueuePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentPatient, setCurrentPatient] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await apiFetch("/api/appointments");
      const today = new Date().toISOString().split("T")[0];
      const todayAppts = (res.data || []).filter((a: Appointment) => {
        const apptDate = a.date ? new Date(a.date).toISOString().split("T")[0] : "";
        return apptDate === today;
      });
      setAppointments(todayAppts);

      // Set first in-progress or scheduled as current
      const inProgress = todayAppts.find((a: Appointment) => a.status === "in-progress");
      const scheduled = todayAppts.find((a: Appointment) => ["pending", "confirmed"].includes(a.status));
      setCurrentPatient(inProgress?._id || scheduled?._id || null);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  const handleStartConsultation = async (id: string) => {
    try {
      await apiFetch(`/api/appointments/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "in-progress" }),
      });
      setCurrentPatient(id);
      fetchAppointments();
    } catch (error) {
      console.error("Failed to update appointment status:", error);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await apiFetch(`/api/appointments/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "completed" }),
      });
      setCurrentPatient(null);
      fetchAppointments();
    } catch (error) {
      console.error("Failed to update appointment status:", error);
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    if (a.status === "in-progress") return -1;
    if (b.status === "in-progress") return 1;
    if (["pending", "confirmed"].includes(a.status) && ["pending", "confirmed"].includes(b.status)) {
      return (a.timeSlot || "").localeCompare(b.timeSlot || "");
    }
    return 0;
  });

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Fila de Pacientes</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Gerencie sua fila de pacientes para hoje</p>
        </div>
        <button
          onClick={fetchAppointments}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-med disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Current Patient */}
        <div className="lg:col-span-2">
          <div className="med-card p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Paciente Atual</h2>
            </div>

            {currentPatient ? (
              (() => {
                const patient = appointments.find(a => a._id === currentPatient);
                if (!patient) return null;
                return (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                        {patient.patientId?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "P"}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{patient.patientId?.name || "Paciente Desconhecido"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {patient.reason || "Consulta"} • {patient.timeSlot || "A definir"}
                        </p>
                        <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[patient.status]}`}>
                          {STATUS_TRANSLATION[patient.status] || patient.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {patient.status !== "completed" && (
                        <>
                          <button
                            onClick={() => handleComplete(currentPatient)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-med shadow-md"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Concluir
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-semibold hover:bg-muted/80 transition-med">
                            <SkipForward className="w-4 h-4" />
                            Pular
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="py-8 text-center">
                <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum paciente em atendimento no momento</p>
                <p className="text-xs text-muted-foreground mt-1">Selecione um paciente na fila para começar</p>
              </div>
            )}
          </div>
        </div>

        {/* Queue Stats */}
        <div className="space-y-4">
          <div className="med-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Aguardando</p>
                <p className="text-2xl font-bold text-blue-600">
                  {appointments.filter(a => ["pending", "confirmed"].includes(a.status)).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="med-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Em Atendimento</p>
                <p className="text-2xl font-bold text-amber-600">
                  {appointments.filter(a => a.status === "in-progress").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-600 opacity-20" />
            </div>
          </div>
          <div className="med-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {appointments.filter(a => a.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600 opacity-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="mt-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Próximos Pacientes</h2>
        <div className="med-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Carregando fila...</p>
            </div>
          ) : sortedAppointments.filter(a => !["completed", "cancelled", "no_show"].includes(a.status)).length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-600 opacity-30 mx-auto mb-4" />
              <p className="text-muted-foreground">Todos os pacientes atendidos por hoje!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sortedAppointments.filter(a => !["completed", "cancelled", "no_show"].includes(a.status)).map((appt) => (
                <div
                  key={appt._id}
                  className={`flex items-center gap-4 p-4 transition-med ${
                    currentPatient === appt._id ? "bg-primary/5" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {appt.patientId?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{appt.patientId?.name || "Paciente Desconhecido"}</p>
                    <p className="text-xs text-muted-foreground">
                      {appt.reason || "Consulta"} • {appt.timeSlot || "A definir"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{appt.timeSlot || "A definir"}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[appt.status]}`}>
                        {STATUS_TRANSLATION[appt.status] || appt.status}
                      </span>
                    </div>
                    {["pending", "confirmed"].includes(appt.status) && currentPatient !== appt._id && (
                      <button
                        onClick={() => handleStartConsultation(appt._id)}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-med"
                      >
                        Iniciar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
