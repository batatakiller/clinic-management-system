"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth, type UserRole } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  BarChart3,
  Settings,
  ClipboardList,
  UserPlus,
  CalendarPlus,
  ListTodo,
  FileText,
  Bot,
  Heart,
  ChevronLeft,
  ChevronRight,
  Activity,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
};

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { label: "Users", href: "/admin/users", icon: <Users className="w-[18px] h-[18px]" /> },
    { label: "Doctors", href: "/admin/doctors", icon: <Stethoscope className="w-[18px] h-[18px]" /> },
    { label: "Appointments", href: "/admin/appointments", icon: <Calendar className="w-[18px] h-[18px]" /> },
    { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="w-[18px] h-[18px]" /> },
    { label: "Reports", href: "/admin/reports", icon: <FileText className="w-[18px] h-[18px]" /> },
    { label: "AI Assistant", href: "/chatbot", icon: <Bot className="w-[18px] h-[18px]" />, badge: "AI" },
    { label: "Settings", href: "/admin/settings", icon: <Settings className="w-[18px] h-[18px]" /> },
  ],
  doctor: [
    { label: "Dashboard", href: "/doctor", icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { label: "Patient Queue", href: "/doctor/queue", icon: <ListTodo className="w-[18px] h-[18px]" /> },
    { label: "Medical History", href: "/doctor/history", icon: <Heart className="w-[18px] h-[18px]" /> },
    { label: "Prescriptions", href: "/doctor/prescription", icon: <ClipboardList className="w-[18px] h-[18px]" /> },
    { label: "AI Symptom Check", href: "/doctor/ai", icon: <Bot className="w-[18px] h-[18px]" />, badge: "AI" },
    { label: "Schedule", href: "/doctor/schedule", icon: <Calendar className="w-[18px] h-[18px]" /> },
  ],
  receptionist: [
    { label: "Dashboard", href: "/receptionist", icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { label: "Book Appointment", href: "/receptionist/book-appointment", icon: <CalendarPlus className="w-[18px] h-[18px]" /> },
    { label: "Appointments", href: "/receptionist/appointments", icon: <Calendar className="w-[18px] h-[18px]" /> },
    { label: "Register Patient", href: "/receptionist/register-patient", icon: <UserPlus className="w-[18px] h-[18px]" /> },
    { label: "Queue", href: "/receptionist/queue", icon: <ListTodo className="w-[18px] h-[18px]" /> },
    { label: "AI Assistant", href: "/chatbot", icon: <Bot className="w-[18px] h-[18px]" />, badge: "AI" },
  ],
  patient: [
    { label: "Dashboard", href: "/patient", icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { label: "My Appointments", href: "/patient/appointments", icon: <Calendar className="w-[18px] h-[18px]" /> },
    { label: "Prescriptions", href: "/patient/prescriptions", icon: <FileText className="w-[18px] h-[18px]" /> },
    { label: "Medical History", href: "/patient/history", icon: <Heart className="w-[18px] h-[18px]" /> },
    { label: "AI Assistant", href: "/chatbot", icon: <Bot className="w-[18px] h-[18px]" />, badge: "AI" },
  ],
};

const ROLE_META: Record<UserRole, { label: string; bg: string; text: string; lightBg: string }> = {
  admin: { label: "Administrator", bg: "bg-slate-900", text: "text-white", lightBg: "bg-slate-100 text-slate-700" },
  doctor: { label: "Doctor", bg: "bg-blue-600", text: "text-white", lightBg: "bg-blue-50 text-blue-700" },
  receptionist: { label: "Receptionist", bg: "bg-slate-800", text: "text-white", lightBg: "bg-slate-100 text-slate-700" },
  patient: { label: "Patient", bg: "bg-emerald-600", text: "text-white", lightBg: "bg-emerald-50 text-emerald-700" },
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  if (!user || !user.role) return null;

  const navItems = NAV_ITEMS[user.role] ?? [];
  const roleMeta = ROLE_META[user.role];

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    router.push("/login");
    onClose?.();
  };

  return (
    <aside
      style={{
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        width: collapsed ? "72px" : "264px",
      }}
      className="h-full flex flex-col bg-white border-r border-slate-200/80 flex-shrink-0 relative overflow-hidden"
    >
      {/* Decorative top strip */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${roleMeta.bg}`} />

      {/* ── Brand header ─────────────────────────────────────────── */}
      <div
        className={`flex items-center h-16 px-4 border-b border-slate-100 flex-shrink-0 ${collapsed ? "justify-center" : "gap-3"}`}
      >
        {/* Logo mark */}
        <div
          className={`w-8 h-8 flex-shrink-0 rounded-lg ${roleMeta.bg} flex items-center justify-center`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v3h3c.55 0 1 .45 1 1s-.45 1-1 1h-3v3c0 .55-.45 1-1 1s-1-.45-1-1v-3H8c-.55 0-1-.45-1-1s.45-1 1-1h3V7c0-.55.45-1 1-1z" />
          </svg>
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span className="text-[15px] font-extrabold tracking-tight text-slate-900">
              Health<span className="text-blue-600">Care</span>
              <span className="text-slate-400 font-light"> MS</span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium -mt-0.5">Medical Management System</p>
          </div>
        )}

        {/* Collapse toggle — desktop only */}
        {onClose == null && !collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {onClose == null && collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1">
        {!collapsed && (
          <p className="px-2 mb-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu
          </p>
        )}
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${user.role}` && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={`
                group flex items-center gap-3 rounded-lg text-sm font-medium cursor-pointer select-none
                transition-all duration-200
                ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}
                ${isActive
                  ? `bg-slate-100 text-slate-900`
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              <span className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="px-1.5 py-0.5 rounded flex items-center justify-center text-[10px] font-medium bg-slate-200 text-slate-700">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="mx-3 border-t border-slate-100" />

      {/* ── User card ─────────────────────────────────────────────── */}
      <div className={`flex-shrink-0 px-3 py-4 ${collapsed ? "px-2" : ""}`}>
        <div className={`flex items-center gap-2.5 ${collapsed ? "justify-center flex-col" : ""}`}>
          <div
            className={`w-9 h-9 flex-shrink-0 rounded-full ${roleMeta.bg} flex items-center justify-center text-white text-xs font-semibold`}
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{roleMeta.label}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
