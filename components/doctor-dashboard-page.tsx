"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { doctors, initialAppointments, initialPatients } from "@/lib/dummy-data";
import { doctorHistory } from "@/lib/portal-dashboard-data";
import { clearPortalSession, readPortalSession, type PortalSession } from "@/lib/portal-auth";
import {
  addDoctorLeave,
  getDoctorDashboardData,
  readDoctorLeaves,
  type DoctorLeaveRecord,
  type PortalPatientRecord
} from "@/lib/portal-clinic-store";

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function datesMatchDisplay(date: Date, displayDate: Date | string) {
  const displayValue =
    displayDate instanceof Date ? formatDisplayDate(displayDate) : displayDate;

  return formatDisplayDate(date) === displayValue;
}

export function DoctorDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<PortalSession | null>(null);
  const [selectedPatientForHistory, setSelectedPatientForHistory] =
    useState<PortalPatientRecord | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date());
  const [leaveRecords, setLeaveRecords] = useState<DoctorLeaveRecord[]>([]);

  useEffect(() => {
    const currentSession = readPortalSession();
    if (!currentSession || currentSession.role !== "doctor") {
      router.replace("/");
      return;
    }

    setSession(currentSession);
    setLeaveRecords(readDoctorLeaves());
  }, [router]);

  const linkedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === session?.linkedDoctorId) ?? doctors[0],
    [session]
  );

  const assignedHistory = useMemo(
    () => doctorHistory.filter((item) => item.doctorId === linkedDoctor?.id),
    [linkedDoctor]
  );

  const dashboardData = useMemo(
    () => getDoctorDashboardData(linkedDoctor?.id ?? doctors[0].id),
    [linkedDoctor]
  );

  const waitingPatients = dashboardData.waitingPatients;

  const completedToday = assignedHistory.filter((item) => item.status === "Completed");
  const patientRecords = dashboardData.patientRecords;
  const reportsByPatientId = useMemo(
    () =>
      Object.fromEntries(
        initialPatients.map((patient) => [patient.id, patient.reports ?? []])
      ),
    []
  );
  const doctorAppointments = useMemo(
    () =>
      initialAppointments.filter(
        (appointment) => appointment.doctorId === linkedDoctor?.id
      ),
    [linkedDoctor]
  );
  const selectedDateAppointments = useMemo(
    () =>
      doctorAppointments.filter((appointment) =>
        datesMatchDisplay(selectedCalendarDate, appointment.date)
      ),
    [doctorAppointments, selectedCalendarDate]
  );
  const linkedDoctorLeaves = useMemo(
    () =>
      leaveRecords.filter((leave) => leave.doctorId === linkedDoctor?.id),
    [leaveRecords, linkedDoctor]
  );
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingBlanks = firstDay.getDay();

    return [
      ...Array.from({ length: leadingBlanks }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1))
    ];
  }, [calendarMonth]);

  function markSelectedDateAsLeave() {
    const leaveDate = formatDisplayDate(selectedCalendarDate);
    const leaveRecord = {
      doctorId: linkedDoctor?.id ?? doctors[0].id,
      date: leaveDate,
      reason: "Marked as leave / holiday"
    };

    addDoctorLeave(leaveRecord);
    setLeaveRecords(readDoctorLeaves());
  }

  if (!session) {
    return (
      <div className="page-shell">
        <main className="panel portal-loading">
          <h3>Checking doctor session...</h3>
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
              <p>{linkedDoctor?.specialty} dashboard</p>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="soft-pill">{linkedDoctor?.room}</span>
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

        <section className="portal-dashboard-grid">
          <article className="metric-card">
            <span>Patient history</span>
            <strong>{assignedHistory.length}</strong>
            <p>Recent records linked to this doctor profile</p>
          </article>
          <article className="metric-card">
            <span>Total waiting patients</span>
            <strong>{waitingPatients.length}</strong>
            <p>Patients still pending for this doctor today</p>
          </article>
          <article className="metric-card">
            <span>Today's completed patients</span>
            <strong>{completedToday.length}</strong>
            <p>Completed consultations for the current date</p>
          </article>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Appointment calendar</h3>
              <p>Track appointments and mark leave days for this doctor.</p>
            </div>
            <div className="split-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  setCalendarMonth(
                    (current) =>
                      new Date(current.getFullYear(), current.getMonth() - 1, 1)
                  )
                }
              >
                Previous
              </button>
              <span className="soft-pill">
                {calendarMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric"
                })}
              </span>
              <button
                className="secondary-button"
                onClick={() =>
                  setCalendarMonth(
                    (current) =>
                      new Date(current.getFullYear(), current.getMonth() + 1, 1)
                  )
                }
              >
                Next
              </button>
            </div>
          </div>
          <div className="content-grid">
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gap: 8,
                  marginBottom: 8
                }}
              >
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <span
                    key={day}
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      textAlign: "center",
                      textTransform: "uppercase"
                    }}
                  >
                    {day}
                  </span>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gap: 8
                }}
              >
                {calendarDays.map((date, index) => {
                  const isToday = date ? datesMatchDisplay(date, new Date().toLocaleDateString("en-GB")) : false;
                  const isSelected = date
                    ? datesMatchDisplay(date, selectedCalendarDate)
                    : false;
                  const dateAppointments = date
                    ? doctorAppointments.filter((appointment) =>
                        datesMatchDisplay(date, appointment.date)
                      )
                    : [];
                  const leave = date
                    ? linkedDoctorLeaves.find((item) =>
                        datesMatchDisplay(date, item.date)
                      )
                    : null;

                  return (
                    <button
                      key={date ? formatInputDate(date) : `blank-${index}`}
                      className={date ? "summary-box" : ""}
                      disabled={!date}
                      onClick={() => date && setSelectedCalendarDate(date)}
                      style={{
                        minHeight: 86,
                        padding: 10,
                        borderRadius: 14,
                        border: isSelected
                          ? "1px solid var(--brand)"
                          : "1px solid var(--border)",
                        background: leave
                          ? "rgba(196, 77, 59, 0.14)"
                          : isToday
                            ? "var(--brand-soft)"
                            : date
                              ? "var(--panel-soft)"
                              : "transparent",
                        color: "var(--text)",
                        textAlign: "left",
                        boxShadow: "none",
                        cursor: date ? "pointer" : "default"
                      }}
                    >
                      {date ? (
                        <>
                          <strong>{date.getDate()}</strong>
                          {dateAppointments.length ? (
                            <p>{dateAppointments.length} appointments</p>
                          ) : null}
                          {leave ? (
                            <span className="status-chip" style={{ marginTop: 8 }}>
                              Leave
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
            <aside className="panel" style={{ boxShadow: "none" }}>
              <div className="panel-head align-start">
                <div>
                  <h3>{formatDisplayDate(selectedCalendarDate)}</h3>
                  <p>Appointments and leave status for selected day.</p>
                </div>
              </div>
              <div className="billing-list single-column">
                {selectedDateAppointments.map((appointment) => (
                  <article key={appointment.id} className="list-card">
                    <div>
                      <strong>{appointment.patient}</strong>
                      <p>
                        {appointment.time} | {appointment.type}
                      </p>
                    </div>
                    <span className="status-chip">{appointment.status}</span>
                  </article>
                ))}
                {!selectedDateAppointments.length ? (
                  <div className="empty-card">
                    <p>No appointments for this date.</p>
                  </div>
                ) : null}
              </div>
              <button
                className="primary-button wide"
                style={{ marginTop: 16 }}
                onClick={markSelectedDateAsLeave}
              >
                Mark as Leave / Holiday
              </button>
            </aside>
          </div>
        </section>

        <section className="content-grid">
          <article className="panel">
            <div className="panel-head">
              <div>
                <h3>Patient history</h3>
                <p>Recent consultations and outcomes for this doctor.</p>
              </div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Summary</th>
                    <th>Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedHistory.map((item) => (
                    <tr key={item.id}>
                      <td>{item.patient}</td>
                      <td>{item.date}</td>
                      <td>{item.summary}</td>
                      <td>{item.outcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <div>
                <h3>Waiting patients</h3>
                <p>Front-desk queue items assigned to this doctor.</p>
              </div>
            </div>
            <div className="billing-list single-column">
              {waitingPatients.map((item) => (
                <article key={item.id} className="list-card">
                  <div>
                    <strong>
                      {item.token} - {item.patient}
                    </strong>
                    <p>{item.visitType}</p>
                  </div>
                  <span className="status-chip waiting">{item.status}</span>
                </article>
              ))}
              {!waitingPatients.length ? (
                <div className="empty-card">
                  <p>No waiting patients for this doctor right now.</p>
                </div>
              ) : null}
            </div>
          </article>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Linked patient records</h3>
              <p>Current patient list attached to this doctor profile.</p>
            </div>
          </div>
          <div className="card-grid">
            {patientRecords.map((patient) => (
              <article key={patient.id} className="patient-card">
                <div className="patient-card-top">
                  <div>
                    <strong>{patient.name}</strong>
                    <p>
                      {patient.patientId} | {patient.age} yrs
                    </p>
                  </div>
                  <span
                    className={`status-chip ${patient.status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {patient.status}
                  </span>
                </div>
                <p>{patient.visitReason}</p>
                <div className="meta-row">
                  <span>{patient.lastVisit}</span>
                  <span>{patient.insurance}</span>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => setSelectedPatientForHistory(patient)}
                >
                  View History
                </button>
              </article>
            ))}
          </div>
        </section>

        {selectedPatientForHistory ? (
          <section
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 20,
              display: "grid",
              placeItems: "center",
              padding: 20,
              background: "rgba(22, 48, 66, 0.38)",
              backdropFilter: "blur(8px)"
            }}
          >
            <article
              className="panel"
              style={{
                width: "min(920px, 100%)",
                maxHeight: "86vh",
                overflow: "auto"
              }}
            >
              <div className="panel-head">
                <div>
                  <h3>{selectedPatientForHistory.name} medical reports</h3>
                  <p>
                    {selectedPatientForHistory.patientId} |{" "}
                    {selectedPatientForHistory.age} yrs | Last visit{" "}
                    {selectedPatientForHistory.lastVisit}
                  </p>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => setSelectedPatientForHistory(null)}
                >
                  Close
                </button>
              </div>
              <div className="view-stack">
                {[...(reportsByPatientId[selectedPatientForHistory.id] ?? [])]
                  .sort((first, second) => second.date.localeCompare(first.date))
                  .map((report) => (
                    <article key={report.id} className="summary-box">
                      <div className="panel-head align-start">
                        <div>
                          <span>{report.date}</span>
                          <h3 style={{ margin: "8px 0 0" }}>{report.diagnosis}</h3>
                        </div>
                      </div>
                      <div className="content-grid">
                        <div className="summary-box">
                          <span>Vitals</span>
                          <p>
                            BP {report.vitals.bp} | Pulse {report.vitals.pulse} | Temp{" "}
                            {report.vitals.temperature}
                          </p>
                        </div>
                        <div className="summary-box">
                          <span>Prescription</span>
                          <ul className="detail-list">
                            {report.prescription.map((medicine) => (
                              <li key={medicine}>{medicine}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="summary-box">
                        <span>Doctor notes</span>
                        <p>{report.doctorNotes}</p>
                      </div>
                    </article>
                  ))}
                {!reportsByPatientId[selectedPatientForHistory.id]?.length ? (
                  <div className="empty-card">
                    <p>No historical reports saved for this patient yet.</p>
                  </div>
                ) : null}
              </div>
            </article>
          </section>
        ) : null}
      </main>
    </div>
  );
}
