"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../DashboardLayout";
import { Clock, CheckCircle, XCircle, AlertCircle, Users, RefreshCw } from "lucide-react";
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
  pending: "bg-blue-100 text-blue-700 border-blue-200",
  confirmed: "bg-indigo-100 text-indigo-700 border-indigo-200",
  "in-progress": "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  no_show: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function ReceptionistQueuePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "in-progress">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((a) => {
    const apptDate = a.date ? new Date(a.date).toISOString().split("T")[0] : "";
    return apptDate === today;
  });

  const filteredAppointments = todayAppointments.filter((a) => {
    if (filter === "all") return true;
    return a.status === filter;
  });

  const stats = {
    total: todayAppointments.length,
    scheduled: todayAppointments.filter((a) => ["pending", "confirmed"].includes(a.status)).length,
    inProgress: todayAppointments.filter((a) => a.status === "in-progress").length,
    completed: todayAppointments.filter((a) => a.status === "completed").length,
  };

  return (
    <DashboardLayout requiredRole="receptionist">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Appointment Queue</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage today's appointment queue</p>
        </div>
        <button
          onClick={fetchAppointments}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-med disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="med-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="med-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="med-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-amber-600 opacity-20" />
          </div>
        </div>
        <div className="med-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(["all", "pending", "confirmed", "in-progress"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-med ${
              filter === f
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f === "all" ? "All" : f.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Queue List */}
      <div className="med-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading queue...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No appointments in this category</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredAppointments.map((appt, index) => (
              <div
                key={appt._id}
                className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-med"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {appt.patientId?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {appt.patientId?.name || "Unknown Patient"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appt.doctorId?.name || "Doctor"} • {appt.reason || "Appointment"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{appt.timeSlot || appt.time || "TBD"}</p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[appt.status]}`}
                    >
                      {appt.status.replace("-", " ")}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
