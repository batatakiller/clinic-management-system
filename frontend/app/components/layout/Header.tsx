"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, ROLE_LABELS } from "../../contexts/AuthContext";
import {
    Bell,
    Menu,
    LogOut,
    User,
    Settings,
    ChevronDown,
    Search,
    Sun,
    Moon,
} from "lucide-react";

interface HeaderProps {
    onMenuClick: () => void;
}

const PAGE_LABELS: Record<string, string> = {
    admin: "Admin Dashboard",
    users: "User Management",
    doctors: "Doctor Management",
    appointments: "Appointments",
    analytics: "Analytics",
    reports: "Reports",
    settings: "Settings",
    doctor: "Doctor Dashboard",
    queue: "Patient Queue",
    history: "Medical History",
    prescription: "Prescriptions",
    ai: "AI Symptom Check",
    schedule: "My Schedule",
    receptionist: "Receptionist Dashboard",
    "book-appointment": "Book Appointment",
    "register-patient": "Register Patient",
    patient: "Patient Dashboard",
    prescriptions: "My Prescriptions",
    chatbot: "AI Assistant",
};

function useBreadcrumb(pathname: string): { title: string; crumbs: string[] } {
    const segments = pathname.split("/").filter(Boolean);
    const title = PAGE_LABELS[segments[segments.length - 1]] || "Dashboard";
    const crumbs = segments.map(
        (s) => PAGE_LABELS[s] || s.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase())
    );
    return { title, crumbs };
}

const ROLE_BG: Record<string, string> = {
    admin: "bg-slate-900 border-slate-700",
    doctor: "bg-blue-600 border-blue-500",
    receptionist: "bg-slate-800 border-slate-600",
    patient: "bg-emerald-600 border-emerald-500",
};

export default function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [dropOpen, setDropOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const { title, crumbs } = useBreadcrumb(pathname);
    const roleBg = user ? (ROLE_BG[user.role] || "bg-slate-800 border-slate-700") : "bg-slate-800 border-slate-700";

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
                setDropOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (searchOpen && searchRef.current) searchRef.current.focus();
    }, [searchOpen]);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    if (!user || !user.role) return null;

    const initials = user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const formattedDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <header className="h-16 flex items-center gap-3 px-4 sm:px-6 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm flex-shrink-0 z-30">
            {/* Hamburger — mobile only */}
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Page title + breadcrumb */}
            <div className="flex-1 min-w-0 hidden sm:block">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-0.5">
                    {crumbs.map((crumb, i) => (
                        <span key={i} className="flex items-center gap-1.5">
                            {i > 0 && <span className="text-slate-300">›</span>}
                            <span className={i === crumbs.length - 1 ? "text-blue-600 font-semibold" : ""}>{crumb}</span>
                        </span>
                    ))}
                </div>
                <h1 className="text-[15px] font-bold text-slate-900 truncate leading-tight">{title}</h1>
            </div>

            {/* Mobile title only */}
            <div className="flex-1 min-w-0 sm:hidden">
                <h1 className="text-[15px] font-bold text-slate-900 truncate">{title}</h1>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
                {/* Search button */}
                <button
                    onClick={() => setSearchOpen(!searchOpen)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 hidden sm:flex items-center"
                    aria-label="Search"
                >
                    <Search className="w-4.5 h-4.5" />
                </button>

                {/* Date badge */}
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-medium text-slate-500">{formattedDate}</span>
                </div>

                {/* Notifications */}
                <button
                    className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                    aria-label="Notifications"
                >
                    <Bell className="w-4.5 h-4.5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-slate-200 mx-0.5" />

                {/* Avatar + dropdown */}
                <div ref={dropRef} className="relative">
                    <button
                        onClick={() => setDropOpen((v) => !v)}
                        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-slate-50 transition-all duration-200"
                        aria-label="User menu"
                    >
                        <div
                            className={`w-8 h-8 rounded-full ${roleBg.split(" ")[0]} flex items-center justify-center text-white text-xs font-semibold`}
                        >
                            {initials}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-[12px] font-semibold text-slate-900 max-w-[100px] truncate leading-tight">
                                {user.name.split(" ")[0]}
                            </p>
                            <p className="text-[10px] text-slate-500 capitalize leading-tight">{user.role}</p>
                        </div>
                        <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${dropOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {/* Dropdown menu */}
                    {dropOpen && (
                        <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
                            {/* User info header */}
                            <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
                                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                                <span className="mt-2 inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                                    {ROLE_LABELS[user.role]}
                                </span>
                            </div>

                            {/* Menu items */}
                            <div className="py-1.5">
                                <Link
                                    href={`/${user.role}/profile`}
                                    onClick={() => setDropOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors duration-150"
                                >
                                    <User className="w-4 h-4 text-slate-400" />
                                    My Profile
                                </Link>
                                <Link
                                    href={`/${user.role}/settings`}
                                    onClick={() => setDropOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors duration-150"
                                >
                                    <Settings className="w-4 h-4 text-slate-400" />
                                    Settings
                                </Link>
                            </div>
                            <div className="border-t border-slate-100 py-1.5">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
