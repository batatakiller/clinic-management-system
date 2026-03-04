"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextValue {
    toast: (opts: Omit<Toast, "id">) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
};

const BORDER: Record<ToastType, string> = {
    success: "border-l-emerald-500",
    error: "border-l-red-500",
    warning: "border-l-amber-500",
    info: "border-l-blue-500",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    useEffect(() => {
        const t = setTimeout(onDismiss, 4000);
        return () => clearTimeout(t);
    }, [onDismiss]);

    return (
        <div
            className={`flex items-start gap-3 min-w-[300px] max-w-sm w-full bg-white dark:bg-slate-800 border border-border border-l-4 ${BORDER[toast.type]} rounded-xl shadow-lg p-4 animate-in slide-in-from-right-5 fade-in duration-300`}
        >
            {ICONS[toast.type]}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{toast.title}</p>
                {toast.message && <p className="text-xs text-muted-foreground mt-0.5">{toast.message}</p>}
            </div>
            <button onClick={onDismiss} className="p-0.5 rounded hover:bg-muted transition-med flex-shrink-0">
                <X className="w-4 h-4 text-muted-foreground" />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts(t => t.filter(x => x.id !== id));
    }, []);

    const toast = useCallback((opts: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(t => [...t, { ...opts, id }]);
    }, []);

    const success = useCallback((title: string, message?: string) => toast({ type: "success", title, message }), [toast]);
    const error = useCallback((title: string, message?: string) => toast({ type: "error", title, message }), [toast]);
    const warning = useCallback((title: string, message?: string) => toast({ type: "warning", title, message }), [toast]);
    const info = useCallback((title: string, message?: string) => toast({ type: "info", title, message }), [toast]);

    return (
        <ToastContext.Provider value={{ toast, success, error, warning, info }}>
            {children}
            <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}
