"use client";

import { useState } from "react";
import DashboardLayout from "../../DashboardLayout";
import { UserPlus, Check, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface FormData {
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    blood: string;
    phone: string;
    email: string;
    address: string;
    ecName: string;
    ecPhone: string;
    ecRelation: string;
    notes: string;
}

const INIT: FormData = {
    firstName: "", lastName: "", dob: "", gender: "", blood: "",
    phone: "", email: "", address: "",
    ecName: "", ecPhone: "", ecRelation: "",
    notes: "",
};

const BLOOD_GROUPS = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const RELATIONS = ["Spouse", "Parent", "Sibling", "Child", "Friend", "Other"];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
}

const inputCls = "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-med placeholder:text-muted-foreground/60";
const selectCls = inputCls + " appearance-none";

export default function RegisterPatientPage() {
    const [form, setForm] = useState<FormData>(INIT);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 900));
        setLoading(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <DashboardLayout requiredRole="receptionist">
                <div className="max-w-lg mx-auto mt-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Patient Registered!</h2>
                    <p className="text-muted-foreground mb-6">
                        {form.firstName} {form.lastName} has been successfully added to the system.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => { setForm(INIT); setSubmitted(false); }}
                            className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-med"
                        >
                            Register Another
                        </button>
                        <Link href="/receptionist" className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted/60 transition-med">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout requiredRole="receptionist">
            {/* Page header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/receptionist" className="p-2 rounded-lg hover:bg-muted/60 transition-med">
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </Link>
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-foreground">Register New Patient</h1>
                    <p className="text-xs text-muted-foreground">Fill in all required fields to create a patient record</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
                {/* Personal Info */}
                <div className="med-card p-5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</span>
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="First Name" required>
                            <input required className={inputCls} placeholder="e.g. Maria" value={form.firstName}
                                onChange={e => set("firstName", e.target.value)} />
                        </Field>
                        <Field label="Last Name" required>
                            <input required className={inputCls} placeholder="e.g. Santos" value={form.lastName}
                                onChange={e => set("lastName", e.target.value)} />
                        </Field>
                        <Field label="Date of Birth" required>
                            <input required type="date" className={inputCls} value={form.dob}
                                onChange={e => set("dob", e.target.value)} />
                        </Field>
                        <Field label="Gender" required>
                            <select required className={selectCls} value={form.gender}
                                onChange={e => set("gender", e.target.value)}>
                                <option value="">Select gender…</option>
                                {GENDERS.map(g => <option key={g}>{g}</option>)}
                            </select>
                        </Field>
                        <Field label="Blood Group">
                            <select className={selectCls} value={form.blood}
                                onChange={e => set("blood", e.target.value)}>
                                <option value="">Unknown / Not tested</option>
                                {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                            </select>
                        </Field>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="med-card p-5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</span>
                        Contact Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Phone Number" required>
                            <input required type="tel" className={inputCls} placeholder="+1 (555) 000-0000" value={form.phone}
                                onChange={e => set("phone", e.target.value)} />
                        </Field>
                        <Field label="Email Address">
                            <input type="email" className={inputCls} placeholder="patient@email.com" value={form.email}
                                onChange={e => set("email", e.target.value)} />
                        </Field>
                        <Field label="Home Address">
                            <textarea rows={2} className={inputCls} placeholder="Street, City, State, ZIP" value={form.address}
                                onChange={e => set("address", e.target.value)} />
                        </Field>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="med-card p-5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">3</span>
                        Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Contact Name">
                            <input className={inputCls} placeholder="Full name" value={form.ecName}
                                onChange={e => set("ecName", e.target.value)} />
                        </Field>
                        <Field label="Phone">
                            <input type="tel" className={inputCls} placeholder="+1 (555) 000-0000" value={form.ecPhone}
                                onChange={e => set("ecPhone", e.target.value)} />
                        </Field>
                        <Field label="Relation">
                            <select className={selectCls} value={form.ecRelation}
                                onChange={e => set("ecRelation", e.target.value)}>
                                <option value="">Select…</option>
                                {RELATIONS.map(r => <option key={r}>{r}</option>)}
                            </select>
                        </Field>
                    </div>
                </div>

                {/* Medical Notes */}
                <div className="med-card p-5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">4</span>
                        Medical Notes
                    </h3>
                    <Field label="Existing Conditions / Allergies / Notes">
                        <textarea rows={4} className={inputCls}
                            placeholder="e.g. Allergic to penicillin. Diabetic Type 2. Previous surgery: appendectomy 2018."
                            value={form.notes} onChange={e => set("notes", e.target.value)} />
                    </Field>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button type="submit" disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-med">
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <UserPlus className="w-4 h-4" />
                        )}
                        {loading ? "Registering…" : "Register Patient"}
                    </button>
                    <button type="button" onClick={() => setForm(INIT)}
                        className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted/60 transition-med">
                        Clear Form
                    </button>
                </div>
            </form>
        </DashboardLayout>
    );
}
