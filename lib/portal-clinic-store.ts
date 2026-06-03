import { doctors, initialAppointments, initialPatients, queue } from "@/lib/dummy-data";

export type PortalPatientRecord = {
  id: string;
  patientId: string;
  name: string;
  age: number;
  phone: string;
  doctorId: string;
  visitReason: string;
  lastVisit: string;
  status: "Waiting" | "Completed";
  insurance: string;
};

export type PortalBookingRecord = {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  status: "Booked" | "Waiting" | "Completed";
};

export type DoctorLeaveRecord = {
  doctorId: string;
  date: string;
  reason: string;
};

export const PORTAL_PATIENT_RECORDS_KEY = "medidesk-portal-patient-records";
export const PORTAL_BOOKINGS_KEY = "medidesk-portal-bookings";
export const DOCTOR_LEAVES_KEY = "medidesk-doctor-leaves";

export const doctorLeaves: DoctorLeaveRecord[] = [
  {
    doctorId: "dr-khalid",
    date: "12/06/2026",
    reason: "Conference leave"
  },
  {
    doctorId: "dr-ayesha",
    date: "18/06/2026",
    reason: "Personal leave"
  }
];

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readPortalPatientRecords() {
  return safeReadJson<PortalPatientRecord[]>(PORTAL_PATIENT_RECORDS_KEY, []);
}

export function writePortalPatientRecords(records: PortalPatientRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PORTAL_PATIENT_RECORDS_KEY, JSON.stringify(records));
}

export function readPortalBookings() {
  return safeReadJson<PortalBookingRecord[]>(PORTAL_BOOKINGS_KEY, []);
}

export function writePortalBookings(records: PortalBookingRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PORTAL_BOOKINGS_KEY, JSON.stringify(records));
}

export function readDoctorLeaves() {
  return safeReadJson<DoctorLeaveRecord[]>(DOCTOR_LEAVES_KEY, doctorLeaves);
}

export function writeDoctorLeaves(records: DoctorLeaveRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DOCTOR_LEAVES_KEY, JSON.stringify(records));
}

export function addDoctorLeave(record: DoctorLeaveRecord) {
  const currentLeaves = readDoctorLeaves();
  const withoutDuplicate = currentLeaves.filter(
    (leave) =>
      !(leave.doctorId === record.doctorId && leave.date === record.date)
  );

  writeDoctorLeaves([record, ...withoutDuplicate]);
}

export function createPortalPatientRecord(input: {
  name: string;
  patientId?: string;
  age?: number;
  phone?: string;
  doctorId: string;
  visitReason: string;
  lastVisit: string;
}) {
  return {
    id: crypto.randomUUID(),
    patientId: input.patientId ?? `MD-${Date.now()}`,
    name: input.name,
    age: input.age ?? 0,
    phone: input.phone?.trim() || "To confirm",
    doctorId: input.doctorId,
    visitReason: input.visitReason,
    lastVisit: input.lastVisit,
    status: "Waiting" as const,
    insurance: "To confirm"
  };
}

export function addPortalBooking(record: PortalBookingRecord) {
  const currentBookings = readPortalBookings();
  writePortalBookings([record, ...currentBookings]);

  const currentPatients = readPortalPatientRecords();
  const existingPatientIndex = currentPatients.findIndex(
    (patient) => patient.name.toLowerCase() === record.patientName.toLowerCase()
  );

  if (existingPatientIndex >= 0) {
    const updated = [...currentPatients];
    updated[existingPatientIndex] = {
      ...updated[existingPatientIndex],
      doctorId: record.doctorId,
      phone: record.patientPhone || updated[existingPatientIndex].phone,
      visitReason: record.reason,
      lastVisit: record.date,
      status: "Waiting"
    };
    writePortalPatientRecords(updated);
    return;
  }

  writePortalPatientRecords([
    createPortalPatientRecord({
      name: record.patientName,
      phone: record.patientPhone,
      doctorId: record.doctorId,
      visitReason: record.reason,
      lastVisit: record.date
    }),
    ...currentPatients
  ]);
}

export function getDoctorDashboardData(doctorId: string) {
  const seededPatients = initialPatients
    .filter((patient) => patient.doctorId === doctorId)
    .map((patient) => ({
      id: patient.id,
      patientId: patient.patientId,
      name: patient.name,
      age: patient.age,
      phone: patient.phone,
      doctorId: patient.doctorId,
      visitReason: patient.visitReason,
      lastVisit: patient.lastVisit,
      status:
        patient.status === "Completed"
          ? ("Completed" as const)
          : ("Waiting" as const),
      insurance: patient.insurance
    }));

  const storedPatients = readPortalPatientRecords().filter(
    (patient) => patient.doctorId === doctorId
  );

  const mergedPatients = [...storedPatients];
  const seenNames = new Set(storedPatients.map((patient) => patient.name.toLowerCase()));

  for (const patient of seededPatients) {
    if (!seenNames.has(patient.name.toLowerCase())) {
      mergedPatients.push(patient);
    }
  }

  const seededWaiting = queue
    .filter(
      (item) =>
        item.doctorId === doctorId &&
        (item.status === "Unread" || item.status === "Waiting")
    )
    .map((item) => ({
      id: item.id,
      token: item.token,
      patient: item.patient,
      visitType: item.visitType,
      status: item.status
    }));

  const storedBookings = readPortalBookings().filter((booking) => booking.doctorId === doctorId);
  const nextTokenStart =
    initialAppointments.reduce((highest, appointment) => {
      const current = Number(appointment.token.replace(/[^\d]/g, ""));
      return Number.isNaN(current) ? highest : Math.max(highest, current);
    }, 0) + 1;

  const storedWaiting = storedBookings.map((booking, index) => ({
    id: booking.id,
    token: `T-${String(nextTokenStart + index).padStart(3, "0")}`,
    patient: booking.patientName,
    visitType: booking.reason,
    status: booking.status === "Completed" ? "Completed" : "Waiting"
  }));

  return {
    patientRecords: mergedPatients,
    waitingPatients: [...storedWaiting, ...seededWaiting]
  };
}

export function getRequestedDoctorFromText(text: string) {
  const normalized = text.toLowerCase();

  return (
    doctors.find((doctor) => {
      const fullName = doctor.name.toLowerCase();
      const strippedName = fullName.replace(/^dr\.\s*/, "");
      const firstName = strippedName.split(" ")[0];
      const shortTag = doctor.id.replace("dr-", "");

      return (
        normalized.includes(fullName) ||
        normalized.includes(strippedName) ||
        normalized.includes(`dr ${firstName}`) ||
        normalized.includes(`doctor ${firstName}`) ||
        normalized.includes(shortTag)
      );
    }) ?? null
  );
}
