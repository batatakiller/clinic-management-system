// Mock data for development - will be replaced with actual API calls

export const mockUsers = [
  {
    _id: "1",
    name: "Admin User",
    email: "admin@clinic.com",
    password: "password123",
    role: "admin",
  },
  {
    _id: "2",
    name: "Dr. James Carter",
    email: "doctor@clinic.com",
    password: "password123",
    role: "doctor",
    specialization: "Cardiology",
  },
  {
    _id: "3",
    name: "Receptionist Jane",
    email: "receptionist@clinic.com",
    password: "password123",
    role: "receptionist",
  },
  {
    _id: "4",
    name: "Patient John",
    email: "patient@clinic.com",
    password: "password123",
    role: "patient",
  },
];

export const mockPatients = [
  {
    _id: "p1",
    name: "Maria Santos",
    email: "maria@example.com",
    role: "patient",
    phone: "+1 (555) 123-4567",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    _id: "p2",
    name: "Robert Chen",
    email: "robert@example.com",
    role: "patient",
    phone: "+1 (555) 234-5678",
    createdAt: "2026-02-01T14:30:00Z",
  },
];

export const mockAppointments = [
  {
    _id: "a1",
    patient: { _id: "p1", name: "Maria Santos" },
    doctor: { _id: "2", name: "Dr. James Carter" },
    date: "2026-03-05",
    time: "10:00 AM",
    status: "scheduled",
    type: "Follow-up",
  },
  {
    _id: "a2",
    patient: { _id: "p2", name: "Robert Chen" },
    doctor: { _id: "2", name: "Dr. James Carter" },
    date: "2026-03-05",
    time: "02:30 PM",
    status: "completed",
    type: "General Checkup",
  },
];

export const mockPrescriptions = [
  {
    _id: "rx1",
    patient: { _id: "p1", name: "Maria Santos" },
    doctor: { _id: "2", name: "Dr. James Carter" },
    date: "Feb 20, 2026",
    diagnosis: "Type 2 Diabetes Mellitus",
    medicines: [
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
      { name: "Glipizide", dosage: "5mg", frequency: "Once daily" },
    ],
  },
  {
    _id: "rx2",
    patient: { _id: "p2", name: "Robert Chen" },
    doctor: { _id: "2", name: "Dr. James Carter" },
    date: "Jan 15, 2026",
    diagnosis: "Hyperlipidemia",
    medicines: [
      { name: "Atorvastatin", dosage: "20mg", frequency: "At bedtime" },
      { name: "Omega-3", dosage: "1g", frequency: "Once daily" },
    ],
  },
];
