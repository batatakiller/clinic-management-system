export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* ── Left panel — branding ──────────────────────────────── */}
            <div className="hidden lg:flex lg:w-[44%] bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex-col justify-between p-12 relative overflow-hidden">
                {/* Decorative shapes */}
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
                <div className="absolute -bottom-24 -left-12 w-96 h-96 rounded-full bg-white/5" />
                <div className="absolute top-1/2 right-12 w-40 h-40 rounded-full bg-blue-500/20" />
                <div className="absolute top-1/3 left-12 w-16 h-16 rounded-full bg-indigo-400/20" />
                {/* Mesh grid overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                    backgroundSize: "32px 32px"
                }} />

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <rect width="24" height="24" rx="6" fill="#2563eb" />
                                <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" fill="white" />
                            </svg>
                        </div>
                        <span className="text-white text-xl font-extrabold tracking-tight">
                            Health<span className="text-blue-300">Care</span>
                            <span className="text-blue-400/70 font-light"> MS</span>
                        </span>
                    </div>
                </div>

                {/* Hero text */}
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 mb-6">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-white/80 text-xs font-semibold">Trusted by 500+ clinics</span>
                    </div>

                    <h2 className="text-[42px] font-extrabold text-white leading-tight mb-4">
                        Smarter Care,<br />
                        <span className="text-blue-300">Better Outcomes</span>
                    </h2>
                    <p className="text-blue-200/80 text-base leading-relaxed max-w-sm">
                        A unified platform for patients, doctors, and staff — streamlining appointments, records, and clinical workflows.
                    </p>

                    {/* Feature list */}
                    <div className="mt-8 space-y-3">
                        {[
                            "AI-powered symptom analysis",
                            "Integrated prescription management",
                            "Real-time appointment scheduling",
                        ].map((feature) => (
                            <div key={feature} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 5.5L4 7.5L8 3" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-blue-100/80 text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="mt-10 grid grid-cols-3 gap-6">
                        {[
                            { label: "Patients", value: "12k+" },
                            { label: "Doctors", value: "320+" },
                            { label: "Daily Visits", value: "1.4k" },
                        ].map((s) => (
                            <div key={s.label}>
                                <p className="text-white text-2xl font-extrabold">{s.value}</p>
                                <p className="text-blue-300/70 text-xs mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <p className="relative z-10 text-blue-400/60 text-xs">
                    © 2026 HealthCareMS. All rights reserved.
                </p>
            </div>

            {/* ── Right panel — form ────────────────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16 bg-white">
                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2 mb-10">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" />
                        </svg>
                    </div>
                    <span className="text-slate-900 text-lg font-extrabold tracking-tight">
                        Health<span className="text-blue-600">Care</span>MS
                    </span>
                </div>
                {children}
            </div>
        </div>
    );
}
