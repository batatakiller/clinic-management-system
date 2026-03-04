"use client";

import DashboardLayout from "../DashboardLayout";
import { Calendar, FileText, Heart, Clock, TrendingUp, TrendingDown, Activity, ChevronRight, Pill, User, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";

const STATUS_COLOR: Record<string, string> = {
  Upcoming: "bg-blue-50 text-blue-700 border-blue-100",
  Completed: "bg-slate-100 text-slate-700 border-slate-200",
  Cancelled: "bg-red-50 text-red-700 border-red-100",
};



interface AppointmentData {
  _id?: string; doctor?: { name: string; _id: string } | string;
  patient?: { _id: string } | string; status?: string; date?: string; time?: string; type?: string;
}
interface PrescriptionData {
  _id?: string; medications?: Array<{ name: string; refills?: number }>;
  issuedAt?: string; createdAt?: string;
}
interface FormattedAppointment { doctor: string; type: string; date: string; time: string; status: string; }
interface FormattedPrescription { name: string; issued: string; refills: number; }
interface ApiResponse<T> { data: T[]; }

export default function PatientDashboard() {
  const { user, isLoading } = useAuth();
  const [appointments, setAppointments] = useState<FormattedAppointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<FormattedPrescription[]>([]);
  const [stats, setStats] = useState({ nextAppt: "...", activeRx: "...", records: "..." });

  useEffect(() => {
    const load = async () => {
      if (isLoading || !user) return;
      try {
        const [apptsRes, rxRes] = await Promise.all([
          apiFetch("/api/appointments").catch(() => ({ data: [] })) as Promise<ApiResponse<AppointmentData>>,
          apiFetch(`/api/prescriptions/patient/${user._id}`).catch(() => ({ data: [] })) as Promise<ApiResponse<PrescriptionData>>,
        ]);
        const myAppts = apptsRes.data?.filter((a) => {
          const pId = typeof a.patient === "object" ? a.patient?._id : a.patient;
          return pId === user._id;
        }) || [];
        const now = new Date();
        const upcoming = myAppts.filter((a) => a.status === "scheduled" && a.date && new Date(a.date) >= now).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
        const nextApptLabel = upcoming.length > 0 && upcoming[0].date ? new Date(upcoming[0].date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "None";
        setStats({ nextAppt: nextApptLabel, activeRx: (rxRes.data?.length || 0).toString(), records: myAppts.length.toString() });
        setAppointments(myAppts.slice(0, 5).map((a) => ({
          doctor: (typeof a.doctor === "object" ? a.doctor?.name : "Doctor") || "Doctor",
          type: a.type || "Appointment",
          date: a.date ? new Date(a.date).toLocaleDateString() : "TBD",
          time: a.time || "TBD",
          status: { scheduled: "Upcoming", completed: "Completed", cancelled: "Cancelled" }[a.status?.toLowerCase() || "scheduled"] || "Upcoming",
        })));
        setPrescriptions((rxRes.data || []).slice(0, 4).map((r) => ({
          name: r.medications?.[0]?.name || "General Prescription",
          issued: r.issuedAt ? new Date(r.issuedAt).toLocaleDateString() : new Date(r.createdAt || Date.now()).toLocaleDateString(),
          refills: r.medications?.[0]?.refills || 0,
        })));
      } catch (e) { console.error(e); }
    };
    load();
  }, [user, isLoading]);

  return (
    <DashboardLayout requiredRole="patient">
      <div className="max-w-7xl mx-auto space-y-8 pb-8">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Patient Portal</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, {user?.name}. Manage your health records and upcoming visits.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/chatbot" className="h-9 px-4 flex items-center justify-center gap-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Talk to AI Assistant
            </Link>
            <Link href="/patient/appointments" className="h-9 px-4 flex items-center justify-center bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
              Book Visit
            </Link>
          </div>
        </div>

        {/* ── Stats ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Next Appointment", value: stats.nextAppt, icon: Calendar },
            { label: "Active Prescriptions", value: stats.activeRx, icon: Pill },
            { label: "Health Documents", value: stats.records, icon: FileText },
            { label: "Vitals Logged", value: "0", icon: Heart },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{s.label}</p>
                    <p className="text-[28px] font-semibold text-slate-900 mt-2 tracking-tight">{s.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Icon className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">My Appointments</h3>
                <p className="text-sm text-slate-500 mt-0.5">Recent and upcoming visits</p>
              </div>
              <Link href="/patient/appointments" className="text-sm text-blue-600 font-medium hover:text-blue-700">
                View All
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {appointments.length > 0 ? appointments.map((a, i) => (
                <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">Dr. {a.doctor}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{a.type} &bull; {a.date} at {a.time}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${STATUS_COLOR[a.status] || STATUS_COLOR.Upcoming}`}>
                    {a.status}
                  </span>
                </div>
              )) : (
                <div className="px-6 py-10 text-center text-sm text-slate-500">No recent appointments.</div>
              )}
            </div>
          </div>

          {/* Prescriptions & Vitals */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-900">Current Medications</h3>
              <Pill className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-3">
              {prescriptions.length > 0 ? prescriptions.map((rx, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/30">
                  <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <Pill className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{rx.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Issued: {rx.issued} &bull; Refills: {rx.refills}</p>
                  </div>
                </div>
              )) : (
                <div className="py-4 text-center text-sm text-slate-500">No active prescriptions.</div>
              )}
            </div>

            {/* Health Vitals Indicator */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Latest Vitals</h4>
              <div className="space-y-4">
                <div className="py-4 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                  <Heart className="w-5 h-5 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 font-medium">No vitals logged recently.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
