export type DoctorHistoryItem = {
  id: string;
  doctorId: string;
  patient: string;
  date: string;
  summary: string;
  outcome: string;
  status: "Waiting" | "Completed";
};

export type PatientReport = {
  id: string;
  patientName: string;
  title: string;
  date: string;
  summary: string;
  status: "Ready" | "Pending Review";
};

export const doctorHistory: DoctorHistoryItem[] = [
  {
    id: "dh-1",
    doctorId: "dr-khalid",
    patient: "Ahmed Khan",
    date: "22/05/2026",
    summary: "Blood pressure review and annual checkup",
    outcome: "Stable vitals, continue current medicines",
    status: "Completed"
  },
  {
    id: "dh-2",
    doctorId: "dr-ayesha",
    patient: "Sara Malik",
    date: "22/05/2026",
    summary: "Follow-up after antibiotics",
    outcome: "Symptoms improved, review after one week",
    status: "Completed"
  },
  {
    id: "dh-3",
    doctorId: "dr-salman",
    patient: "Muhammad Ali",
    date: "22/05/2026",
    summary: "High fever and dizziness",
    outcome: "Urgent observation and doctor review",
    status: "Waiting"
  },
  {
    id: "dh-4",
    doctorId: "dr-sara",
    patient: "Fatima Zahra",
    date: "22/05/2026",
    summary: "Pediatric growth and vaccination review",
    outcome: "Routine follow-up next month",
    status: "Completed"
  }
];

export const patientReports: PatientReport[] = [
  {
    id: "pr-1",
    patientName: "Ahmed Khan",
    title: "Blood Pressure Review",
    date: "22/05/2026",
    summary: "Blood pressure stable. Continue the current plan and reduce salt intake.",
    status: "Ready"
  },
  {
    id: "pr-2",
    patientName: "Sara Malik",
    title: "Follow-up Summary",
    date: "22/05/2026",
    summary: "Recovery is progressing well. Prescription renewal prepared.",
    status: "Ready"
  },
  {
    id: "pr-3",
    patientName: "Fatima Zahra",
    title: "Pediatric Growth Report",
    date: "22/05/2026",
    summary: "Growth milestones are on track. Vaccination card verified.",
    status: "Pending Review"
  }
];
