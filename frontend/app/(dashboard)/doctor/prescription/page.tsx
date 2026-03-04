"use client";

import { useState, useRef, Suspense, useEffect } from "react";
import DashboardLayout from "../../DashboardLayout";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, Download, ClipboardList, Printer, Save } from "lucide-react";
import { useToast } from "../../../components/ui/Toast";
import { apiFetch } from "@/lib/api";
import { useAuth } from "../../../contexts/AuthContext";

interface Medicine {
    id: number;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

interface Patient {
    _id: string;
    name: string;
}

const FREQ_OPTIONS = ["Once daily", "Twice daily", "Three times daily", "Four times daily", "Every 8 hours", "Every 12 hours", "As needed (PRN)", "At bedtime"];
const DUR_OPTIONS = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "3 months", "Ongoing"];

const inputCls = "w-full px-2.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med placeholder:text-muted-foreground/50";

function PrescriptionContent() {
    const params = useSearchParams();
    const { user } = useAuth();
    const patientNameParam = params.get("patient") || "";
    const patientAgeParam = params.get("age") || "";
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const { success, error } = useToast();
    const printRef = useRef<HTMLDivElement>(null);

    const [meds, setMeds] = useState<Medicine[]>([
        { id: 1, name: "", dosage: "", frequency: FREQ_OPTIONS[0], duration: DUR_OPTIONS[0], instructions: "" },
    ]);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await apiFetch("/api/patients");
                setPatients(res.data || []);
            } catch (err) {
                console.error("Failed to fetch patients:", err);
            }
        };
        fetchPatients();
    }, []);

    const addMed = () => setMeds(m => [...m, { id: Date.now(), name: "", dosage: "", frequency: FREQ_OPTIONS[0], duration: DUR_OPTIONS[0], instructions: "" }]);
    const removeMed = (id: number) => setMeds(m => m.length > 1 ? m.filter(x => x.id !== id) : m);
    const updateMed = (id: number, field: keyof Medicine, val: string) =>
        setMeds(m => m.map(x => x.id === id ? { ...x, [field]: val } : x));

    const validate = () => {
        const empty = meds.filter(m => !m.name.trim() || !m.dosage.trim());
        if (empty.length > 0) { error("Incomplete prescription", "Please fill Medicine Name and Dosage for all rows."); return false; }
        if (!selectedPatient) { error("Patient required", "Please select a patient."); return false; }
        if (!diagnosis.trim()) { error("Diagnosis required", "Please enter a diagnosis."); return false; }
        return true;
    };

    const saveToDatabase = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            if (!selectedPatient) {
                error("Patient required", "Please select a patient.");
                return;
            }
            const prescriptionData = {
                patientId: selectedPatient._id,
                diagnosis,
                medicines: meds.map(m => ({
                    name: m.name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    duration: m.duration,
                    instructions: m.instructions,
                })),
                generalInstructions: notes,
                followUpDate: followUpDate || null,
            };

            await apiFetch("/api/prescriptions", {
                method: "POST",
                body: JSON.stringify(prescriptionData),
            });

            success("Prescription Saved!", "Prescription has been saved to the database.");
            
            // Reset form
            setMeds([{ id: 1, name: "", dosage: "", frequency: FREQ_OPTIONS[0], duration: DUR_OPTIONS[0], instructions: "" }]);
            setDiagnosis("");
            setNotes("");
            setFollowUpDate("");
            setSelectedPatient(null);
        } catch (err: any) {
            error("Save failed", err.message || "Could not save prescription to database.");
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const { default: jsPDF } = await import("jspdf");
            const { default: html2canvas } = await import("html2canvas");

            if (!printRef.current) return;
            const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
            const img = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const W = pdf.internal.pageSize.getWidth();
            const H = (canvas.height / canvas.width) * W;
            pdf.addImage(img, "PNG", 0, 0, W, H);
            const patientName = selectedPatient?.name || patientNameParam || "Patient";
            pdf.save(`Rx_${patientName.replace(/ /g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
            success("PDF Downloaded!", `Prescription for ${patientName} saved.`);
        } catch {
            error("Download failed", "Could not generate PDF. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const patientName = selectedPatient?.name || patientNameParam || "Patient";
    const patientAge = patientAgeParam || "—";

    return (
        <DashboardLayout requiredRole="doctor">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Write Prescription</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">Create and save a professional prescription</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={saveToDatabase} disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition-med">
                        <Save className="w-4 h-4" />
                        {loading ? "Saving…" : "Save to DB"}
                    </button>
                    <button onClick={() => window.print()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-med">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                    <button onClick={downloadPDF} disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-med">
                        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                        {loading ? "Generating…" : "Download PDF"}
                    </button>
                </div>
            </div>

            {/* Patient Selection */}
            <div className="med-card p-5 mb-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Select Patient *
                        </label>
                        <select
                            value={selectedPatient?._id || ""}
                            onChange={(e) => {
                                const patient = patients.find(p => p._id === e.target.value);
                                setSelectedPatient(patient || null);
                            }}
                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
                        >
                            <option value="">Choose a patient...</option>
                            {patients.map((p) => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Diagnosis *
                        </label>
                        <input
                            type="text"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className={inputCls}
                            placeholder="e.g., Type 2 Diabetes Mellitus"
                        />
                    </div>
                </div>
            </div>

            {/* Printable / PDF area */}
            <div ref={printRef} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Letterhead */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" /></svg>
                                </div>
                                <span className="font-bold text-lg">HealthCareMS</span>
                            </div>
                            <p className="text-blue-200 text-xs">Medical Prescription</p>
                        </div>
                        <div className="text-right text-sm">
                            <p className="font-semibold">Dr. James Carter</p>
                            <p className="text-blue-200 text-xs">MBBS, MD</p>
                            <p className="text-blue-200 text-xs">{today}</p>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6">
                    {/* Patient info */}
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div>
                            <p className="text-xs text-muted-foreground">Patient Name</p>
                            <p className="font-semibold text-foreground">{patientName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Age</p>
                            <p className="font-semibold text-foreground">{patientAge} years</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs text-muted-foreground mb-1">Diagnosis / Condition</p>
                            <p className="font-medium text-foreground">{diagnosis || "Not specified"}</p>
                        </div>
                    </div>

                    {/* Medicines */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-primary" /> Medicines
                            </h3>
                            <button onClick={addMed}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-med">
                                <Plus className="w-3.5 h-3.5" /> Add Medicine
                            </button>
                        </div>

                        <div className="space-y-3">
                            {meds.map((med, i) => (
                                <div key={med.id} className="border border-border rounded-xl p-4 bg-muted/20 relative">
                                    <div className="absolute top-3 left-4 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                                        {i + 1}
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pl-7">
                                        <div className="sm:col-span-1">
                                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Medicine *</label>
                                            <input className={inputCls} placeholder="Drug name" value={med.name}
                                                onChange={e => updateMed(med.id, "name", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Dosage *</label>
                                            <input className={inputCls} placeholder="e.g. 500mg" value={med.dosage}
                                                onChange={e => updateMed(med.id, "dosage", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Frequency</label>
                                            <select className={inputCls} value={med.frequency}
                                                onChange={e => updateMed(med.id, "frequency", e.target.value)}>
                                                {FREQ_OPTIONS.map(f => <option key={f}>{f}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Duration</label>
                                            <select className={inputCls} value={med.duration}
                                                onChange={e => updateMed(med.id, "duration", e.target.value)}>
                                                {DUR_OPTIONS.map(d => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Instructions</label>
                                            <input className={inputCls} placeholder="e.g. After meals" value={med.instructions}
                                                onChange={e => updateMed(med.id, "instructions", e.target.value)} />
                                        </div>
                                    </div>
                                    {meds.length > 1 && (
                                        <button onClick={() => removeMed(med.id)} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-med">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Doctor Notes */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Doctor&apos;s Notes &amp; Instructions</label>
                        <textarea rows={3} className={inputCls} placeholder="Additional instructions, lifestyle advice, follow-up date…"
                            value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>

                    {/* Follow-up Date */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Follow-up Date</label>
                        <input
                            type="date"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    {/* Signature area */}
                    <div className="flex justify-end pt-4 border-t border-border">
                        <div className="text-right">
                            <div className="w-36 border-b border-foreground mb-1 pb-4" />
                            <p className="text-sm font-medium text-foreground">Dr. James Carter</p>
                            <p className="text-xs text-muted-foreground">Signature &amp; Stamp</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function PrescriptionPage() {
    return (
        <Suspense fallback={<div className="p-8 text-muted-foreground">Loading…</div>}>
            <PrescriptionContent />
        </Suspense>
    );
}
