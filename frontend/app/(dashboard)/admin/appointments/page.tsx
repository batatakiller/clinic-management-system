"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../DashboardLayout";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Stethoscope,
  Phone,
  Mail,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialization: string;
}

interface Appointment {
  _id: string;
  patient?: Patient;
  doctor?: Doctor;
  date: string;
  time: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  type: "checkup" | "follow-up" | "emergency" | "consultation" | "other";
  notes?: string;
  createdAt?: string;
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-100",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  completed: "bg-slate-100 text-slate-700 border-slate-200",
  cancelled: "bg-red-50 text-red-700 border-red-100",
  "no-show": "bg-amber-50 text-amber-700 border-amber-100",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  scheduled: <Clock className="w-3 h-3" />,
  confirmed: <CheckCircle className="w-3 h-3" />,
  completed: <CheckCircle className="w-3 h-3" />,
  cancelled: <XCircle className="w-3 h-3" />,
  "no-show": <AlertCircle className="w-3 h-3" />,
};

const TYPE_OPTIONS = [
  { value: "checkup", label: "Check-up" },
  { value: "follow-up", label: "Follow-up" },
  { value: "emergency", label: "Emergency" },
  { value: "consultation", label: "Consultation" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no-show", label: "No Show" },
];

export default function ManageAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    status: "scheduled" as Appointment["status"],
    type: "checkup" as Appointment["type"],
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, doctorsRes] = await Promise.all([
        apiFetch("/api/appointments").catch(() => ({ data: [] })),
        apiFetch("/api/users/doctors").catch(() => ({ data: [] })),
      ]);
      setAppointments(appointmentsRes.data || []);
      setDoctors(doctorsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patient?.name.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctor?.name.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctor?.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (appointment?: Appointment) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      setFormData({
        patientId: appointment.patient?._id || "",
        doctorId: appointment.doctor?._id || "",
        date: appointment.date.split("T")[0],
        time: appointment.time,
        status: appointment.status,
        type: appointment.type,
        notes: appointment.notes || "",
      });
    } else {
      setSelectedAppointment(null);
      setFormData({
        patientId: "",
        doctorId: "",
        date: new Date().toISOString().split("T")[0],
        time: "09:00",
        status: "scheduled",
        type: "checkup",
        notes: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        date: formData.date,
        time: formData.time,
        status: formData.status,
        type: formData.type,
        notes: formData.notes,
      };

      if (selectedAppointment) {
        await apiFetch(`/api/appointments/${selectedAppointment._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/appointments", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Failed to save appointment:", error);
      alert("Failed to save appointment. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await apiFetch(`/api/appointments/${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      alert("Failed to delete appointment.");
    }
  };

  const handleStatusChange = async (id: string, newStatus: Appointment["status"]) => {
    try {
      await apiFetch(`/api/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  return (
    <DashboardLayout requiredRole="admin">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Admin</p>
          <h1 className="text-xl font-extrabold text-slate-900">Manage Appointments</h1>
          <p className="text-xs text-slate-500 mt-0.5">Schedule and manage all clinic appointments</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient, doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 h-10 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400 text-sm">Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">No appointments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Patient</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Doctor</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date &amp; Time</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAppointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/80 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                          {apt.patient?.name
                            ? apt.patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                            : "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {apt.patient?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {apt.patient?.email || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">
                          {apt.doctor?.name
                            ? apt.doctor.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                            : "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {apt.doctor?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {apt.doctor?.specialization || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-foreground font-medium">
                          {new Date(apt.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">{apt.time}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground capitalize">
                        {apt.type.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[apt.status]}`}
                      >
                        {STATUS_ICONS[apt.status]}
                        {apt.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(apt)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-med"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(apt)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-med"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setDropdownOpen(dropdownOpen === apt._id ? null : apt._id)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-med"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {dropdownOpen === apt._id && (
                            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-white shadow-lg z-10 overflow-hidden">
                              <div className="py-1">
                                {apt.status !== "completed" && (
                                  <button
                                    onClick={() => {
                                      handleStatusChange(apt._id, "completed");
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Mark Completed
                                  </button>
                                )}
                                {apt.status !== "cancelled" && (
                                  <button
                                    onClick={() => {
                                      handleStatusChange(apt._id, "cancelled");
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    Cancel
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    handleDelete(apt._id);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-border"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
              <h2 className="text-[15px] font-bold text-white">
                <div className="flex items-center gap-2">
                  {selectedAppointment ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  {selectedAppointment ? "Edit Appointment" : "New Appointment"}
                </div>
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Patient
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                >
                  <option value="">Select Patient</option>
                  {/* Patients would be fetched from API - placeholder for now */}
                  <option value="placeholder">Patient (integrated with patient list)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Doctor
                </label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} - {doc.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as Appointment["type"] })
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as Appointment["status"] })
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
                >
                  {selectedAppointment ? "Update" : "Create"} Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Appointment Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-med"
              >
                <XCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {selectedAppointment.patient?.name
                    ? selectedAppointment.patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                    : "?"}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {selectedAppointment.patient?.name || "Unknown Patient"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.patient?.email || "-"}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[selectedAppointment.status]}`}
                >
                  {STATUS_ICONS[selectedAppointment.status]}
                  {selectedAppointment.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Stethoscope className="w-4 h-4" />
                    <span className="text-xs">Doctor</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {selectedAppointment.doctor?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.doctor?.specialization || "-"}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Date & Time</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {new Date(selectedAppointment.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.time}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Type</span>
                </div>
                <p className="font-medium text-foreground capitalize">
                  {selectedAppointment.type.replace("-", " ")}
                </p>
              </div>

              {selectedAppointment.notes && (
                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">Notes</span>
                  </div>
                  <p className="text-sm text-foreground">{selectedAppointment.notes}</p>
                </div>
              )}

              {selectedAppointment.patient?.phone && (
                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Phone className="w-4 h-4" />
                    <span className="text-xs">Contact</span>
                  </div>
                  <p className="text-sm text-foreground">{selectedAppointment.patient.phone}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleOpenModal(selectedAppointment);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-semibold hover:bg-amber-100 transition-med"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-med"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
