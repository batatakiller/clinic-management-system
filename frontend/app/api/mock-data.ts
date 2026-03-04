// Mock data store for development
// In production, this would be replaced with real database calls

export interface MockUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "doctor" | "receptionist" | "patient";
  specialization?: string;
  department?: string;
  phone?: string;
  createdAt?: string;
}

export interface MockPatient {
  _id: string;
  name: string;
  age: number;
  email: string;
  phone?: string;
  bloodGroup?: string;
  gender?: string;
  address?: string;
  medicalHistory?: string[];
  createdAt: string;
}

export interface MockAppointment {
  _id: string;
  patient: { _id: string; name: string; age?: number };
  doctor: { _id: string; name: string };
  date: string;
  time: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  type: string;
  notes?: string;
  createdAt: string;
}

export interface MockPrescription {
  _id: string;
  doctor: { _id: string; name: string };
  patient: { _id: string; name: string };
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    refills?: number;
  }>;
  issuedAt: string;
  createdAt: string;
}

// Mock Users
export const mockUsers: MockUser[] = [
  { _id: "admin1", name: "Admin User", email: "admin@clinic.com", password: "password123", role: "admin", department: "Administration", createdAt: "2025-01-01T00:00:00Z" },
  { _id: "doctor1", name: "Dr. James Carter", email: "doctor@clinic.com", password: "password123", role: "doctor", specialization: "Cardiology", createdAt: "2025-01-01T00:00:00Z" },
  { _id: "doctor2", name: "Dr. Priya Nguyen", email: "doctor2@clinic.com", password: "password123", role: "doctor", specialization: "General Medicine", createdAt: "2025-01-15T00:00:00Z" },
  { _id: "doctor3", name: "Dr. Alan Ross", email: "doctor3@clinic.com", password: "password123", role: "doctor", specialization: "Endocrinology", createdAt: "2025-02-01T00:00:00Z" },
  { _id: "receptionist1", name: "Sarah Johnson", email: "receptionist@clinic.com", password: "password123", role: "receptionist", createdAt: "2025-01-01T00:00:00Z" },
  { _id: "patient1", name: "John Doe", email: "patient@clinic.com", password: "password123", role: "patient", phone: "+1-555-0123", createdAt: "2025-06-15T00:00:00Z" },
  { _id: "patient2", name: "Jane Smith", email: "patient2@clinic.com", password: "password123", role: "patient", phone: "+1-555-0124", createdAt: "2025-08-20T00:00:00Z" },
  { _id: "patient3", name: "Bob Wilson", email: "patient3@clinic.com", password: "password123", role: "patient", phone: "+1-555-0125", createdAt: "2025-11-10T00:00:00Z" },
];

// Mock Patients
export const mockPatients: MockPatient[] = [
  { _id: "patient1", name: "John Doe", age: 45, email: "john@example.com", phone: "+1-555-0123", bloodGroup: "A+", gender: "Male", medicalHistory: ["Hypertension"], createdAt: "2025-06-15T00:00:00Z" },
  { _id: "patient2", name: "Jane Smith", age: 32, email: "jane@example.com", phone: "+1-555-0124", bloodGroup: "O+", gender: "Female", medicalHistory: [], createdAt: "2025-08-20T00:00:00Z" },
  { _id: "patient3", name: "Bob Wilson", age: 58, email: "bob@example.com", phone: "+1-555-0125", bloodGroup: "B+", gender: "Male", medicalHistory: ["Diabetes Type 2", "Hyperlipidemia"], createdAt: "2025-11-10T00:00:00Z" },
  { _id: "patient4", name: "Alice Brown", age: 28, email: "alice@example.com", phone: "+1-555-0126", bloodGroup: "AB+", gender: "Female", medicalHistory: ["Asthma"], createdAt: new Date().toISOString() },
  { _id: "patient5", name: "Charlie Davis", age: 67, email: "charlie@example.com", phone: "+1-555-0127", bloodGroup: "O-", gender: "Male", medicalHistory: ["Heart Disease"], createdAt: new Date(Date.now() - 86400000).toISOString() },
];

// Mock Appointments
export const mockAppointments: MockAppointment[] = [
  { _id: "appt1", patient: { _id: "patient1", name: "John Doe", age: 45 }, doctor: { _id: "doctor1", name: "Dr. James Carter" }, date: new Date().toISOString().split("T")[0], time: "09:00", status: "scheduled", type: "Follow-up", createdAt: "2025-02-25T00:00:00Z" },
  { _id: "appt2", patient: { _id: "patient2", name: "Jane Smith", age: 32 }, doctor: { _id: "doctor1", name: "Dr. James Carter" }, date: new Date().toISOString().split("T")[0], time: "10:30", status: "in-progress", type: "Consultation", createdAt: "2025-02-25T00:00:00Z" },
  { _id: "appt3", patient: { _id: "patient3", name: "Bob Wilson", age: 58 }, doctor: { _id: "doctor2", name: "Dr. Priya Nguyen" }, date: new Date(Date.now() + 86400000).toISOString().split("T")[0], time: "14:00", status: "scheduled", type: "General Checkup", createdAt: "2025-02-24T00:00:00Z" },
  { _id: "appt4", patient: { _id: "patient1", name: "John Doe", age: 45 }, doctor: { _id: "doctor3", name: "Dr. Alan Ross" }, date: new Date(Date.now() - 86400000).toISOString().split("T")[0], time: "11:00", status: "completed", type: "Lab Review", createdAt: "2025-02-20T00:00:00Z" },
  { _id: "appt5", patient: { _id: "patient4", name: "Alice Brown", age: 28 }, doctor: { _id: "doctor1", name: "Dr. James Carter" }, date: new Date(Date.now() - 172800000).toISOString().split("T")[0], time: "15:30", status: "cancelled", type: "Emergency", createdAt: "2025-02-18T00:00:00Z" },
];

// Mock Prescriptions
export const mockPrescriptions: MockPrescription[] = [
  { _id: "rx1", doctor: { _id: "doctor1", name: "Dr. James Carter" }, patient: { _id: "patient1", name: "John Doe" }, diagnosis: "Hypertension", medications: [{ name: "Lisinopril", dosage: "10mg", frequency: "Once daily", refills: 3 }], issuedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { _id: "rx2", doctor: { _id: "doctor1", name: "Dr. James Carter" }, patient: { _id: "patient1", name: "John Doe" }, diagnosis: "Type 2 Diabetes", medications: [{ name: "Metformin", dosage: "500mg", frequency: "Twice daily", refills: 2 }], issuedAt: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: "rx3", doctor: { _id: "doctor2", name: "Dr. Priya Nguyen" }, patient: { _id: "patient2", name: "Jane Smith" }, diagnosis: "Upper Respiratory Infection", medications: [{ name: "Amoxicillin", dosage: "500mg", frequency: "3x daily", refills: 0 }, { name: "Ibuprofen", dosage: "400mg", frequency: "As needed", refills: 0 }], issuedAt: new Date(Date.now() - 172800000).toISOString(), createdAt: new Date(Date.now() - 172800000).toISOString() },
  { _id: "rx4", doctor: { _id: "doctor3", name: "Dr. Alan Ross" }, patient: { _id: "patient3", name: "Bob Wilson" }, diagnosis: "Hyperlipidemia", medications: [{ name: "Atorvastatin", dosage: "20mg", frequency: "At bedtime", refills: 5 }], issuedAt: new Date(Date.now() - 259200000).toISOString(), createdAt: new Date(Date.now() - 259200000).toISOString() },
];
