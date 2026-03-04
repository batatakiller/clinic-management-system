"use client";

import { useState } from "react";
import DashboardLayout from "../../DashboardLayout";
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Check, Clock, AlertCircle } from "lucide-react";
import { useToast } from "../../../components/ui/Toast";

type Status = "Pending" | "Confirmed" | "Completed" | "Cancelled";

interface Appointment {
    id: number;
    patient: string;
    doctor: string;
    date: string;
    time: string;
    type: string;
    status: Status;
}

const STATUS_STYLES: Record<Status, string> = {
    Pending: "bg-amber-100  text-amber-700  border-amber-200",
    Confirmed: "bg-blue-100   text-blue-700   border-blue-200",
    Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Cancelled: "bg-red-100    text-red-700    border-red-200",
};

const STATUS_ICONS: Record<Status, React.ReactNode> = {
    Pending: <Clock className="w-3 h-3" />,
    Confirmed: <Check className="w-3 h-3" />,
    Completed: <Check className="w-3 h-3" />,
    Cancelled: <X className="w-3 h-3" />,
};

const STATUSES: Status[] = ["Pending", "Confirmed", "Completed", "Cancelled"];
const DOCTORS = ["Dr. James Carter", "Dr. Priya Nguyen", "Dr. Alan Ross", "Dr. Sofia Patel", "Dr. Marcus Webb"];
const TYPES = ["General Checkup", "Follow-up", "Consultation", "Blood Test", "Vaccination", "Emergency"];

const INIT_APPOINTMENTS: Appointment[] = [
    { id: 1, patient: "Emma Wilson", doctor: "Dr. Carter", date: "2026-03-01", time: "09:15", type: "General Checkup", status: "Confirmed" },
    { id: 2, patient: "James Miller", doctor: "Dr. Nguyen", date: "2026-03-01", time: "10:00", type: "Follow-up", status: "Pending" },
    { id: 3, patient: "Sophia Davis", doctor: "Dr. Patel", date: "2026-03-01", time: "11:30", type: "Consultation", status: "Pending" },
    { id: 4, patient: "Liam Johnson", doctor: "Dr. Carter", date: "2026-03-01", time: "14:00", type: "Blood Test", status: "Completed" },
    { id: 5, patient: "Nina Patel", doctor: "Dr. Ross", date: "2026-03-02", time: "09:00", type: "Vaccination", status: "Confirmed" },
    { id: 6, patient: "Tom Weaver", doctor: "Dr. Webb", date: "2026-03-03", time: "10:30", type: "Emergency", status: "Pending" },
];

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function BookingModal({ onClose, onAdd }: { onClose: () => void; onAdd: (a: Omit<Appointment, "id">) => void }) {
    const [form, setForm] = useState({ patient: "", doctor: DOCTORS[0], date: "2026-03-01", time: "09:00", type: TYPES[0] });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.patient.trim()) e.patient = "Patient name is required";
        if (!form.date) e.date = "Date is required";
        if (!form.time) e.time = "Time is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onAdd({ ...form, status: "Pending" });
    };

    const inputCls = (field: string) =>
        `w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med ${errors[field] ? "border-red-400 bg-red-50" : "border-border bg-background"
        }`;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Book New Appointment</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-med"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Patient Name *</label>
                        <input className={inputCls("patient")} placeholder="Full name" value={form.patient}
                            onChange={e => setForm(f => ({ ...f, patient: e.target.value }))} />
                        {errors.patient && <p className="text-xs text-red-500 mt-1">{errors.patient}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Doctor</label>
                        <select className={inputCls("doctor")} value={form.doctor}
                            onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))}>
                            {DOCTORS.map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date *</label>
                            <input type="date" className={inputCls("date")} value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Time *</label>
                            <input type="time" className={inputCls("time")} value={form.time}
                                onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                            {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Appointment Type</label>
                        <select className={inputCls("type")} value={form.type}
                            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                            {TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-med">
                            Book Appointment
                        </button>
                        <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-border text-sm hover:bg-muted transition-med">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AppointmentsPage() {
    const { success, warning } = useToast();
    const [appointments, setAppointments] = useState<Appointment[]>(INIT_APPOINTMENTS);
    const [view, setView] = useState<"list" | "calendar">("list");
    const [showModal, setShowModal] = useState(false);
    const [calMonth] = useState({ year: 2026, month: 3 });
    const [activeDay, setActiveDay] = useState<number | null>(null);

    const cycleStatus = (id: number) => {
        setAppointments(prev => prev.map(a => {
            if (a.id !== id) return a;
            const idx = STATUSES.indexOf(a.status);
            const next = STATUSES[(idx + 1) % STATUSES.length];
            if (next === "Cancelled") warning("Status updated", `Appointment marked as ${next}`);
            else success("Status updated", `Appointment marked as ${next}`);
            return { ...a, status: next };
        }));
    };

    const addAppointment = (a: Omit<Appointment, "id">) => {
        setAppointments(prev => [...prev, { ...a, id: Date.now() }]);
        setShowModal(false);
        success("Appointment booked!", `${a.patient} scheduled for ${a.date} at ${a.time}`);
    };

    const dayAppointments = (day: number) =>
        appointments.filter(a => a.date === `2026-03-${String(day).padStart(2, "0")}`);

    return (
        <DashboardLayout requiredRole="receptionist">
            {showModal && <BookingModal onClose={() => setShowModal(false)} onAdd={addAppointment} />}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Appointments</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">{appointments.length} total · {appointments.filter(a => a.status === "Pending").length} pending</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View toggle */}
                    <div className="flex bg-muted rounded-lg p-0.5">
                        {(["list", "calendar"] as const).map(v => (
                            <button key={v} onClick={() => setView(v)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-med
                                    ${view === v ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}>
                                {v}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-med">
                        <Plus className="w-4 h-4" /> Book New
                    </button>
                </div>
            </div>

            {view === "list" ? (
                <div className="med-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    {["Patient", "Doctor", "Date", "Time", "Type", "Status"].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {appointments.map(a => (
                                    <tr key={a.id} className="hover:bg-muted/30 transition-med">
                                        <td className="px-4 py-3 font-medium text-foreground">{a.patient}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{a.doctor}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{a.date}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{a.time}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{a.type}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => cycleStatus(a.id)}
                                                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer transition-med hover:opacity-80 ${STATUS_STYLES[a.status]}`}>
                                                {STATUS_ICONS[a.status]}
                                                {a.status}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Calendar view */
                <div className="med-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            March {calMonth.year}
                        </h3>
                        <div className="flex gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-muted transition-med"><ChevronLeft className="w-4 h-4" /></button>
                            <button className="p-1.5 rounded-lg hover:bg-muted transition-med"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
                        ))}
                    </div>
                    {/* Offset: March 2026 starts on Sunday — offset 0 */}
                    <div className="grid grid-cols-7 gap-1">
                        {MONTH_DAYS.map(day => {
                            const count = dayAppointments(day).length;
                            const isActive = activeDay === day;
                            return (
                                <button key={day} onClick={() => setActiveDay(isActive ? null : day)}
                                    className={`relative aspect-square rounded-lg text-sm flex flex-col items-center justify-center transition-med border
                                        ${isActive ? "bg-primary text-white border-primary shadow-md" :
                                            count > 0 ? "border-blue-200 bg-blue-50 hover:bg-blue-100 text-foreground" :
                                                "border-transparent hover:bg-muted text-foreground"}`}>
                                    {day}
                                    {count > 0 && !isActive && (
                                        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {/* Day detail popover */}
                    {activeDay && dayAppointments(activeDay).length > 0 && (
                        <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">March {activeDay} Appointments</p>
                            <div className="space-y-2">
                                {dayAppointments(activeDay).map(a => (
                                    <div key={a.id} className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground w-10">{a.time}</span>
                                        <span className="flex-1 text-sm font-medium text-foreground">{a.patient}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[a.status]}`}>{a.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeDay && dayAppointments(activeDay).length === 0 && (
                        <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border text-center">
                            <AlertCircle className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                            <p className="text-sm text-muted-foreground">No appointments on March {activeDay}</p>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}
