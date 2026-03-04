"use client";

import DashboardLayout from "../DashboardLayout";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  Users, Calendar, Clock, ClipboardList, Bot, ChevronRight,
  TrendingDown, TrendingUp, Activity, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";



const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-slate-100 text-slate-700 border-slate-200",
  "in-progress": "bg-blue-50 text-blue-700 border-blue-100",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-red-50 text-red-700 border-red-100",
};

interface AppointmentData {
  id?: string; _id?: string; date?: string; time?: string; status?: string;
  doctor?: { _id: string } | string; patient?: { name: string; age?: number | string };
}
interface QueueItem { name: string; age: number | string; time: string; status: string; }
interface ApiResponse<T> { data: T[]; }

export default function DoctorDashboard() {
  const { user, isLoading } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState({ todayPatients: "...", appointments: "...", prescriptions: "..." });

  useEffect(() => {
    const fetch = async () => {
      if (isLoading || !user) return;
      try {
        const [appointmentsRes, rxRes] = await Promise.all([
          apiFetch("/api/appointments").catch(() => ({ data: [] })) as Promise<ApiResponse<AppointmentData>>,
          apiFetch("/api/prescriptions/doctor/my").catch(() => ({ data: [] })) as Promise<ApiResponse<unknown>>,
        ]);
        const myAppts = appointmentsRes.data?.filter((a) => {
          const dId = typeof a.doctor === "object" ? a.doctor?._id : a.doctor;
          return dId === user._id;
        }) || [];
        const today = new Date().toISOString().split("T")[0];
        const todayApps = myAppts.filter((a) => a.date?.startsWith(today));
        setStats({ todayPatients: todayApps.length.toString(), appointments: myAppts.length.toString(), prescriptions: (rxRes.data?.length || 0).toString() });
        setQueue(todayApps.slice(0, 5).map((a) => ({
          name: a.patient?.name || "Unknown Patient",
          age: a.patient?.age || "--",
          time: a.time || "TBD",
          status: a.status || "scheduled",
        })));
      } catch (e) { console.error(e); }
    };
    fetch();
  }, [user, isLoading]);

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="max-w-7xl mx-auto space-y-8 pb-8">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Physician Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, Dr. {user?.name?.split(" ")[0] || "Doctor"}. Here is your schedule for today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/doctor/ai" className="h-9 px-4 flex items-center justify-center gap-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              AI Symptom Checker
            </Link>
            <Link href="/doctor/queue" className="h-9 px-4 flex items-center justify-center bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
              View Full Queue
            </Link>
          </div>
        </div>

        {/* ── Stats ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Today's Patients", value: stats.todayPatients, icon: Users, change: "+3 v.s yesterday", trend: "up" },
            { label: "Total Appointments", value: stats.appointments, icon: Calendar, change: "+12% this week", trend: "up" },
            { label: "Avg. Wait Time", value: "18m", icon: Clock, change: "-2m target", trend: "down" },
            { label: "Prescriptions Issued", value: stats.prescriptions, icon: ClipboardList, change: "Stable", trend: "neutral" },
          ].map((s) => {
            const Icon = s.icon;
            const TrendIcon = s.trend === "up" ? TrendingUp : s.trend === "down" ? TrendingDown : Activity;
            const trendColor = s.trend === "up" ? "text-emerald-600" : s.trend === "down" ? "text-blue-600" : "text-slate-500";
            return (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{s.label}</p>
                    <p className="text-3xl font-semibold text-slate-900 mt-2 tracking-tight">{s.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Icon className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm mt-2">
                  <span className={`flex items-center gap-1 font-medium ${trendColor}`}>
                    <TrendIcon className="w-4 h-4" />
                    {s.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Today's Queue */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Today's Appointment Queue</h3>
                <p className="text-sm text-slate-500 mt-0.5">{stats.todayPatients} scheduled visits</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {queue.length > 0 ? queue.map((p, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-sm font-medium border border-slate-200 flex-shrink-0">
                    {p.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{p.name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">Age: {p.age} • {p.time}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-md border capitalize ${STATUS_BADGE[p.status] || STATUS_BADGE.scheduled}`}>
                    {p.status}
                  </span>
                </div>
              )) : (
                <div className="py-16 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">No patients queued for today</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Assist CTA */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-md flex flex-col text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 flex-shrink-0">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Diagnostic Assist</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                Enter symptoms to generate potential differential diagnoses, analyze risk levels, and output structured reports powered by GPT-4o.
              </p>
              <Link href="/doctor/ai" className="block w-full text-center py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                Launch Assistant
              </Link>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Patient Load Forecast</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">Estimated patient volume this week</p>
            <div className="flex-1 min-h-[240px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50 mt-4">
              <div className="text-center">
                <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500">No forecast data</p>
                <p className="text-xs text-slate-400 mt-1">Sufficient patient volume data will appear here.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Top Diagnoses</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">Distribution over the last 6 months</p>
            <div className="flex-1 min-h-[240px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50 mt-4">
              <div className="text-center">
                <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500">No diagnostic data</p>
                <p className="text-xs text-slate-400 mt-1">Diagnosis trends will appear here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
