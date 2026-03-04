"use client";

import DashboardLayout from "@/app/(dashboard)/DashboardLayout";
import { useAuth, ROLE_LABELS } from "@/app/contexts/AuthContext";
import { User, Mail, Shield, Building, Phone, MapPin, Calendar, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function ProfilePage() {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({ name: user?.name || "", email: user?.email || "", phone: "" });
    const [message, setMessage] = useState({ type: "", text: "" });

    if (!user) return null;

    const initials = formData.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin": return "bg-slate-900 text-white";
            case "doctor": return "bg-blue-600 text-white";
            case "receptionist": return "bg-slate-800 text-white";
            case "patient": return "bg-emerald-600 text-white";
            default: return "bg-slate-100 text-slate-700";
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ type: "", text: "" });
        try {
            // Trying to use the auth profile endpoint
            const res = await apiFetch("/api/auth/profile", {
                method: "PUT",
                body: JSON.stringify({ name: formData.name }),
            });
            // Mocking context update since useAuth might not expose a direct user update method
            setMessage({ type: "success", text: "Profile updated successfully." });
            setIsEditing(false);
        } catch (err: any) {
            setMessage({ type: "error", text: "Failed to update profile. " + (err.message || "") });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout requiredRole={user.role}>
            <div className="max-w-4xl mx-auto space-y-6 pb-8">

                {/* Page Header */}
                <div className="border-b border-slate-200 pb-5">
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">My Profile</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage your personal information and account settings
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Left Column: Avatar & Quick Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-semibold shadow-sm mb-4 ${getRoleBadgeColor(user.role)}`}>
                                {initials}
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900">{formData.name}</h2>
                            <p className="text-sm text-slate-500">{formData.email}</p>

                            <div className="mt-4 pt-4 border-t border-slate-100 w-full">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded border border-transparent text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                    {ROLE_LABELS[user.role] || "User"}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-900 mb-4">Account Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Shield className="w-4 h-4" /> Role Base</span>
                                    <span className="font-medium text-slate-900 capitalize">{user.role}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-emerald-500" /> Status</span>
                                    <span className="font-medium text-emerald-600">Active</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Member Since</span>
                                    <span className="font-medium text-slate-900">Recent</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Info Form */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="text-base font-semibold text-slate-900">Personal Information</h3>
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { setIsEditing(false); setFormData({ name: user.name, email: user.email, phone: formData.phone }); }} disabled={isSaving} className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
                                            Cancel
                                        </button>
                                        <button onClick={handleSave} disabled={isSaving} className="px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                                            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                {message.text && (
                                    <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                                        {message.type === "success" ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                        <p className="pt-0.5">{message.text}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                                    {/* Name */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${isEditing ? "bg-white border-blue-400 ring-4 ring-blue-500/10" : "bg-slate-50 border-slate-200"}`}>
                                            <User className={`w-4 h-4 ${isEditing ? "text-blue-500" : "text-slate-400"}`} />
                                            {isEditing ? (
                                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none" placeholder="Your Name" />
                                            ) : (
                                                <span className="text-sm font-medium text-slate-900">{formData.name}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-slate-50 border-slate-200 opacity-80 cursor-not-allowed`}>
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-900">{formData.email}</span>
                                        </div>
                                    </div>

                                    {/* Phone mock */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${isEditing ? "bg-white border-blue-400 ring-4 ring-blue-500/10" : "bg-slate-50 border-slate-200"}`}>
                                            <Phone className={`w-4 h-4 ${isEditing ? "text-blue-500" : "text-slate-400"}`} />
                                            {isEditing ? (
                                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none" placeholder="+1 (555) 000-0000" />
                                            ) : (
                                                <span className={`text-sm font-medium ${formData.phone ? "text-slate-900" : "text-slate-500"}`}>{formData.phone || "Not provided"}</span>
                                            )}
                                        </div>
                                    </div>



                                </div>

                                {/* Bio Area */}
                                <div className="mt-6">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bio / Notes</label>
                                    <div className={`px-3 py-3 rounded-lg border min-h-[100px] transition-colors ${isEditing ? "bg-white border-blue-400 ring-4 ring-blue-500/10" : "bg-slate-50 border-slate-200"}`}>
                                        {isEditing ? (
                                            <textarea className="w-full h-full min-h-[80px] bg-transparent text-sm text-slate-900 outline-none resize-none" placeholder="Write a short biography..." />
                                        ) : (
                                            <p className="text-sm text-slate-500">Profile notes and biography can be added here upon editing.</p>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}

// Simple fallback icon component
function CheckCircleIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
        </svg>
    );
}
