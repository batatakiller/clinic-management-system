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

const FREQ_OPTIONS = ["Uma vez ao dia", "Duas vezes ao dia", "Três vezes ao dia", "Quatro vezes ao dia", "A cada 8 horas", "A cada 12 horas", "Se necessário (SN)", "Ao deitar"];
const DUR_OPTIONS = ["3 dias", "5 dias", "7 dias", "10 dias", "14 dias", "1 mês", "3 meses", "Contínuo"];

const inputCls = "w-full px-2.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med placeholder:text-muted-foreground/50";

function PrescriptionContent() {
    const params = useSearchParams();
    const { user } = useAuth();
    const patientNameParam = params.get("patient") || "";
    const patientAgeParam = params.get("age") || "";
    const today = new Date().toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" });

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
        if (empty.length > 0) { error("Prescrição incompleta", "Por favor, preencha o Nome do Medicamento e a Dosagem para todas as linhas."); return false; }
        if (!selectedPatient) { error("Paciente obrigatório", "Por favor, selecione um paciente."); return false; }
        if (!diagnosis.trim()) { error("Diagnóstico obrigatório", "Por favor, insira um diagnóstico."); return false; }
        return true;
    };

    const saveToDatabase = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            if (!selectedPatient) {
                error("Paciente obrigatório", "Por favor, selecione um paciente.");
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

            success("Prescrição Salva!", "A prescrição foi salva no banco de dados.");
            
            // Reset form
            setMeds([{ id: 1, name: "", dosage: "", frequency: FREQ_OPTIONS[0], duration: DUR_OPTIONS[0], instructions: "" }]);
            setDiagnosis("");
            setNotes("");
            setFollowUpDate("");
            setSelectedPatient(null);
        } catch (err: any) {
            error("Falha ao salvar", err.message || "Não foi possível salvar a prescrição no banco de dados.");
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
            const patientName = selectedPatient?.name || patientNameParam || "Paciente";
            pdf.save(`Rx_${patientName.replace(/ /g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
            success("PDF Baixado!", `Prescrição para ${patientName} salva.`);
        } catch {
            error("Falha no download", "Não foi possível gerar o PDF. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const patientName = selectedPatient?.name || patientNameParam || "Paciente";
    const patientAge = patientAgeParam || "—";

    return (
        <DashboardLayout requiredRole="doctor">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Escrever Prescrição</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">Crie e salve uma prescrição profissional</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={saveToDatabase} disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition-med">
                        <Save className="w-4 h-4" />
                        {loading ? "Salvando…" : "Salvar no BD"}
                    </button>
                    <button onClick={() => window.print()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-med">
                        <Printer className="w-4 h-4" /> Imprimir
                    </button>
                    <button onClick={downloadPDF} disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-med">
                        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                        {loading ? "Gerando…" : "Baixar PDF"}
                    </button>
                </div>
            </div>

            {/* Patient Selection */}
            <div className="med-card p-5 mb-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Selecionar Paciente *
                        </label>
                        <select
                            value={selectedPatient?._id || ""}
                            onChange={(e) => {
                                const patient = patients.find(p => p._id === e.target.value);
                                setSelectedPatient(patient || null);
                            }}
                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
                        >
                            <option value="">Escolha um paciente...</option>
                            {patients.map((p) => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Diagnóstico *
                        </label>
                        <input
                            type="text"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className={inputCls}
                            placeholder="Ex: Diabetes Mellitus Tipo 2"
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
                            <p className="text-blue-200 text-xs">Prescrição Médica</p>
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
                            <p className="text-xs text-muted-foreground">Nome do Paciente</p>
                            <p className="font-semibold text-foreground">{patientName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Idade</p>
                            <p className="font-semibold text-foreground">{patientAge} anos</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs text-muted-foreground mb-1">Diagnóstico / Condição</p>
                            <p className="font-medium text-foreground">{diagnosis || "Não especificado"}</p>
                        </div>
                    </div>

                    {/* Medicines */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-primary" /> Medicamentos
                            </h3>
                            <button onClick={addMed}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-med">
                                <Plus className="w-3.5 h-3.5" /> Adicionar Medicamento
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
                                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Medicamento *</label>
                                            <input className={inputCls} placeholder="Nome do medicamento" value={med.name}
                                                onChange={e => updateMed(med.id, "name", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Dosagem *</label>
                                            <input className={inputCls} placeholder="Ex: 500mg" value={med.dosage}
                                                onChange={e => updateMed(med.id, "dosage", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Frequência</label>
                                            <select className={inputCls} value={med.frequency}
                                                onChange={e => updateMed(med.id, "frequency", e.target.value)}>
                                                {FREQ_OPTIONS.map(f => <option key={f}>{f}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Duração</label>
                                            <select className={inputCls} value={med.duration}
                                                onChange={e => updateMed(med.id, "duration", e.target.value)}>
                                                {DUR_OPTIONS.map(d => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Instruções</label>
                                            <input className={inputCls} placeholder="Ex: Após as refeições" value={med.instructions}
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
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Observações e Instruções do(a) Médico(a)</label>
                        <textarea rows={3} className={inputCls} placeholder="Instruções adicionais, conselhos de estilo de vida, data de retorno…"
                            value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>

                    {/* Follow-up Date */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Data de Retorno</label>
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
                            <p className="text-xs text-muted-foreground">Assinatura e Carimbo</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function PrescriptionPage() {
    return (
        <Suspense fallback={<div className="p-8 text-muted-foreground">Carregando…</div>}>
            <PrescriptionContent />
        </Suspense>
    );
}
