"use client";

import DashboardLayout from "../../DashboardLayout";
import { FileText, Download, Calendar, Clock, User } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "../../../contexts/AuthContext";

interface Prescription {
  _id: string;
  diagnosis: string;
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  generalInstructions?: string;
  createdAt: string;
  doctor?: { name: string; specialization?: string };
}

interface Appointment {
  _id: string;
  date: string;
  timeSlot?: string;
  reason: string;
  status: string;
  doctor?: { name: string; specialization?: string };
}

export default function PatientHistoryPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        if (!user?._id) {
          setError("User not authenticated");
          return;
        }

        const [rxData, apptData] = await Promise.all([
          apiFetch(`/api/prescriptions/patient/${user._id}`).catch(() => ({ data: [] })),
          apiFetch(`/api/appointments`).catch(() => ({ data: [] })),
        ]);

        // Filter appointments for this patient
        const patientAppointments = (apptData.data || []).filter(
          (a: Appointment & { patient?: { _id: string } }) => 
            a.patient?._id === user._id
        );

        setPrescriptions(rxData.data || []);
        setAppointments(patientAppointments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchHistory();
  }, [user]);

  const downloadPDF = async (rx: Prescription) => {
    try {
      const response = await fetch(`/api/prescriptions/${rx._id}/pdf`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("hms-token")}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prescription_${rx._id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="patient">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your medical history...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="patient">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">My Medical History</h1>
        <p className="text-xs text-muted-foreground mt-0.5">View your complete medical records</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="med-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{prescriptions.length}</p>
              <p className="text-xs text-muted-foreground">Prescriptions</p>
            </div>
          </div>
        </div>
        <div className="med-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
              <p className="text-xs text-muted-foreground">Appointments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions History */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Prescription History
        </h2>
        {prescriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((rx) => (
              <div key={rx._id} className="med-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{rx.diagnosis}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadPDF(rx)}
                    className="p-2 rounded-lg hover:bg-muted transition-med"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-1">
                  {rx.medicines.slice(0, 3).map((med, i) => (
                    <div key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {med.name} {med.dosage}
                    </div>
                  ))}
                  {rx.medicines.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{rx.medicines.length - 3} more medicines</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="med-card p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No prescriptions yet</p>
          </div>
        )}
      </div>

      {/* Appointments History */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Appointment History
        </h2>
        {appointments.length > 0 ? (
          <div className="med-card overflow-hidden">
            <div className="divide-y divide-border">
              {appointments.slice(0, 10).map((appt) => (
                <div key={appt._id} className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-med">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{appt.reason}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(appt.date).toLocaleDateString()}
                      </span>
                      {appt.timeSlot && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {appt.timeSlot}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      appt.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : appt.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="med-card p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No appointment history yet</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
