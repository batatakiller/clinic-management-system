"use client";

import DashboardLayout from "../../DashboardLayout";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, Users, Star, DollarSign } from "lucide-react";

const REVENUE = [
    { month: "Aug", revenue: 42000, expenses: 28000 },
    { month: "Sep", revenue: 51000, expenses: 31000 },
    { month: "Oct", revenue: 47000, expenses: 30000 },
    { month: "Nov", revenue: 58000, expenses: 34000 },
    { month: "Dec", revenue: 63000, expenses: 36000 },
    { month: "Jan", revenue: 55000, expenses: 33000 },
    { month: "Feb", revenue: 71000, expenses: 38000 },
    { month: "Mar", revenue: 68000, expenses: 37000 },
];

const DOCTORS = [
    { name: "Dr. Carter", patients: 142, satisfaction: 4.8, revenue: 28400 },
    { name: "Dr. Nguyen", patients: 118, satisfaction: 4.7, revenue: 23600 },
    { name: "Dr. Ross", patients: 96, satisfaction: 4.6, revenue: 19200 },
    { name: "Dr. Patel", patients: 134, satisfaction: 4.9, revenue: 26800 },
    { name: "Dr. Webb", patients: 88, satisfaction: 4.5, revenue: 17600 },
];

const DEPT_PIE = [
    { name: "Cardiology", value: 28, color: "#2563eb" },
    { name: "General", value: 22, color: "#0d9488" },
    { name: "Endocrinology", value: 18, color: "#7c3aed" },
    { name: "Pulmonology", value: 15, color: "#f59e0b" },
    { name: "Other", value: 17, color: "#94a3b8" },
];

const APPT_STATUS = [
    { month: "Jan", Completed: 310, Cancelled: 24, "No-Show": 18 },
    { month: "Feb", Completed: 342, Cancelled: 19, "No-Show": 12 },
    { month: "Mar", Completed: 289, Cancelled: 28, "No-Show": 21 },
];

function StatCard({ icon: Icon, label, value, sub, color, bg }: { icon: React.ElementType; label: string; value: string; sub: string; color: string; bg: string }) {
    return (
        <div className="med-card p-5">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-4.5 h-4.5 ${color}`} />
                </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">{sub}</p>
        </div>
    );
}

export default function AdminAnalyticsPage() {
    return (
        <DashboardLayout requiredRole="admin">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-foreground">Analytics Overview</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Performance metrics · March 2026</p>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={DollarSign} label="Monthly Revenue" value="$68,000" sub="↑ 9.7% vs Feb" color="text-blue-600" bg="bg-blue-50" />
                <StatCard icon={Users} label="Total Patients" value="578" sub="↑ 12% this month" color="text-purple-600" bg="bg-purple-50" />
                <StatCard icon={Star} label="Avg. Satisfaction" value="4.7 ★" sub="↑ 0.2 pts" color="text-amber-600" bg="bg-amber-50" />
                <StatCard icon={TrendingUp} label="Appointments Done" value="289" sub="94% completion" color="text-teal-600" bg="bg-teal-50" />
            </div>

            {/* Revenue trend */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
                <div className="xl:col-span-2 med-card p-5">
                    <h3 className="font-semibold text-foreground mb-4">Revenue vs Expenses (8 Months)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={REVENUE} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                            <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#revGrad)" name="Revenue" dot={{ r: 3, fill: "#2563eb" }} />
                            <Area type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} fill="url(#expGrad)" name="Expenses" dot={{ r: 3, fill: "#f59e0b" }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Department pie */}
                <div className="med-card p-5">
                    <h3 className="font-semibold text-foreground mb-4">Patient by Department</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie data={DEPT_PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                                {DEPT_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: "10px", fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 mt-2">
                        {DEPT_PIE.map(d => (
                            <div key={d.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                                    <span className="text-muted-foreground">{d.name}</span>
                                </div>
                                <span className="font-semibold text-foreground">{d.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Doctor Performance */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
                <div className="med-card p-5">
                    <h3 className="font-semibold text-foreground mb-4">Doctor Patient Load</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={DOCTORS} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} />
                            <Bar dataKey="patients" fill="#2563eb" radius={[6, 6, 0, 0]} name="Patients" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="med-card p-5">
                    <h3 className="font-semibold text-foreground mb-4">Appointment Outcomes</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={APPT_STATUS} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                            <YAxis dataKey="month" type="category" tick={{ fontSize: 12, fill: "#64748b" }} />
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="Completed" fill="#10b981" radius={[0, 4, 4, 0]} stackId="a" />
                            <Bar dataKey="Cancelled" fill="#f59e0b" radius={[0, 0, 0, 0]} stackId="a" />
                            <Bar dataKey="No-Show" fill="#ef4444" radius={[0, 4, 4, 0]} stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Doctor performance table */}
            <div className="med-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Doctor Performance Leaderboard</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                {["Rank", "Doctor", "Patients", "Revenue", "Satisfaction"].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {[...DOCTORS].sort((a, b) => b.patients - a.patients).map((d, i) => (
                                <tr key={d.name} className="hover:bg-muted/20 transition-med">
                                    <td className="px-5 py-3">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-slate-700" : i === 2 ? "bg-orange-300 text-white" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                                    </td>
                                    <td className="px-5 py-3 font-medium text-foreground">{d.name}</td>
                                    <td className="px-5 py-3 text-muted-foreground">{d.patients}</td>
                                    <td className="px-5 py-3 text-foreground font-medium">${d.revenue.toLocaleString()}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                                                <div className="h-full rounded-full bg-amber-400" style={{ width: `${(d.satisfaction / 5) * 100}%` }} />
                                            </div>
                                            <span className="text-xs font-semibold text-foreground">{d.satisfaction}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
