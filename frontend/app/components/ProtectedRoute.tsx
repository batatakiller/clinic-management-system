"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type UserRole, getRoleDashboardPath } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRole?: UserRole;
}

export default function ProtectedRoute({
    children,
    allowedRole,
}: ProtectedRouteProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated || !user || !user.role) {
            router.replace("/login");
            return;
        }

        if (allowedRole && user.role !== allowedRole) {
            router.replace(getRoleDashboardPath(user.role));
            return;
        }
    }, [isLoading, isAuthenticated, user, allowedRole, router]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading your session…</p>
                </div>
            </div>
        );
    }

    // Not authenticated or user has no role
    if (!isAuthenticated || !user || !user.role) return null;

    // Wrong role
    if (allowedRole && user.role !== allowedRole) return null;

    return <>{children}</>;
}
