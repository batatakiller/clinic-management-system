"use client";

import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import MobileSidebar from "../components/layout/MobileSidebar";
import ProtectedRoute from "../components/ProtectedRoute";
import type { UserRole } from "../contexts/AuthContext";

interface DashboardLayoutProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
}

export default function DashboardLayout({
    children,
    requiredRole,
}: DashboardLayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <ProtectedRoute allowedRole={requiredRole}>
            <div className="flex h-screen overflow-hidden bg-background">
                {/* Desktop Sidebar */}
                <div className="hidden lg:flex flex-shrink-0">
                    <Sidebar />
                </div>

                {/* Mobile Sidebar Drawer */}
                <MobileSidebar
                    isOpen={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                />

                {/* Main content area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Header onMenuClick={() => setMobileOpen(true)} />

                    <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50">
                        <div className="p-4 sm:p-6">{children}</div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
