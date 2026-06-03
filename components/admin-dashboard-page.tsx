"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MediDeskApp } from "@/components/medidesk-app";
import { doctors } from "@/lib/dummy-data";
import {
  readDoctorLeaves,
  type DoctorLeaveRecord
} from "@/lib/portal-clinic-store";
import { clearPortalSession, readPortalSession } from "@/lib/portal-auth";

export function AdminDashboardPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id ?? "");
  const [leaveRecords, setLeaveRecords] = useState<DoctorLeaveRecord[]>([]);

  useEffect(() => {
    const session = readPortalSession();
    if (!session || session.role !== "admin") {
      router.replace("/");
      return;
    }

    setAllowed(true);
    setLeaveRecords(readDoctorLeaves());
  }, [router]);

  const selectedDoctor =
    doctors.find((doctor) => doctor.id === selectedDoctorId) ?? doctors[0];
  const selectedDoctorLeaves = leaveRecords.filter(
    (leave) => leave.doctorId === selectedDoctor?.id
  );

  if (!allowed) {
    return (
      <div className="page-shell">
        <main className="panel portal-loading">
          <h3>Checking admin session...</h3>
        </main>
      </div>
    );
  }

  return (
    <div className="portal-dashboard-wrap">
      <div className="portal-return-strip">
        <span className="soft-pill">Admin dashboard</span>
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
      <section
        className="panel"
        style={{
          width: "min(calc(100% - 56px), 1320px)",
          margin: "0 auto"
        }}
      >
        <div className="panel-head">
          <div>
            <h3>Doctor leave visibility</h3>
            <p>Admin view of leave dates marked from doctor calendars.</p>
          </div>
          <label className="field" style={{ minWidth: 260 }}>
            <span>Doctor details</span>
            <select
              value={selectedDoctorId}
              onChange={(event) => {
                setSelectedDoctorId(event.target.value);
                setLeaveRecords(readDoctorLeaves());
              }}
            >
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="billing-list single-column">
          {selectedDoctorLeaves.map((leave) => (
            <article key={`${leave.doctorId}-${leave.date}`} className="list-card">
              <div>
                <strong>{selectedDoctor?.name}</strong>
                <p>{leave.reason}</p>
              </div>
              <span className="status-chip" style={{ background: "rgba(196, 77, 59, 0.14)", color: "var(--danger)" }}>
                {leave.date}
              </span>
            </article>
          ))}
          {!selectedDoctorLeaves.length ? (
            <div className="empty-card">
              <p>No leave dates marked for {selectedDoctor?.name}.</p>
            </div>
          ) : null}
        </div>
      </section>
      <MediDeskApp />
    </div>
  );
}
