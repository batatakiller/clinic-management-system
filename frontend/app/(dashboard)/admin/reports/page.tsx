"use client";

import DashboardLayout from "../../DashboardLayout";
import { TrendingUp, BarChart3, Calendar, FileText, Download } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PATIENT_TREND = [
  { month: "Ago", patients: 156 },
  { month: "Set", patients: 189 },
  { month: "Out", patients: 245 },
  { month: "Nov", patients: 312 },
  { month: "Dez", patients: 278 },
  { month: "Jan", patients: 356 },
  { month: "Fev", patients: 412 },
];

const APPOINTMENT_STATUS = [
  { name: "Concluído", value: 65, color: "#10b981" },
  { name: "Agendado", value: 25, color: "#3b82f6" },
  { name: "Cancelado", value: 7, color: "#ef4444" },
  { name: "Ausência", value: 3, color: "#f59e0b" },
];

const DEPARTMENT_STATS = [
  { dept: "Cardiologia", visits: 245, revenue: 48500 },
  { dept: "Clínica Geral", visits: 412, revenue: 62300 },
  { dept: "Pediatria", visits: 198, revenue: 35600 },
  { dept: "Ortopedia", visits: 167, revenue: 42100 },
  { dept: "Dermatologia", visits: 134, revenue: 28900 },
];

export default function ReportsPage() {
  const downloadReport = () => {
    alert("Download do relatório iniciado (demonstração)");
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Relatórios e Análises</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Estatísticas e informações gerais do sistema</p>
        </div>
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-med shadow-md"
        >
          <Download className="w-4 h-4" />
          Exportar Relatório
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Faturamento Total (Mês Atual)", value: "R$ 248.500", change: "+12.5%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Visitas de Pacientes (Mês Atual)", value: "1.247", change: "+8.2%", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Tempo Médio de Espera", value: "14m", change: "-3.1%", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Prontuários Ativos", value: "8.432", change: "+2.4%", icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
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
          <h3 className="font-semibold text-foreground mb-1">Tendência de Volume de Pacientes</h3>
          <p className="text-xs text-muted-foreground mb-4">Últimos 7 meses</p>
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
          <h3 className="font-semibold text-foreground mb-1">Status das Consultas</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribuição deste mês</p>
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
        <h3 className="font-semibold text-foreground mb-1">Desempenho dos Departamentos</h3>
        <p className="text-xs text-muted-foreground mb-4">Mês atual por departamento</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Departamento</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Visitas de Pacientes</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Faturamento</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Média por Visita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DEPARTMENT_STATS.map((dept) => (
                <tr key={dept.dept} className="hover:bg-muted/40 transition-med">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{dept.dept}</td>
                  <td className="px-4 py-3 text-sm text-right text-foreground">{dept.visits.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-emerald-600 font-semibold">R$ {dept.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-muted-foreground">R$ {Math.round(dept.revenue / dept.visits).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
