"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../DashboardLayout";
import { Calendar, Clock, Save, X, AlertCircle, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  phone?: string;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30", "17:00",
];

export default function BookAppointmentPage() {
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    date: new Date().toISOString().split("T")[0],
    timeSlot: "",
    reason: "",
    notes: "",
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Fetch doctors and patients on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [doctorsRes, patientsRes] = await Promise.all([
          apiFetch("/api/users/doctors"),
          apiFetch("/api/patients?limit=100"),
        ]);
        setDoctors(doctorsRes.data || []);
        setPatients(patientsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load patients or doctors");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId || !formData.timeSlot || !formData.reason) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          patientId: "",
          doctorId: "",
          date: new Date().toISOString().split("T")[0],
          timeSlot: "",
          reason: "",
          notes: "",
        });
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      patientId: "",
      doctorId: "",
      date: new Date().toISOString().split("T")[0],
      timeSlot: "",
      reason: "",
      notes: "",
    });
  };

  if (loadingData) {
    return (
      <DashboardLayout requiredRole="receptionist">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Loading patients and doctors...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="receptionist">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Book Appointment</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Schedule a new appointment for a patient</p>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Appointment booked successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="med-card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Patient <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
              required
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} - {patient.email}{patient.phone ? ` (${patient.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Doctor <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
              required
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Time <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.timeSlot}
              onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
              required
            >
              <option value="">Select Time</option>
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Reason for Appointment <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g., General Checkup, Follow-up, Consultation"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
              required
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-med shadow-md"
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Book Appointment
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-6 py-2.5 rounded-xl border border-border hover:bg-muted transition-med flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
