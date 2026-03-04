"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, Sparkles, ShieldCheck, Stethoscope, Clipboard, UserRound } from "lucide-react";
import { useAuth, type UserRole } from "../../contexts/AuthContext";



function LoginFormContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSubmitting) return;
    if (!isLoading) {
      if (isAuthenticated && user?.role) {
        const redirectTo = params.get("redirect") || `/${user.role}`;
        window.location.href = redirectTo;
      } else {
        setIsSubmitting(false);
      }
    }
  }, [isSubmitting, isLoading, isAuthenticated, user, params]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    setLocalError("");
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (!formData.email) { setLocalError("Email is required"); return; }
    if (!formData.password) { setLocalError("Password is required"); return; }
    setIsSubmitting(true);
    await login({ email: formData.email, password: formData.password });
  };



  const displayError = localError || error;

  return (
    <div className="w-full max-w-[420px]">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight mb-1.5 flex items-center gap-2">
          Welcome back
        </h1>
        <p className="text-slate-500 text-sm">
          Sign in to your HealthCare MS account to continue.
        </p>
      </div>



      {/* Error */}
      {displayError && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{displayError}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-[13px] font-semibold text-slate-700 mb-1.5">
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
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white
                       text-sm text-slate-900 placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white
                       transition-all duration-200"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-[13px] font-semibold text-slate-700">
              Password
            </label>
            <a href="#" className="text-xs text-blue-600 hover:underline font-medium">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white
                         text-sm text-slate-900 placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white
                         transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              aria-label="Toggle password"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white
                     text-sm font-bold flex items-center justify-center gap-2
                     hover:from-blue-700 hover:to-indigo-700
                     disabled:opacity-60 disabled:cursor-not-allowed
                     transition-all duration-200 shadow-lg shadow-blue-500/25"
        >
          {(isLoading && isSubmitting) ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in →"
          )}
        </button>
      </form>

      {/* Register link */}
      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-600 font-semibold hover:underline">
          Create one
        </Link>
      </p>


    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
