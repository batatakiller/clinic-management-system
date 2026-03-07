"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../DashboardLayout";
import {
  Calendar,
  FileText,
  Download,
  HelpCircle,
  X,
  Loader2,
  Languages,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "../../../contexts/AuthContext";

interface Prescription {
  _id: string;
  doctor?: { name: string };
  diagnosis: string;
  medicines: { name: string; dosage: string; frequency: string }[];
  generalInstructions?: string;
  createdAt: string;
}

interface Appointment {
  _id: string;
  doctor?: { name: string; specialization?: string };
  patient?: { _id: string };
  date: string;
  timeSlot?: string;
  reason: string;
  status: string;
  type?: string;
}

const STATUS_COLOR: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  "no-show": "bg-gray-100 text-gray-700",
};

function AIModal({
  prescription,
  onClose,
}: {
  prescription: Prescription;
  onClose: () => void;
}) {
  const [lang, setLang] = useState<"English" | "Urdu">("English");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fetchExplanation = async (language: "English" | "Urdu") => {
    setLoading(true);
    setErr(null);
    setExplanation(null);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = (() => {
        if (typeof localStorage !== "undefined") {
          try {
            const stored = localStorage.getItem("hms_auth");
            if (stored) {
              const parsed = JSON.parse(stored);
              return parsed.token || null;
            }
          } catch {
            return null;
          }
        }
        return null;
      })();

      const res = await fetch(
        `${baseUrl}/api/prescriptions/${prescription._id}/explanation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ language }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setErr(data.message ?? data.error ?? "Unknown error");
        return;
      }
      setExplanation(data.data?.explanation || data.explanation);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Could not connect to AI service. Please try again.";
      setErr(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const switchLang = (l: "English" | "Urdu") => {
    setLang(l);
    fetchExplanation(l);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                AI Prescription Explainer
              </h3>
              <p className="text-xs text-muted-foreground">
                {prescription.doctor?.name || "Doctor"} ·{" "}
                {new Date(prescription.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-med"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!explanation && !loading && !err && (
            <div className="text-center py-8">
              <HelpCircle className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Get a simple explanation of your prescription in English or Urdu
              </p>
              <p className="text-xs text-muted-foreground mb-6 font-medium">
                {prescription.diagnosis}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => switchLang("English")}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-med"
                >
                  <Languages className="w-4 h-4" /> English
                </button>
                <button
                  onClick={() => switchLang("Urdu")}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-med"
                >
                  <Languages className="w-4 h-4" /> اردو
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">
                AI is generating your explanation…
              </p>
            </div>
          )}

          {err && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
              {err}
            </div>
          )}

          {explanation && !loading && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-muted-foreground">
                  Language:
                </span>
                <div className="flex gap-1.5">
                  {(["English", "Urdu"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLang(l);
                        if (l !== lang) {
                          setLang(l);
                          fetchExplanation(l);
                        }
                      }}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-med ${
                        lang === l
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {l === "Urdu" ? "اردو" : l}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className={`prose prose-sm max-w-none text-foreground text-sm leading-relaxed whitespace-pre-wrap ${
                  lang === "Urdu" ? "text-right font-[system-ui]" : ""
                }`}
                dir={lang === "Urdu" ? "rtl" : "ltr"}
              >
                {explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PatientAppointmentsPage() {
  const { user } = useAuth();
  const [activeModal, setActiveModal] = useState<Prescription | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      try {
        const [apptRes, rxRes] = await Promise.all([
          apiFetch("/api/appointments").catch(() => ({ data: [] })),
          apiFetch(`/api/prescriptions/patient/${user._id}`).catch(() => ({
            data: [],
          })),
        ]);

        // Filter appointments for this patient only
        const patientAppointments = (apptRes.data || []).filter(
          (a: Appointment & { patient?: { _id: string } }) =>
            a.patient?._id === user._id,
        );

        setAppointments(patientAppointments || []);
        setPrescriptions(rxRes.data || []);
      } catch (err) {
        console.error("Failed to fetch patient data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id]); // Only depend on user._id to prevent re-fetching

  const upcoming = appointments.filter((a) =>
    ["scheduled", "confirmed"].includes(a.status?.toLowerCase()),
  );
  const past = appointments.filter(
    (a) => !["scheduled", "confirmed"].includes(a.status?.toLowerCase()),
  );

  const downloadPDF = async (rx: Prescription) => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = (() => {
        if (typeof localStorage !== "undefined") {
          try {
            const stored = localStorage.getItem("hms_auth");
            if (stored) {
              const parsed = JSON.parse(stored);
              return parsed.token || null;
            }
          } catch {
            return null;
          }
        }
        return null;
      })();

      const response = await fetch(
        `${baseUrl}/api/prescriptions/${rx._id}/pdf`,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prescription_${rx._id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to download PDF";
      alert(errorMsg); // Show to user
    }
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="patient">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              Loading your appointments...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="patient">
      {activeModal && (
        <AIModal
          prescription={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">My Appointments</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {upcoming.length} upcoming · {past.length} past
        </p>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Upcoming
          </h2>
          <div className="space-y-3">
            {upcoming.map((a) => (
              <div
                key={a._id}
                className="med-card p-5 border-l-4 border-l-blue-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {a.doctor?.name || "Doctor"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.doctor?.specialization || "General"} ·{" "}
                        {a.reason || a.type || "Appointment"}
                      </p>
                      <p className="text-xs font-medium text-blue-600 mt-1">
                        {new Date(a.date).toLocaleDateString()} at{" "}
                        {a.timeSlot || "TBD"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      STATUS_COLOR[a.status?.toLowerCase()] ||
                      STATUS_COLOR.scheduled
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Past Visits
        </h2>
        <div className="space-y-3">
          {past.length > 0 ? (
            past.map((a) => (
              <div key={a._id} className="med-card p-5 opacity-80">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {a.doctor?.name || "Doctor"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.doctor?.specialization || "General"} ·{" "}
                        {a.reason || a.type || "Appointment"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(a.date).toLocaleDateString()} at{" "}
                        {a.timeSlot || "TBD"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      STATUS_COLOR[a.status?.toLowerCase()] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="med-card p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No past appointments</p>
            </div>
          )}
        </div>
      </div>

      {/* Prescriptions */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          My Prescriptions
        </h2>
        {prescriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {prescriptions.map((rx) => (
              <div key={rx._id} className="med-card p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5 text-purple-600" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(rx.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs font-semibold text-muted-foreground">
                  {rx.doctor?.name || "Doctor"}
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5 mb-3">
                  {rx.diagnosis}
                </p>
                <div className="space-y-1.5 flex-1 mb-4">
                  {rx.medicines.slice(0, 3).map((m) => (
                    <div
                      key={m.name}
                      className="text-xs text-muted-foreground flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                      {m.name} {m.dosage} · {m.frequency}
                    </div>
                  ))}
                  {rx.medicines.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{rx.medicines.length - 3} more medicines
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveModal(rx)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100 transition-med border border-purple-100"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Explain
                  </button>
                  <button
                    onClick={() => downloadPDF(rx)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-med border border-primary/10"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
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
    </DashboardLayout>
  );
}
