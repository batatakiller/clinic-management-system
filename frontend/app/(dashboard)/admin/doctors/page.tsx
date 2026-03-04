"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../DashboardLayout";
import { Stethoscope, Plus, Search, Mail, Phone, Calendar } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialization: string;
  department?: string;
  phone?: string;
  createdAt?: string;
}

export default function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await apiFetch("/api/users/doctors");
        setDoctors(res.data || []);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(search.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(search.toLowerCase()) ||
    doctor.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout requiredRole="admin">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Manage Doctors</h1>
          <p className="text-xs text-muted-foreground mt-0.5">View and manage medical staff</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-med shadow-md">
          <Plus className="w-4 h-4" />
          Add Doctor
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
          />
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="med-card p-12 text-center">
          <Stethoscope className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading doctors...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="med-card p-12 text-center">
          <Stethoscope className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No doctors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="med-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {doctor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                    <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                  </div>
                </div>
                <Stethoscope className="w-5 h-5 text-blue-600 opacity-50" />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{doctor.email}</span>
                </div>
                {doctor.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{doctor.phone}</span>
                  </div>
                )}
                {doctor.department && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{doctor.department}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <button className="flex-1 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-med">
                  View Profile
                </button>
                <button className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-med">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
