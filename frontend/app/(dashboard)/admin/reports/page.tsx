"use client";

import DashboardLayout from "../../DashboardLayout";
import { TrendingUp, BarChart3, Calendar, FileText, Download } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PATIENT_TREND = [
  { month: "Aug", patients: 156 },
  { month: "Sep", patients: 189 },
  { month: "Oct", patients: 245 },
  { month: "Nov", patients: 312 },
  { month: "Dec", patients: 278 },
  { month: "Jan", patients: 356 },
  { month: "Feb", patients: 412 },
];

const APPOINTMENT_STATUS = [
  { name: "Completed", value: 65, color: "#10b981" },
  { name: "Scheduled", value: 25, color: "#3b82f6" },
  { name: "Cancelled", value: 7, color: "#ef4444" },
  { name: "No-show", value: 3, color: "#f59e0b" },
];

const DEPARTMENT_STATS = [
  { dept: "Cardiology", visits: 245, revenue: 48500 },
  { dept: "General Medicine", visits: 412, revenue: 62300 },
  { dept: "Pediatrics", visits: 198, revenue: 35600 },
  { dept: "Orthopedics", visits: 167, revenue: 42100 },
  { dept: "Dermatology", visits: 134, revenue: 28900 },
];

export default function ReportsPage() {
  const downloadReport = () => {
    alert("Report download initiated (demo)");
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">System-wide statistics and insights</p>
        </div>
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-med shadow-md"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Revenue (MTD)", value: "$248,500", change: "+12.5%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Patient Visits (MTD)", value: "1,247", change: "+8.2%", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Avg. Wait Time", value: "14m", change: "-3.1%", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Active Records", value: "8,432", change: "+2.4%", icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat) => (
          <div key={stat.label} className="med-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`text-xs font-semibold ${stat.change.startsWith("+") ? "text-emerald-600" : "text-red-600"}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Patient Trend */}
        <div className="med-card p-5">
          <h3 className="font-semibold text-foreground mb-1">Patient Volume Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Last 7 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={PATIENT_TREND}>
              <defs>
                <linearGradient id="patientGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Area type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} fill="url(#patientGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Appointment Status */}
        <div className="med-card p-5">
          <h3 className="font-semibold text-foreground mb-1">Appointment Status</h3>
          <p className="text-xs text-muted-foreground mb-4">This month distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={APPOINTMENT_STATUS}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {APPOINTMENT_STATUS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Stats */}
      <div className="med-card p-5">
        <h3 className="font-semibold text-foreground mb-1">Department Performance</h3>
        <p className="text-xs text-muted-foreground mb-4">This month by department</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Department</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Patient Visits</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Revenue</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Avg. per Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DEPARTMENT_STATS.map((dept) => (
                <tr key={dept.dept} className="hover:bg-muted/40 transition-med">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{dept.dept}</td>
                  <td className="px-4 py-3 text-sm text-right text-foreground">{dept.visits.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-emerald-600 font-semibold">${dept.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-muted-foreground">${Math.round(dept.revenue / dept.visits).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
