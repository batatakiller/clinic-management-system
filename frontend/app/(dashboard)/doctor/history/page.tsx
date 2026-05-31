"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../DashboardLayout";
import { Heart, RefreshCw, Search, FileText, Calendar, User } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Patient {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Appointment {
  _id: string;
  patientId: { _id: string; name: string; email?: string };
  date: string;
  timeSlot?: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no_show";
  reason: string;
}

interface PatientHistory {
  patient: Patient;
  appointments: Appointment[];
  lastVisit: string;
  totalVisits: number;
}

const STATUS_TRANSLATION: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  "in-progress": "Em Atendimento",
  completed: "Concluída",
  cancelled: "Cancelada",
  no_show: "Não Compareceu",
};

export default function DoctorHistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await apiFetch("/api/appointments");
      setAppointments(res.data || []);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Group appointments by patient
  const patientHistory: PatientHistory[] = Object.values(
    appointments.reduce((acc, appt) => {
      const patientId = appt.patientId?._id || "unknown";
      if (!acc[patientId]) {
        acc[patientId] = {
          patient: appt.patientId || { _id: patientId, name: "Desconhecido", email: "" },
          appointments: [],
          lastVisit: "",
          totalVisits: 0,
        };
      }
      acc[patientId].appointments.push(appt);
      acc[patientId].totalVisits += 1;
      
      const apptDate = appt.date ? new Date(appt.date).toISOString() : "";
      if (!acc[patientId].lastVisit || apptDate > acc[patientId].lastVisit) {
        acc[patientId].lastVisit = apptDate;
      }
      return acc;
    }, {} as Record<string, PatientHistory>)
  );

  // Filter by search
  const filteredHistory = patientHistory.filter((h) =>
    h.patient.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.patient.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Get selected patient details
  const selectedPatientData = selectedPatient
    ? patientHistory.find((h) => h.patient._id === selectedPatient)
    : null;

  const stats = {
    totalPatients: patientHistory.length,
    thisMonth: patientHistory.filter((h) => {
      const lastVisit = new Date(h.lastVisit);
      const now = new Date();
      return lastVisit.getMonth() === now.getMonth() && lastVisit.getFullYear() === now.getFullYear();
    }).length,
    totalVisits: appointments.length,
    completedVisits: appointments.filter((a) => a.status === "completed").length,
  };

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Histórico Médico</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Visualize o histórico médico dos pacientes e visitas anteriores</p>
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="med-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total de Pacientes</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalPatients}</p>
            </div>
            <User className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="med-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Este Mês</p>
              <p className="text-2xl font-bold text-blue-600">{stats.thisMonth}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="med-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total de Visitas</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalVisits}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600 opacity-20" />
          </div>
        </div>
        <div className="med-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Concluídas</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.completedVisits}</p>
            </div>
            <Heart className="w-8 h-8 text-emerald-600 opacity-20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Patient List */}
        <div className="lg:col-span-1 med-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground mb-3">Pacientes</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar pacientes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
              />
            </div>
          </div>
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-muted-foreground/30 mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Carregando pacientes...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-12 text-center">
              <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum paciente encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {filteredHistory.map((h) => (
                <button
                  key={h.patient._id}
                  onClick={() => setSelectedPatient(h.patient._id)}
                  className={`w-full p-4 text-left hover:bg-muted/40 transition-med ${
                    selectedPatient === h.patient._id ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {h.patient.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "P"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{h.patient.name || "Desconhecido"}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.totalVisits} consulta{h.totalVisits !== 1 ? "s" : ""} • Última: {h.lastVisit ? new Date(h.lastVisit).toLocaleDateString("pt-BR") : "N/A"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-2 med-card">
          {selectedPatientData ? (
            <>
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {selectedPatientData.patient.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "P"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedPatientData.patient.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPatientData.patient.email} • {selectedPatientData.totalVisits} consultas no total
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Histórico de Visitas</h4>
                {selectedPatientData.appointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhum histórico de consultas</p>
                ) : (
                  <div className="space-y-3">
                    {selectedPatientData.appointments
                      .sort((a, b) => {
                        const dateA = a.date ? new Date(a.date).getTime() : 0;
                        const dateB = b.date ? new Date(b.date).getTime() : 0;
                        return dateB - dateA;
                      })
                      .map((appt) => (
                        <div
                          key={appt._id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {appt.reason || "Consulta"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {appt.date ? new Date(appt.date).toLocaleDateString("pt-BR", { 
                                weekday: "short", 
                                month: "short", 
                                day: "numeric",
                                year: "numeric"
                              }) : "Sem data"} • {appt.timeSlot || "Sem horário"}
                            </p>
                          </div>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            appt.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                            appt.status === "cancelled" ? "bg-red-100 text-red-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {STATUS_TRANSLATION[appt.status] || appt.status}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-12">
              <div className="text-center">
                <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Selecione um paciente para visualizar seu histórico médico</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
