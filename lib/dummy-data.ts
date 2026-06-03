export type DoctorStatus = "Available" | "Busy" | "Break";
export type QueueStatus = "Unread" | "In Progress" | "Waiting" | "Completed";
export type BillingStatus = "Paid" | "Pending" | "Overdue";
export type AppointmentStatus =
  | "Confirmed"
  | "Checked In"
  | "Waiting"
  | "Completed";
export type AssistantTask = "general" | "triage" | "scheduling" | "summary";

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  room: string;
  status: DoctorStatus;
  accent: string;
};

export type PatientRecord = {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  phone: string;
  doctorId: string;
  visitReason: string;
  insurance: string;
  lastVisit: string;
  status: "Waiting" | "In Consultation" | "Follow-up" | "Completed";
  balance: string;
  reports?: MedicalReport[];
};

export type MedicalReport = {
  id: string;
  date: string;
  diagnosis: string;
  vitals: {
    bp: string;
    pulse: string;
    temperature: string;
  };
  prescription: string[];
  doctorNotes: string;
};

export type QueueItem = {
  id: string;
  patientId: string;
  token: string;
  patient: string;
  doctorId: string;
  visitType: string;
  amount: string;
  time: string;
  status: QueueStatus;
  unread: boolean;
  summary: string;
  details: string[];
  insurance: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  patient: string;
  doctorId: string;
  date: string;
  time: string;
  type: string;
  status: AppointmentStatus;
  token: string;
};

export type Invoice = {
  id: string;
  patientId: string;
  patient: string;
  doctorId: string;
  service: string;
  amount: string;
  method: string;
  status: BillingStatus;
  due: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  task?: AssistantTask;
  appointmentCard?: {
    patient: string;
    doctor: string;
    time: string;
    token: string;
  };
};

export const demoCredentials = {
  email: "admin@medidesk.ai",
  password: "demo1234"
};

export const doctors: Doctor[] = [
  {
    id: "dr-khalid",
    name: "Dr. Khalid Ahmed",
    specialty: "General Physician",
    room: "Room 1",
    status: "Available",
    accent: "#0f8bff"
  },
  {
    id: "dr-ayesha",
    name: "Dr. Ayesha Noor",
    specialty: "Family Medicine",
    room: "Room 2",
    status: "Busy",
    accent: "#00b894"
  },
  {
    id: "dr-salman",
    name: "Dr. Salman Raza",
    specialty: "Emergency",
    room: "Room 3",
    status: "Available",
    accent: "#f39c12"
  },
  {
    id: "dr-sara",
    name: "Dr. Sara Fatima",
    specialty: "Pediatrics",
    room: "Room 4",
    status: "Break",
    accent: "#e056fd"
  }
];

export const initialPatients: PatientRecord[] = [
  {
    id: "p1",
    patientId: "MD-1001",
    name: "Ahmed Khan",
    age: 42,
    gender: "Male",
    phone: "0300-1112233",
    doctorId: "dr-khalid",
    visitReason: "Annual checkup and blood pressure review",
    insurance: "EFU Health",
    lastVisit: "22/05/2026",
    status: "Waiting",
    balance: "PKR 0",
    reports: [
      {
        id: "mr-1001-1",
        date: "18/04/2026",
        diagnosis: "Controlled hypertension review",
        vitals: {
          bp: "128/82",
          pulse: "78 bpm",
          temperature: "98.4 F"
        },
        prescription: ["Amlodipine 5mg once daily", "Low salt diet"],
        doctorNotes:
          "Blood pressure stable. Continue current medicine and repeat check in four weeks."
      },
      {
        id: "mr-1001-2",
        date: "11/03/2026",
        diagnosis: "Annual wellness check",
        vitals: {
          bp: "132/86",
          pulse: "82 bpm",
          temperature: "98.6 F"
        },
        prescription: ["Vitamin D weekly", "Lifestyle exercise plan"],
        doctorNotes:
          "Routine labs reviewed. Advised walking schedule and hydration."
      }
    ]
  },
  {
    id: "p2",
    patientId: "MD-1002",
    name: "Sara Malik",
    age: 31,
    gender: "Female",
    phone: "0311-4455667",
    doctorId: "dr-ayesha",
    visitReason: "Follow-up after antibiotics",
    insurance: "State Life",
    lastVisit: "22/05/2026",
    status: "In Consultation",
    balance: "PKR 1,500",
    reports: [
      {
        id: "mr-1002-1",
        date: "16/05/2026",
        diagnosis: "Upper respiratory infection follow-up",
        vitals: {
          bp: "116/74",
          pulse: "84 bpm",
          temperature: "99.1 F"
        },
        prescription: ["Cetirizine at night", "Steam inhalation"],
        doctorNotes:
          "Symptoms improving after antibiotics. No new warning signs reported."
      },
      {
        id: "mr-1002-2",
        date: "05/05/2026",
        diagnosis: "Acute throat infection",
        vitals: {
          bp: "118/76",
          pulse: "88 bpm",
          temperature: "100.2 F"
        },
        prescription: ["Amoxicillin-clavulanate 625mg", "Paracetamol as needed"],
        doctorNotes:
          "Advised fluids, rest, and review if fever persists beyond 48 hours."
      }
    ]
  },
  {
    id: "p3",
    patientId: "MD-1003",
    name: "Muhammad Ali",
    age: 27,
    gender: "Male",
    phone: "0321-9988776",
    doctorId: "dr-salman",
    visitReason: "High fever and dizziness",
    insurance: "Cash",
    lastVisit: "22/05/2026",
    status: "Waiting",
    balance: "PKR 3,000",
    reports: [
      {
        id: "mr-1003-1",
        date: "20/05/2026",
        diagnosis: "Viral fever with dizziness",
        vitals: {
          bp: "110/70",
          pulse: "96 bpm",
          temperature: "101.4 F"
        },
        prescription: ["Paracetamol 500mg", "ORS twice daily"],
        doctorNotes:
          "Monitor temperature and hydration. CBC suggested if fever continues."
      }
    ]
  },
  {
    id: "p4",
    patientId: "MD-1004",
    name: "Fatima Zahra",
    age: 8,
    gender: "Female",
    phone: "0333-5678901",
    doctorId: "dr-sara",
    visitReason: "Pediatric growth check",
    insurance: "Sehat Sahulat",
    lastVisit: "22/05/2026",
    status: "Follow-up",
    balance: "PKR 0",
    reports: [
      {
        id: "mr-1004-1",
        date: "12/04/2026",
        diagnosis: "Pediatric growth review",
        vitals: {
          bp: "96/62",
          pulse: "92 bpm",
          temperature: "98.7 F"
        },
        prescription: ["Multivitamin syrup", "Nutrition plan"],
        doctorNotes:
          "Growth curve within expected range. Parent advised balanced meals and sleep routine."
      },
      {
        id: "mr-1004-2",
        date: "08/02/2026",
        diagnosis: "Seasonal cough",
        vitals: {
          bp: "94/60",
          pulse: "98 bpm",
          temperature: "99.3 F"
        },
        prescription: ["Saline drops", "Honey in warm water"],
        doctorNotes:
          "No wheeze heard. Follow-up only if cough worsens or fever develops."
      }
    ]
  }
];

export const queue: QueueItem[] = [
  {
    id: "q1",
    patientId: "p1",
    token: "T-001",
    patient: "Ahmed Khan",
    doctorId: "dr-khalid",
    visitType: "Annual Checkup",
    amount: "PKR 2,000",
    time: "10:00 AM",
    status: "Unread",
    unread: true,
    summary:
      "Returning patient with stable vitals. Reception can move him directly to Room 1.",
    details: [
      "Patient arrived at 9:52 AM.",
      "Vitals recorded: BP 120/80, Temp 98.6 F, Weight 75 kg.",
      "No pending billing issue for this visit."
    ],
    insurance: "EFU Health"
  },
  {
    id: "q2",
    patientId: "p2",
    token: "T-002",
    patient: "Sara Malik",
    doctorId: "dr-ayesha",
    visitType: "Follow-up",
    amount: "PKR 1,500",
    time: "10:20 AM",
    status: "In Progress",
    unread: true,
    summary:
      "Symptoms improved after the last prescription. Doctor requested a short progress note.",
    details: [
      "Checked in at 10:11 AM.",
      "Lab results uploaded and marked normal.",
      "Billing pre-authorized through card."
    ],
    insurance: "State Life"
  },
  {
    id: "q3",
    patientId: "p3",
    token: "T-003",
    patient: "Muhammad Ali",
    doctorId: "dr-salman",
    visitType: "Emergency",
    amount: "PKR 3,000",
    time: "10:40 AM",
    status: "Waiting",
    unread: false,
    summary:
      "Priority patient with fever and dizziness. Keep triage notes visible for Room 3.",
    details: [
      "Nurse triage completed at 10:28 AM.",
      "Emergency notes forwarded to Dr. Salman.",
      "Family informed about expected wait time."
    ],
    insurance: "Cash"
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: "a1",
    patientId: "p1",
    patient: "Ahmed Khan",
    doctorId: "dr-khalid",
    date: "22/05/2026",
    time: "10:00 AM",
    type: "Checkup",
    status: "Confirmed",
    token: "T-001"
  },
  {
    id: "a2",
    patientId: "p2",
    patient: "Sara Malik",
    doctorId: "dr-ayesha",
    date: "22/05/2026",
    time: "10:20 AM",
    type: "Follow-up",
    status: "Checked In",
    token: "T-002"
  },
  {
    id: "a3",
    patientId: "p4",
    patient: "Fatima Zahra",
    doctorId: "dr-sara",
    date: "22/05/2026",
    time: "11:00 AM",
    type: "Pediatric Review",
    status: "Waiting",
    token: "T-004"
  },
  {
    id: "a4",
    patientId: "p3",
    patient: "Muhammad Ali",
    doctorId: "dr-salman",
    date: "22/05/2026",
    time: "11:20 AM",
    type: "Emergency Consultation",
    status: "Waiting",
    token: "T-003"
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: "INV-1001",
    patientId: "p1",
    patient: "Ahmed Khan",
    doctorId: "dr-khalid",
    service: "Consultation + vitals",
    amount: "PKR 2,000",
    method: "Card",
    status: "Paid",
    due: "22/05/2026"
  },
  {
    id: "INV-1002",
    patientId: "p2",
    patient: "Sara Malik",
    doctorId: "dr-ayesha",
    service: "Follow-up visit",
    amount: "PKR 1,500",
    method: "JazzCash",
    status: "Pending",
    due: "22/05/2026"
  },
  {
    id: "INV-1003",
    patientId: "p3",
    patient: "Muhammad Ali",
    doctorId: "dr-salman",
    service: "Emergency assessment",
    amount: "PKR 3,000",
    method: "Cash",
    status: "Overdue",
    due: "21/05/2026"
  },
  {
    id: "INV-1004",
    patientId: "p4",
    patient: "Fatima Zahra",
    doctorId: "dr-sara",
    service: "Growth review package",
    amount: "PKR 2,200",
    method: "Insurance",
    status: "Paid",
    due: "22/05/2026"
  }
];

export const initialAssistantMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    task: "general",
    content:
      "MediDesk demo is ready. I can help with front-desk summaries, scheduling ideas, and billing notes."
  },
  {
    id: "m2",
    role: "assistant",
    task: "scheduling",
    content:
      "Quick tip: use the AI visit planner to match symptoms to the right doctor, suggest simple tests, and book the appointment in one step."
  }
];
