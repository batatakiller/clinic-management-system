"use client";

import DashboardLayout from "../DashboardLayout";
import { UserPlus, Calendar, ListTodo, ChevronRight, User, Stethoscope, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-slate-100 text-slate-700 border-slate-200",
  "in-progress": "bg-blue-50 text-blue-700 border-blue-100",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-red-50 text-red-700 border-red-100",
};

interface AppointmentData {
  _id?: string; patient?: { name: string; _id: string } | string;
  doctor?: { name: string; _id: string } | string;
  status?: string; date?: string; time?: string; type?: string;
}
interface PatientData { _id?: string; createdAt?: string; }
interface FormattedBooking { patient: string; doctor: string; time: string; type: string; status: string; }
interface ApiResponse<T> { data: T[]; }

export default function ReceptionistDashboard() {
  const { user, isLoading } = useAuth();
  const [bookings, setBookings] = useState<FormattedBooking[]>([]);
  const [stats, setStats] = useState({ newReg: "...", todayBookings: "...", inQueue: "..." });

  useEffect(() => {
    const fetchRecData = async () => {
      if (isLoading) return;
      try {
        const [apptsRes, patientsRes] = await Promise.all([
          apiFetch("/api/appointments").catch(() => ({ data: [] })) as Promise<ApiResponse<AppointmentData>>,
          apiFetch("/api/patients").catch(() => ({ data: [] })) as Promise<ApiResponse<PatientData>>,
        ]);
        const today = new Date().toISOString().split("T")[0];
        const todayAppts = (apptsRes.data || []).filter((a) => a.date?.startsWith(today));
        const inQueueCount = todayAppts.filter((a) => a.status === "scheduled" || a.status === "in-progress").length;
        const newRegCount = (patientsRes.data || []).filter((p) => p.createdAt?.startsWith(today)).length;
        setStats({ newReg: newRegCount.toString(), todayBookings: todayAppts.length.toString(), inQueue: inQueueCount.toString() });
        setBookings(todayAppts.slice(0, 10).map((a) => ({
          patient: (typeof a.patient === "object" ? a.patient?.name : "Patient") || "Unknown Patient",
          doctor: (typeof a.doctor === "object" ? a.doctor?.name : "Doctor") || "Assigned Doctor",
          time: a.time || "TBD",
          type: a.type || "General Checkup",
          status: a.status || "scheduled",
        })));
      } catch (err) { console.error(err); }
    };
    fetchRecData();
  }, [isLoading]);

  return (
    <DashboardLayout requiredRole="receptionist">
      <div className="max-w-7xl mx-auto space-y-8 pb-8">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Front Desk</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome, {user?.name?.split(" ")[0] || "Receptionist"}. Manage today's clinic flow.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/receptionist/book-appointment" className="h-9 px-4 flex items-center justify-center gap-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <Calendar className="w-4 h-4" /> Book Slot
            </Link>
            <Link href="/receptionist/register-patient" className="h-9 px-4 flex items-center justify-center gap-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
              <UserPlus className="w-4 h-4" /> Register Patient
            </Link>
          </div>
        </div>

        {/* ── Stats ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "New Registrations today", value: stats.newReg, icon: UserPlus },
            { label: "Bookings Today", value: stats.todayBookings, icon: Calendar },
            { label: "Waiting in Queue", value: stats.inQueue, icon: ListTodo },
            { label: "Avg Check-in Time", value: "N/A", icon: Clock },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">{s.label}</h3>
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
          {/* Today's Appointments */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Today's Schedule</h3>
                <p className="text-sm text-slate-500 mt-0.5">{stats.todayBookings} confirmed visits</p>
              </div>
              <Link href="/receptionist/appointments" className="text-sm text-blue-600 font-medium hover:text-blue-700">
                View Schedule
              </Link>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {bookings.length > 0 ? bookings.map((b, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-sm font-medium text-slate-700">
                      {b.patient.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{b.patient}</p>
                    <p className="text-sm text-slate-500 mt-0.5">Dr. {b.doctor} &bull; {b.type}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-sm font-medium text-slate-900">{b.time}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded border capitalize ${STATUS_BADGE[b.status] || STATUS_BADGE.scheduled}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="py-16 text-center text-sm text-slate-500">No bookings for today.</div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <h3 className="text-base font-semibold text-slate-900 mb-5">Desk Tasks</h3>

            <div className="space-y-3">
              {[
                { label: "Register New Patient", icon: UserPlus, href: "/receptionist/register-patient" },
                { label: "Book Appointment", icon: Calendar, href: "/receptionist/book-appointment" },
                { label: "Manage Today's Queue", icon: ListTodo, href: "/receptionist/queue" }
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-colors">
                        <Icon className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        {action.label}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">All systems active</p>
                <p className="text-xs text-slate-500 mt-1">Ready for check-ins</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
