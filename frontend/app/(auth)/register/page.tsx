"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth, type UserRole } from "../../contexts/AuthContext";

const ROLES: { value: UserRole; label: string; desc: string }[] = [
    { value: "admin", label: "Administrator", desc: "Manage system & users" },
    { value: "doctor", label: "Doctor", desc: "Clinical care & patients" },
    { value: "receptionist", label: "Receptionist", desc: "Bookings & registration" },
    { value: "patient", label: "Patient", desc: "View records & appointments" },
];

interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
}

interface FieldErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
        { label: "", color: "bg-slate-200" },
        { label: "Weak", color: "bg-red-400" },
        { label: "Fair", color: "bg-amber-400" },
        { label: "Good", color: "bg-blue-400" },
        { label: "Strong", color: "bg-emerald-500" },
    ];
    return { score, ...map[score] };
}

export default function RegisterPage() {
    const router = useRouter();
    const { register, isLoading, error, clearError } = useAuth();

    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "patient",
    });
    const [showPwd, setShowPwd] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [success, setSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const pwdStrength = getPasswordStrength(formData.password);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        clearError();
        setSubmitError("");
        setFieldErrors((p) => ({ ...p, [e.target.name]: undefined }));
        setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const validate = (): boolean => {
        const errors: FieldErrors = {};
        if (!formData.name.trim()) errors.name = "Full name is required";
        if (!formData.email) errors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email";
        if (!formData.password) errors.password = "Password is required";
        else if (formData.password.length < 8) errors.password = "Minimum 8 characters";
        if (formData.password !== formData.confirmPassword)
            errors.confirmPassword = "Passwords do not match";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/auth/register`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        email: formData.email,
                        password: formData.password,
                        role: formData.role,
                    }),
                },
            );

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/login"), 2000);
            } else {
                const err = (await res.json()) as { message?: string };
                setSubmitError(err.message ?? "Registration failed");
            }
        } catch {
            setSubmitError("Network error. Please try again.");
        }
    };

    if (success) {
        return (
            <div className="w-full max-w-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Account Created!</h2>
                <p className="text-muted-foreground text-sm">Redirecting you to login…</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-1">Create an account</h1>
                <p className="text-muted-foreground text-sm">Join HealthCareMS to get started</p>
            </div>

            {/* API error */}
            {(error || submitError) && (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{submitError || error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Full Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                        Full name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Jane Doe"
                        className={`w-full h-11 px-4 rounded-lg border bg-white text-sm text-foreground
              placeholder:text-muted-foreground focus:outline-none focus:ring-2
              focus:ring-primary/30 focus:border-primary transition-med
              ${fieldErrors.name ? "border-red-400 bg-red-50/30" : "border-border"}`}
                    />
                    {fieldErrors.name && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                        Email address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@clinic.com"
                        className={`w-full h-11 px-4 rounded-lg border bg-white text-sm text-foreground
              placeholder:text-muted-foreground focus:outline-none focus:ring-2
              focus:ring-primary/30 focus:border-primary transition-med
              ${fieldErrors.email ? "border-red-400 bg-red-50/30" : "border-border"}`}
                    />
                    {fieldErrors.email && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="reg-password" className="block text-sm font-medium text-foreground mb-1.5">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="reg-password"
                            name="password"
                            type={showPwd ? "text" : "password"}
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Min. 8 characters"
                            className={`w-full h-11 px-4 pr-11 rounded-lg border bg-white text-sm text-foreground
                placeholder:text-muted-foreground focus:outline-none focus:ring-2
                focus:ring-primary/30 focus:border-primary transition-med
                ${fieldErrors.password ? "border-red-400 bg-red-50/30" : "border-border"}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPwd((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground
                hover:text-foreground transition-med p-1"
                            aria-label="Toggle password"
                        >
                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {formData.password && (
                        <div className="mt-2 flex items-center gap-2">
                            <div className="flex gap-1 flex-1">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-med
                      ${i <= pwdStrength.score ? pwdStrength.color : "bg-slate-200"}`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground">{pwdStrength.label}</span>
                        </div>
                    )}
                    {fieldErrors.password && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
                        Confirm password
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPwd ? "text" : "password"}
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        className={`w-full h-11 px-4 rounded-lg border bg-white text-sm text-foreground
              placeholder:text-muted-foreground focus:outline-none focus:ring-2
              focus:ring-primary/30 focus:border-primary transition-med
              ${fieldErrors.confirmPassword ? "border-red-400 bg-red-50/30" : "border-border"}`}
                    />
                    {fieldErrors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>
                    )}
                </div>

                {/* Role */}
                <div>
                    <p className="block text-sm font-medium text-foreground mb-2">Account type</p>
                    <div className="grid grid-cols-2 gap-2">
                        {ROLES.map((r) => (
                            <label
                                key={r.value}
                                className={`flex flex-col gap-0.5 p-3 rounded-lg border cursor-pointer transition-med
                  ${formData.role === r.value
                                        ? "border-primary bg-primary/5"
                                        : "border-border bg-white hover:border-primary/40"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value={r.value}
                                    checked={formData.role === r.value}
                                    onChange={() => setFormData((p) => ({ ...p, role: r.value }))}
                                    className="sr-only"
                                />
                                <span className="text-sm font-medium text-foreground">{r.label}</span>
                                <span className="text-xs text-muted-foreground">{r.desc}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-lg bg-primary text-primary-foreground
                     text-sm font-semibold flex items-center justify-center gap-2
                     hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed
                     transition-med shadow-sm"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating account…
                        </>
                    ) : (
                        "Create account"
                    )}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
