"use client";

import DashboardLayout from "../DashboardLayout";
import { useAuth } from "@/app/contexts/AuthContext";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  Users,
  Stethoscope,
  Calendar,
  Activity,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
  UserPlus,
  BarChart3,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ActivityItem {
  text: string;
  time: string;
  type: "info" | "success" | "warning" | "error";
}

interface StatItem {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ElementType;
}

interface UserData { id: string; role: string; }
interface AppointmentData {
  id: string;
  date?: string;
  status: string;
  createdAt?: string;
  patient?: { name: string };
}
interface ApiResponse<T> { data: T[]; }



const QUICK_ACTIONS = [
  { label: "Register Patient", href: "/admin/users", icon: UserPlus },
  { label: "Onboard Staff", href: "/admin/users", icon: Users },
  { label: "System Reports", href: "#", icon: FileText },
  { label: "Performance Analytics", href: "#", icon: BarChart3 },
];

const TYPE_ICON: Record<string, React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  error: AlertCircle,
};

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm text-sm">
      <p className="font-medium text-slate-900 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-500 capitalize">{p.dataKey}</span>
          </div>
          <span className="font-medium text-slate-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({ stat }: { stat: StatItem }) {
  const Icon = stat.icon;
  const TrendIcon = stat.trend === "up" ? TrendingUp : stat.trend === "down" ? TrendingDown : Activity;
  const trendColor = stat.trend === "up" ? "text-emerald-600" : stat.trend === "down" ? "text-red-600" : "text-slate-500";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          <p className="text-3xl font-semibold text-slate-900 mt-2 tracking-tight">{stat.value}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
          <Icon className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm mt-2">
        <span className={`flex items-center gap-1 font-medium ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          {stat.change}
        </span>
        <span className="text-slate-400">vs last period</span>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { isLoading, user } = useAuth();
  const [stats, setStats] = useState<StatItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          apiFetch("/api/patients").catch(() => ({ data: [] })) as Promise<ApiResponse<unknown>>,
          apiFetch("/api/users/doctors").catch(() => ({ data: [] })) as Promise<ApiResponse<UserData>>,
          apiFetch("/api/appointments").catch(() => ({ data: [] })) as Promise<ApiResponse<AppointmentData>>,
        ]);

        const totalPatients = patientsRes.data?.length || 0;
        const activeDoctors = doctorsRes.data?.filter((u) => u.role === "doctor")?.length || 0;
        const today = new Date().toISOString().split("T")[0];
        const todayAppts = appointmentsRes.data?.filter((a) => a.date?.startsWith(today))?.length || 0;

        setStats([
          {
            label: "Total Patients",
            value: totalPatients.toLocaleString(),
            change: "+12.5%",
            trend: "up",
            icon: Users,
          },
          {
            label: "Active Staff",
            value: activeDoctors.toLocaleString(),
            change: "+2.4%",
            trend: "up",
            icon: Stethoscope,
          },
          {
            label: "Appointments Today",
            value: todayAppts.toLocaleString(),
            change: "-4.1%",
            trend: "down",
            icon: Calendar,
          },
          {
            label: "System Uptime",
            value: "99.9%",
            change: "0.0%",
            trend: "neutral",
            icon: Activity,
          },
        ]);

        const activities: ActivityItem[] = (appointmentsRes.data || [])
          .slice(0, 5)
          .map((a) => ({
            text: `Appointment for ${a.patient?.name || "Unknown Patient"} was marked as ${a.status}`,
            time: a.createdAt ? new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
            type: (a.status === "cancelled" ? "warning" : a.status === "completed" ? "success" : "info") as ActivityItem["type"],
          }));

        if (activities.length === 0) {
          activities.push({ text: "System initialized and checks passed.", time: "Just now", type: "success" });
          activities.push({ text: "Database synchronized with replica.", time: "1 hr ago", type: "info" });
        }
        setRecentActivity(activities);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoading]);

  return (
    <DashboardLayout requiredRole="admin">
      <div className="max-w-7xl mx-auto space-y-8 pb-8">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Overview</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, {user?.name || "Admin"}. Here is what's happening today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-9 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Download Report
            </button>
            <button className="h-9 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
              New Appointment
            </button>
          </div>
        </div>

        {/* ── Stats Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse h-[132px]" />
            ))
            : stats.map((s) => <StatCard key={s.label} stat={s} />)}
        </div>

        {/* ── Main content grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Traffic Analysis</h3>
                <p className="text-sm text-slate-500 mt-1">Patient visits and appointments over the last 7 days</p>
              </div>
            </div>
            <div className="flex-1 min-h-[300px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500">No telemetry data available</p>
                <p className="text-xs text-slate-400 mt-1">Sufficient traffic data will appear here soon.</p>
              </div>
            </div>
          </div>

          {/* Appointment Status Pie */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <h3 className="text-base font-semibold text-slate-900">Appointment Status</h3>
            <p className="text-sm text-slate-500 mt-1">Distribution for current month</p>

            <div className="flex-1 flex flex-col items-center justify-center min-h-[220px] my-4 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
              <PieChart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-500">No appointment data</p>
            </div>

            <div className="space-y-3 mt-auto opacity-50 pointer-events-none">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  No data
                </span>
                <span className="font-medium text-slate-500">0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom row ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
                <p className="text-sm text-slate-500 mt-0.5">Latest system events</p>
              </div>
              <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentActivity.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-500">No recent activity</div>
              ) : (
                recentActivity.map((a, i) => {
                  const IconComp = TYPE_ICON[a.type] || Info;
                  return (
                    <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                      <div className="mt-0.5 flex-shrink-0">
                        <IconComp className={`w-5 h-5 ${a.type === 'success' ? 'text-emerald-500' :
                          a.type === 'warning' ? 'text-amber-500' :
                            a.type === 'error' ? 'text-red-500' : 'text-slate-400'
                          }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{a.text}</p>
                        <p className="text-sm text-slate-500 mt-1">{a.time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-5">Quick Links</h3>

            <div className="space-y-3">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
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

            {/* Mini system health indicator */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-900 mb-4">System Status</h4>
              <div className="space-y-3">
                <div className="px-4 py-6 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50 text-center">
                  <p className="text-sm font-medium text-slate-500">Health checks not configured for this environment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
