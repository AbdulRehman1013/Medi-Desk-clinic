"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { doctors, initialAppointments } from "@/lib/dummy-data";
import { patientReports } from "@/lib/portal-dashboard-data";
import { clearPortalSession, readPortalSession, type PortalSession } from "@/lib/portal-auth";
import {
  addPortalBooking,
  getRequestedDoctorFromText,
  readPortalBookings,
  type PortalBookingRecord
} from "@/lib/portal-clinic-store";

type PatientTimePreference = "First available" | "Morning" | "Afternoon";

const timePreferenceToSlot: Record<PatientTimePreference, string> = {
  "First available": "11:30 AM",
  Morning: "09:45 AM",
  Afternoon: "02:15 PM"
};

function explicitlyMentionedDoctorLine(symptoms: string, doctorName: string) {
  const requestedDoctor = getRequestedDoctorFromText(symptoms);
  if (!requestedDoctor) {
    return "";
  }

  return `Requested doctor respected: ${doctorName}.`;
}

function chooseDoctorBySymptoms(symptoms: string) {
  const explicitlyRequestedDoctor = getRequestedDoctorFromText(symptoms);
  if (explicitlyRequestedDoctor) {
    return explicitlyRequestedDoctor;
  }

  const text = symptoms.toLowerCase();
  const pickAvailable = (doctorId: string) =>
    doctors.find((doctor) => doctor.id === doctorId && doctor.status === "Available") ??
    doctors.find((doctor) => doctor.id === doctorId) ??
    doctors.find((doctor) => doctor.status === "Available") ??
    doctors[0];

  if (
    ["chest pain", "breathing", "injury", "severe pain", "bleeding"].some((item) =>
      text.includes(item)
    )
  ) {
    return pickAvailable("dr-salman");
  }

  if (
    ["child", "baby", "vaccination", "pediatric", "growth"].some((item) =>
      text.includes(item)
    )
  ) {
    return pickAvailable("dr-sara");
  }

  if (["allergy", "rash", "migraine", "follow-up"].some((item) => text.includes(item))) {
    return pickAvailable("dr-ayesha");
  }

  return pickAvailable("dr-khalid");
}

export function PatientDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<PortalSession | null>(null);
  const [assistantForm, setAssistantForm] = useState({
    symptoms: "",
    date: "2026-05-22",
    timePreference: "First available" as PatientTimePreference
  });
  const [assistantReply, setAssistantReply] = useState("");
  const [bookings, setBookings] = useState<PortalBookingRecord[]>([]);

  useEffect(() => {
    const currentSession = readPortalSession();
    if (!currentSession || currentSession.role !== "patient") {
      router.replace("/");
      return;
    }

    setSession(currentSession);
    setBookings(
      readPortalBookings().filter(
        (booking) => booking.patientName.toLowerCase() === currentSession.name.toLowerCase()
      )
    );
  }, [router]);

  const availableDoctors = doctors.filter((doctor) => doctor.status === "Available");

  const myReports = useMemo(() => {
    if (!session) {
      return [];
    }

    return patientReports.filter(
      (report) => report.patientName.toLowerCase() === session.name.toLowerCase()
    );
  }, [session]);

  const myAppointments = useMemo(() => {
    if (!session) {
      return [] as PortalBookingRecord[];
    }

    const seeded = initialAppointments
      .filter((appointment) => appointment.patient.toLowerCase() === session.name.toLowerCase())
      .map((appointment) => ({
        id: appointment.id,
        patientName: appointment.patient,
        patientPhone: session.phone ?? "",
        doctorId: appointment.doctorId,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.type,
        status: "Booked" as const
      }));

    return [...bookings, ...seeded];
  }, [bookings, session]);

  function handleAssistantBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session) {
      setAssistantReply("Please log in again before booking an appointment.");
      return;
    }

    if (!assistantForm.symptoms.trim()) {
      setAssistantReply("Please enter symptoms so I can suggest the best doctor.");
      return;
    }

    const doctor = chooseDoctorBySymptoms(assistantForm.symptoms);
    const slot = timePreferenceToSlot[assistantForm.timePreference];
    const newBooking: PortalBookingRecord = {
      id: crypto.randomUUID(),
      patientName: session.name,
      patientPhone: session.phone ?? "",
      doctorId: doctor.id,
      date: assistantForm.date.split("-").reverse().join("/"),
      time: slot,
      reason: assistantForm.symptoms.trim(),
      status: "Booked"
    };

    addPortalBooking(newBooking);
    setBookings((current) => [newBooking, ...current]);
    setAssistantReply(
      [
        `Appointment booked with ${doctor.name}.`,
        `Suggested time: ${newBooking.date} at ${newBooking.time}.`,
        `Doctor availability right now: ${doctor.status}.`,
        explicitlyMentionedDoctorLine(assistantForm.symptoms, doctor.name),
        "Please bring previous prescriptions and arrive 15 minutes early."
      ]
        .filter(Boolean)
        .join("\n")
    );
    setAssistantForm((current) => ({
      ...current,
      symptoms: ""
    }));
  }

  if (!session) {
    return (
      <div className="page-shell">
        <main className="panel portal-loading">
          <h3>Checking patient session...</h3>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <main className="portal-dashboard-shell">
        <header className="topbar">
          <div className="brand-block">
            <div className="brand-mark">MD</div>
            <div>
              <strong>{session.name}</strong>
              <p>Patient portal</p>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="soft-pill">{availableDoctors.length} doctors available now</span>
            <button
              className="secondary-button"
              onClick={() => {
                clearPortalSession();
                router.push("/");
              }}
            >
              Log out
            </button>
          </div>
        </header>

        <section className="content-grid">
          <article className="panel">
            <div className="panel-head">
              <div>
                <h3>AI assistant</h3>
                <p>Book appointments and see which doctor is available right now.</p>
              </div>
            </div>
            <form className="form-stack" onSubmit={handleAssistantBooking}>
              <label className="field">
                <span>Symptoms or visit reason</span>
                <input
                  value={assistantForm.symptoms}
                  onChange={(event) =>
                    setAssistantForm((current) => ({
                      ...current,
                      symptoms: event.target.value
                    }))
                  }
                  placeholder="Fever, cough, dizziness, child vaccination..."
                />
              </label>
              <div className="two-field">
                <label className="field">
                  <span>Preferred date</span>
                  <input
                    type="date"
                    value={assistantForm.date}
                    onChange={(event) =>
                      setAssistantForm((current) => ({
                        ...current,
                        date: event.target.value
                      }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Preferred time</span>
                  <select
                    value={assistantForm.timePreference}
                    onChange={(event) =>
                      setAssistantForm((current) => ({
                        ...current,
                        timePreference: event.target.value as PatientTimePreference
                      }))
                    }
                  >
                    <option>First available</option>
                    <option>Morning</option>
                    <option>Afternoon</option>
                  </select>
                </label>
              </div>
              <button type="submit" className="primary-button wide">
                Ask AI and book appointment
              </button>
            </form>
            <div className="summary-box assistant-output">
              <span>Assistant response</span>
              <p>
                {assistantReply ||
                  "I can book an appointment for you and tell which doctor is available now."}
              </p>
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <div>
                <h3>Doctors available now</h3>
                <p>Live availability based on the current MediDesk clinic data.</p>
              </div>
            </div>
            <div className="card-grid">
              {availableDoctors.map((doctor) => (
                <article key={doctor.id} className="patient-card">
                  <div className="patient-card-top">
                    <div>
                      <strong>{doctor.name}</strong>
                      <p>{doctor.specialty}</p>
                    </div>
                    <span className="status-chip completed">{doctor.status}</span>
                  </div>
                  <div className="meta-row">
                    <span>{doctor.room}</span>
                    <span>Ready for booking</span>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel">
            <div className="panel-head">
              <div>
                <h3>My reports</h3>
                <p>Only the reports linked to this patient account are shown here.</p>
              </div>
            </div>
            <div className="billing-list single-column">
              {myReports.map((report) => (
                <article key={report.id} className="list-card">
                  <div>
                    <strong>{report.title}</strong>
                    <p>
                      {report.date} | {report.summary}
                    </p>
                  </div>
                  <span
                    className={`status-chip ${report.status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {report.status}
                  </span>
                </article>
              ))}
              {!myReports.length ? (
                <div className="empty-card">
                  <p>No personal reports found yet for this patient account.</p>
                </div>
              ) : null}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <div>
                <h3>My appointments</h3>
                <p>Booked visits from your patient portal appear here.</p>
              </div>
            </div>
            <div className="billing-list single-column">
              {myAppointments.map((appointment) => (
                <article key={appointment.id} className="list-card">
                  <div>
                    <strong>{doctors.find((doctor) => doctor.id === appointment.doctorId)?.name}</strong>
                    <p>
                      {appointment.date} | {appointment.time} | {appointment.reason}
                    </p>
                  </div>
                  <span className="status-chip in-progress">Booked</span>
                </article>
              ))}
              {!myAppointments.length ? (
                <div className="empty-card">
                  <p>No appointments booked yet from this account.</p>
                </div>
              ) : null}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
