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
const GENDERS = ["Masculino", "Feminino", "Não-binário", "Prefiro não dizer"];
const RELATIONS = ["Cônjuge", "Pai/Mãe", "Irmão/Irmã", "Filho(a)", "Amigo(a)", "Outro"];

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
                    <h2 className="text-2xl font-bold text-foreground mb-2">Paciente Cadastrado(a)!</h2>
                    <p className="text-muted-foreground mb-6">
                        {form.firstName} {form.lastName} foi adicionado(a) com sucesso ao sistema.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => { setForm(INIT); setSubmitted(false); }}
                            className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-med"
                        >
                            Cadastrar Outro
                        </button>
                        <Link href="/receptionist" className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted/60 transition-med">
                            Voltar ao Painel
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
                    <h1 className="text-xl font-bold text-foreground">Cadastrar Novo Paciente</h1>
                    <p className="text-xs text-muted-foreground">Preencha todos os campos obrigatórios para criar o registro do paciente</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
                {/* Personal Info */}
                <div className="med-card p-5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</span>
                        Informações Pessoais
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Nome" required>
                            <input required className={inputCls} placeholder="Ex: Maria" value={form.firstName}
                                onChange={e => set("firstName", e.target.value)} />
                        </Field>
                        <Field label="Sobrenome" required>
                            <input required className={inputCls} placeholder="Ex: Santos" value={form.lastName}
                                onChange={e => set("lastName", e.target.value)} />
                        </Field>
                        <Field label="Data de Nascimento" required>
                            <input required type="date" className={inputCls} value={form.dob}
                                onChange={e => set("dob", e.target.value)} />
                        </Field>
                        <Field label="Gênero" required>
                            <select required className={selectCls} value={form.gender}
                                onChange={e => set("gender", e.target.value)}>
                                <option value="">Selecione o gênero…</option>
                                {GENDERS.map(g => <option key={g}>{g}</option>)}
                            </select>
                        </Field>
                        <Field label="Tipo Sanguíneo">
                            <select className={selectCls} value={form.blood}
                                onChange={e => set("blood", e.target.value)}>
                                <option value="">Desconhecido / Não testado</option>
                                {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                            </select>
                        </Field>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="med-card p-5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</span>
                        Detalhes de Contato
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Número de Telefone" required>
                            <input required type="tel" className={inputCls} placeholder="+55 (11) 99999-9999" value={form.phone}
                                onChange={e => set("phone", e.target.value)} />
                        </Field>
                        <Field label="Endereço de E-mail">
                            <input type="email" className={inputCls} placeholder="paciente@email.com" value={form.email}
                                onChange={e => set("email", e.target.value)} />
                        </Field>
                        <Field label="Endereço Residencial">
                            <textarea rows={2} className={inputCls} placeholder="Rua, Cidade, Estado, CEP" value={form.address}
                                onChange={e => set("address", e.target.value)} />
                        </Field>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="med-card p-5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">3</span>
                        Contato de Emergência
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Nome do Contato">
                            <input className={inputCls} placeholder="Nome completo" value={form.ecName}
                                onChange={e => set("ecName", e.target.value)} />
                        </Field>
                        <Field label="Telefone">
                            <input type="tel" className={inputCls} placeholder="+55 (11) 99999-9999" value={form.ecPhone}
                                onChange={e => set("ecPhone", e.target.value)} />
                        </Field>
                        <Field label="Parentesco/Relação">
                            <select className={selectCls} value={form.ecRelation}
                                onChange={e => set("ecRelation", e.target.value)}>
                                <option value="">Selecione…</option>
                                {RELATIONS.map(r => <option key={r}>{r}</option>)}
                            </select>
                        </Field>
                    </div>
                </div>

                {/* Medical Notes */}
                <div className="med-card p-5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">4</span>
                        Observações Médicas
                    </h3>
                    <Field label="Condições Existentes / Alergias / Observações">
                        <textarea rows={4} className={inputCls}
                            placeholder="Ex: Alérgico a penicilina. Diabético Tipo 2. Cirurgia anterior: apendicectomia em 2018."
                            value={form.notes} onChange={e => set("notes", e.target.value)} />
                    </Field>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button type="submit" disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-med">
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <UserPlus className="w-4 h-4" />
                        )}
                        {loading ? "Cadastrando…" : "Cadastrar Paciente"}
                    </button>
                    <button type="button" onClick={() => setForm(INIT)}
                        className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted/60 transition-med">
                        Limpar Formulário
                    </button>
                </div>
            </form>
        </DashboardLayout>
    );
}
