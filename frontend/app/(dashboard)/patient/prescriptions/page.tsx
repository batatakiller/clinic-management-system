"use client";

import DashboardLayout from "../../DashboardLayout";
import { FileText, Download, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "../../../contexts/AuthContext";

interface Prescription {
  _id: string;
  diagnosis: string;
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  generalInstructions?: string;
  createdAt: string;
  issuedBy?: string;
}

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        if (!user?._id) {
          setError("User not authenticated");
          return;
        }
        const data = await apiFetch(`/api/prescriptions/patient/${user._id}`);
        setPrescriptions(data.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load prescriptions",
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchPrescriptions();
  }, [user]);

  const handleDownloadPDF = async (prescriptionId: string) => {
    try {
      // Get token from localStorage or cookies
      let token = "";
      try {
        const stored = localStorage.getItem("hms_auth");
        if (stored) {
          const parsed = JSON.parse(stored);
          token = parsed.token || "";
        }
      } catch {
        // ignore
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(
        `${baseUrl}/api/prescriptions/${prescriptionId}/pdf`,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `prescription-${prescriptionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        setError("Failed to download prescription PDF");
      }
    } catch (err) {
      console.error("Failed to download PDF:", err);
      setError("Error downloading prescription PDF");
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Prescriptions</h1>
          <p className="text-muted-foreground mt-1">
            View and download your medical prescriptions
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-muted-foreground">
                Loading prescriptions...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && prescriptions.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No prescriptions yet
            </h3>
            <p className="text-muted-foreground">
              Your prescriptions will appear here once issued by your doctor.
            </p>
          </div>
        )}

        {!loading && !error && prescriptions.length > 0 && (
          <div className="space-y-4">
            {prescriptions.map((rx) => (
              <div
                key={rx._id}
                className="rounded-lg border border-border bg-card p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {rx.diagnosis || "Prescription"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Issued on{" "}
                      {new Date(rx.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadPDF(rx._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>

                {/* Medicines */}
                {rx.medicines && rx.medicines.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      Medicines
                    </h4>
                    <div className="space-y-2">
                      {rx.medicines.map((med, idx) => (
                        <div
                          key={idx}
                          className="bg-background rounded p-3 border border-border/50"
                        >
                          <p className="font-medium text-foreground">
                            {med.name}
                          </p>
                          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                            <p>Dosage: {med.dosage}</p>
                            <p>Frequency: {med.frequency}</p>
                            <p>Duration: {med.duration}</p>
                            {med.instructions && (
                              <p>Instructions: {med.instructions}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* General Instructions */}
                {rx.generalInstructions && (
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      General Instructions
                    </p>
                    <p className="text-sm text-foreground">
                      {rx.generalInstructions}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
