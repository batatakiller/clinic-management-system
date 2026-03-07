"use client";

import { useState } from "react";
import DashboardLayout from "../../DashboardLayout";
import {
  Bot,
  Send,
  AlertCircle,
  Loader2,
  RotateCcw,
  Stethoscope,
} from "lucide-react";

interface Condition {
  name: string;
  risk: "High" | "Medium" | "Low";
  probability: string;
  description: string;
}

interface AIResult {
  summary: string;
  possible_conditions: Condition[];
  recommended_tests: string[];
  red_flags: string[];
  next_steps: string;
}

const RISK_STYLES: Record<string, string> = {
  High: "bg-red-100    text-red-700    border-red-200",
  Medium: "bg-amber-100  text-amber-700  border-amber-200",
  Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const RISK_DOT: Record<string, string> = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
  Low: "bg-emerald-500",
};

const SAMPLE_SYMPTOMS = [
  "Chest pain, shortness of breath, sweating, nausea",
  "Persistent headache, fever 38.5°C, stiff neck, sensitivity to light",
  "Fatigue, excessive thirst, frequent urination, blurred vision",
  "Sudden severe abdominal pain, vomiting, fever",
];

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || symptoms.trim().length < 5) {
      setError(
        "Please describe the symptoms in more detail (at least 5 characters).",
      );
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = (() => {
        if (typeof localStorage !== "undefined") {
          try {
            const stored = localStorage.getItem("hms_auth");
            if (stored) {
              const parsed = JSON.parse(stored);
              return parsed.token || null;
            }
          } catch {
            return null;
          }
        }
        return null;
      })();

      const res = await fetch(`${baseUrl}/api/diagnosis/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          symptoms: symptoms
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s),
          history: "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? data.error ?? "AI service error.");
        return;
      }
      // Map API response to UI result format
      setResult({
        summary: `${data.data?.condition || "Unknown"} - Risk Level: ${data.data?.riskLevel || "unknown"}`,
        possible_conditions: (data.data?.differentialDiagnoses || []).map(
          (c: string) => ({
            name: c,
            risk: "Medium",
            probability: "Possible",
            description: "Possible condition based on symptoms",
          }),
        ),
        recommended_tests: data.data?.suggestedTests || [],
        red_flags: data.data?.redFlags || [],
        next_steps: data.data?.recommendations || "Consult with a specialist",
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Network error. Please check your connection and try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSymptoms("");
    setResult(null);
    setError(null);
    setPatientName("");
    setCharCount(0);
  };

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              AI Symptom Checker
            </h1>
            <p className="text-xs text-muted-foreground">
              Powered by GPT-4o · Differential diagnosis assistant
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-6">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>Clinical Decision Support Only:</strong> This AI assists with
          differential diagnosis. Always apply clinical judgment. Not a
          replacement for physical examination.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input panel */}
        <div>
          <form onSubmit={handleSubmit} className="med-card p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Patient Name (Optional)
              </label>
              <input
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
                placeholder="e.g. Maria Santos"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Symptoms Description *
                </label>
                <span className="text-[10px] text-muted-foreground">
                  {charCount}/500
                </span>
              </div>
              <textarea
                rows={5}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med resize-none placeholder:text-muted-foreground/50"
                placeholder="Describe symptoms in detail: duration, severity, associated symptoms, relevant history…"
                value={symptoms}
                maxLength={500}
                onChange={(e) => {
                  setSymptoms(e.target.value);
                  setCharCount(e.target.value.length);
                }}
              />
            </div>

            {/* Quick fill */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Quick Examples
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_SYMPTOMS.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSymptoms(s);
                      setCharCount(s.length);
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground truncate max-w-[180px] transition-med"
                  >
                    {s.slice(0, 30)}…
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Response Language
              </label>
              <div className="flex gap-2">
                {["English", "Urdu"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLanguage(l)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-med ${language === l ? "bg-primary text-white border-primary" : "border-border hover:bg-muted text-foreground"}`}
                  >
                    {l === "Urdu" ? "اردو" : l}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-med shadow-md"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {loading ? "Analyzing Symptoms…" : "Analyze with AI"}
              </button>
              {result && (
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-med"
                >
                  <RotateCcw className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results panel */}
        <div>
          {!result && !loading && (
            <div className="med-card p-12 text-center h-full flex flex-col items-center justify-center">
              <Stethoscope className="w-14 h-14 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground text-sm">
                Enter symptoms on the left to get AI-powered differential
                diagnosis
              </p>
            </div>
          )}

          {loading && (
            <div className="med-card p-12 text-center h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div>
                <p className="font-medium text-foreground">
                  Analyzing symptoms…
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Consulting AI medical knowledge base
                </p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="med-card p-4 border-l-4 border-l-primary">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Clinical Overview
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Conditions */}
              <div className="med-card p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Possible Conditions
                </p>
                <div className="space-y-3">
                  {result.possible_conditions?.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border"
                    >
                      <span
                        className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${RISK_DOT[c.risk] ?? "bg-gray-400"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">
                            {c.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${RISK_STYLES[c.risk] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {c.risk} Risk
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {c.probability}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {c.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Flags */}
              {result.red_flags?.length > 0 && (
                <div className="med-card p-4 border border-red-200 bg-red-50/50">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Red Flags
                  </p>
                  <ul className="space-y-1">
                    {result.red_flags.map((f, i) => (
                      <li
                        key={i}
                        className="text-xs text-red-700 flex items-start gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tests + Next Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="med-card p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Recommended Tests
                  </p>
                  <ul className="space-y-1">
                    {result.recommended_tests?.map((t, i) => (
                      <li
                        key={i}
                        className="text-xs text-foreground flex items-start gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="med-card p-4 bg-emerald-50/50 border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                    Next Steps
                  </p>
                  <p className="text-xs text-foreground leading-relaxed">
                    {result.next_steps}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
