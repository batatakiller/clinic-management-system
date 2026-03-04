"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../DashboardLayout";
import { Calendar, Clock, RefreshCw, Users, CheckCircle, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Appointment {
  _id: string;
  patientId: { _id: string; name: string };
  doctorId: { _id: string; name: string };
  date: string;
  timeSlot: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no_show";
  reason: string;
}

interface DaySchedule {
  date: string;
  dayName: string;
  appointments: Appointment[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  "in-progress": "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-gray-100 text-gray-700",
};

export default function DoctorSchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());

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

  // Generate week days
  const getWeekDays = (baseDate: Date) => {
    const days: DaySchedule[] = [];
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayAppointments = appointments.filter((a) => {
        const apptDate = a.date ? new Date(a.date).toISOString().split("T")[0] : "";
        return apptDate === dateStr;
      });

      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        appointments: dayAppointments,
      });
    }
    return days;
  };

  const weekDays = getWeekDays(selectedWeek);
  const today = new Date().toISOString().split("T")[0];

  const stats = {
    total: appointments.length,
    today: appointments.filter((a) => {
      const apptDate = a.date ? new Date(a.date).toISOString().split("T")[0] : "";
      return apptDate === today;
    }).length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => ["cancelled", "no_show"].includes(a.status)).length,
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + (direction === "prev" ? -7 : 7));
    setSelectedWeek(newDate);
  };

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">My Schedule</h1>
          <p className="text-xs text-muted-foreground mt-0.5">View your weekly appointment schedule</p>
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
              <p className="text-xs text-muted-foreground">Total Appointments</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="med-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600 opacity-20" />
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
        <div className="med-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="med-card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">
            Week of {selectedWeek.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigateWeek("prev")}
              className="px-3 py-1.5 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-med"
            >
              ← Previous
            </button>
            <button
              onClick={() => setSelectedWeek(new Date())}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-med"
            >
              Today
            </button>
            <button
              onClick={() => navigateWeek("next")}
              className="px-3 py-1.5 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-med"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const isToday = day.date === today;
            const appointmentCount = day.appointments.length;
            const completedCount = day.appointments.filter((a) => a.status === "completed").length;

            return (
              <div
                key={day.date}
                className={`p-3 rounded-lg border text-center ${
                  isToday
                    ? "bg-primary/10 border-primary"
                    : "bg-muted/30 border-border"
                }`}
              >
                <p className="text-xs text-muted-foreground uppercase">{day.dayName}</p>
                <p className={`text-lg font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                  {new Date(day.date).getDate()}
                </p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{appointmentCount}</span>
                </div>
                {completedCount > 0 && (
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs text-emerald-600">{completedCount}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointments List */}
      <div className="med-card">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Upcoming Appointments</h3>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading schedule...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No appointments scheduled</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {appointments
              .filter((a) => !["completed", "cancelled", "no_show"].includes(a.status))
              .sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateA - dateB;
              })
              .map((appt) => (
                <div
                  key={appt._id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-med"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {appt.patientId?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{appt.patientId?.name || "Unknown Patient"}</p>
                    <p className="text-xs text-muted-foreground">
                      {appt.reason || "Appointment"} • {appt.timeSlot || "TBD"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {appt.date ? new Date(appt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                      </p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[appt.status]}`}>
                        {appt.status.replace("-", " ")}
                      </span>
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
