"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { demoCredentials, doctors } from "@/lib/dummy-data";
import {
  readPortalSession,
  readStoredUsers,
  roleDashboardPath,
  writePortalSession,
  writeStoredUsers,
  type PortalRole
} from "@/lib/portal-auth";

type AuthMode = "login" | "signup";
type AuthRole = PortalRole;

const roleCopy: Record<
  AuthRole,
  {
    title: string;
    description: string;
    points: string[];
  }
> = {
  admin: {
    title: "Admin access",
    description: "Built for full clinic operations and the complete system overview.",
    points: [
      "Full patient data and records",
      "Doctor list, appointments, reports, and billing",
      "One place to manage the entire MediDesk system"
    ]
  },
  doctor: {
    title: "Doctor workspace",
    description: "Doctors create an account first, then access their focused dashboard.",
    points: [
      "Patient history for the linked doctor profile",
      "Waiting patients at a glance",
      "Today completed patients count"
    ]
  },
  patient: {
    title: "Patient portal",
    description: "Patients can sign up, log in, and use the assistant for quick help.",
    points: [
      "Book appointments from the portal",
      "See which doctor is currently available",
      "View only their own reports"
    ]
  }
};

export function MediDeskPortalHome() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<AuthRole>("admin");
  const [mode, setMode] = useState<AuthMode>("login");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: demoCredentials.email,
    password: demoCredentials.password,
    phone: "",
    linkedDoctorId: doctors[0]?.id ?? ""
  });

  useEffect(() => {
    const currentSession = readPortalSession();
    if (currentSession) {
      router.replace(roleDashboardPath(currentSession.role));
    }
  }, [router]);

  useEffect(() => {
    setError("");
    setMessage("");

    if (selectedRole === "admin") {
      setMode("login");
      setForm((current) => ({
        ...current,
        email: demoCredentials.email,
        password: demoCredentials.password
      }));
    } else {
      setForm((current) => ({
        ...current,
        email: "",
        password: "",
        name: "",
        phone: "",
        linkedDoctorId: doctors[0]?.id ?? ""
      }));
    }
  }, [selectedRole]);

  const roleDetails = useMemo(() => roleCopy[selectedRole], [selectedRole]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (selectedRole === "admin") {
      if (
        form.email.trim() !== demoCredentials.email ||
        form.password !== demoCredentials.password
      ) {
        setError("Admin login uses the built-in demo credential shown on the page.");
        return;
      }

      writePortalSession({
        name: "MediDesk Admin",
        email: demoCredentials.email,
        role: "admin"
      });
      router.push(roleDashboardPath("admin"));
      return;
    }

    const users = readStoredUsers();

    if (mode === "signup") {
      if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
        setError("Please complete the required signup details.");
        return;
      }

      if (users.some((user) => user.email.toLowerCase() === form.email.trim().toLowerCase())) {
        setError("This email is already registered. Please log in instead.");
        return;
      }

      writeStoredUsers([
        ...users,
        {
          id: crypto.randomUUID(),
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: selectedRole,
          linkedDoctorId: selectedRole === "doctor" ? form.linkedDoctorId : undefined,
          phone: selectedRole === "patient" ? form.phone.trim() : undefined
        }
      ]);

      setMode("login");
      setMessage(
        `${roleDetails.title} account created. Please log in with the same email and password.`
      );
      return;
    }

    const matchedUser = users.find(
      (user) =>
        user.role === selectedRole &&
        user.email.toLowerCase() === form.email.trim().toLowerCase() &&
        user.password === form.password
    );

    if (!matchedUser) {
      setError("No matching account found for this role. Please sign up first.");
      return;
    }

    writePortalSession({
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      linkedDoctorId: matchedUser.linkedDoctorId,
      phone: matchedUser.phone
    });
    router.push(roleDashboardPath(matchedUser.role));
  }

  return (
    <div className="page-shell">
      <main className="portal-shell">
        <section className="portal-hero panel">
          <div className="portal-copy">
            <span className="eyebrow">MediDesk portal</span>
            <div className="portal-brand">
              <div className="brand-mark">MD</div>
              <div>
                <h1>MediDesk</h1>
                <p>
                  A unified medical web application for clinic admins, doctors, and
                  patients.
                </p>
              </div>
            </div>
            <p className="portal-lead">
              Log in or sign up with the role-specific flow below. The design, spacing,
              colors, and interaction language stay aligned with the current MediDesk app.
            </p>
            <div className="portal-feature-grid">
              <article className="metric-card">
                <span>Admin</span>
                <strong>System overview</strong>
                <p>Manage records, doctors, appointments, reports, billing, and operations.</p>
              </article>
              <article className="metric-card">
                <span>Doctor</span>
                <strong>Focused dashboard</strong>
                <p>Track waiting patients, recent history, and completed consultations.</p>
              </article>
              <article className="metric-card">
                <span>Patient</span>
                <strong>Self-service portal</strong>
                <p>Book visits, check available doctors, and review personal reports.</p>
              </article>
            </div>
          </div>
          <div className="portal-preview image-only-preview">
            <img
              className="portal-card-photo"
              src="/admin-login-upper.jpg"
              alt="Doctor using a digital tablet in a clinic"
            />
            <img
              className="portal-card-photo"
              src="/admin-access-lower-clinic.png"
              alt="Doctors reviewing a medical scan on a digital tablet"
            />
          </div>
        </section>

        <section className="portal-auth-grid">
          <aside className="panel role-selector">
            <div className="panel-head align-start compact-head">
              <div>
                <h3>Choose your role</h3>
                <p>Each role gets its own authentication flow and dashboard.</p>
              </div>
            </div>
            <div className="role-button-grid">
              <button
                className={selectedRole === "admin" ? "active" : ""}
                onClick={() => setSelectedRole("admin")}
              >
                Admin
              </button>
              <button
                className={selectedRole === "doctor" ? "active" : ""}
                onClick={() => setSelectedRole("doctor")}
              >
                Doctor
              </button>
              <button
                className={selectedRole === "patient" ? "active" : ""}
                onClick={() => setSelectedRole("patient")}
              >
                Patient
              </button>
            </div>
          </aside>

          <section className="panel auth-panel">
            <div className="panel-head">
              <div>
                <h3>
                  {selectedRole === "admin"
                    ? "Admin login"
                    : `${mode === "signup" ? "Sign up" : "Log in"} as ${selectedRole}`}
                </h3>
                <p>
                  {selectedRole === "admin"
                    ? "Admin is already registered and can log in directly."
                    : mode === "signup"
                      ? `Create a ${selectedRole} account first.`
                      : `Use your ${selectedRole} account credentials to continue.`}
                </p>
              </div>
              {selectedRole !== "admin" ? (
                <div className="auth-mode-switch">
                  <button
                    className={mode === "login" ? "active" : ""}
                    onClick={() => setMode("login")}
                  >
                    Login
                  </button>
                  <button
                    className={mode === "signup" ? "active" : ""}
                    onClick={() => setMode("signup")}
                  >
                    Sign up
                  </button>
                </div>
              ) : null}
            </div>

            <form className="form-stack" onSubmit={handleSubmit}>
              {selectedRole !== "admin" && mode === "signup" ? (
                <label className="field">
                  <span>Full name</span>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Enter your full name"
                  />
                </label>
              ) : null}

              <label className="field">
                <span>Email</span>
                <input
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="name@clinic.com"
                />
              </label>

              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="Enter password"
                />
              </label>

              {selectedRole === "doctor" && mode === "signup" ? (
                <label className="field">
                  <span>Link doctor profile</span>
                  <select
                    value={form.linkedDoctorId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        linkedDoctorId: event.target.value
                      }))
                    }
                  >
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {selectedRole === "patient" && mode === "signup" ? (
                <label className="field">
                  <span>Phone</span>
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    placeholder="03xx-xxxxxxx"
                  />
                </label>
              ) : null}

              {error ? <p className="portal-error">{error}</p> : null}
              {message ? <p className="portal-message">{message}</p> : null}

              <button type="submit" className="primary-button wide">
                {selectedRole === "admin"
                  ? "Login as admin"
                  : mode === "signup"
                    ? `Create ${selectedRole} account`
                    : `Login as ${selectedRole}`}
              </button>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}
