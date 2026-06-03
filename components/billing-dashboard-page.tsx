"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  doctors,
  initialAppointments,
  initialInvoices,
  initialPatients,
  type Appointment,
  type PatientRecord
} from "@/lib/dummy-data";

type BillingInvoiceStatus = "Paid" | "Pending" | "Partial" | "Overdue";

type BillingInvoice = {
  id: string;
  patientId: string;
  patient: string;
  doctorId: string;
  date: string;
  services: string;
  amount: number;
  method: string;
  status: BillingInvoiceStatus;
};

type ServiceRow = {
  id: string;
  name: string;
  price: string;
};

const extraPatients: PatientRecord[] = [
  {
    id: "p5",
    patientId: "MD-1005",
    name: "Zainab Siddiqui",
    age: 36,
    gender: "Female",
    phone: "0302-7788990",
    doctorId: "dr-ayesha",
    visitReason: "Migraine and sleep review",
    insurance: "Cash",
    lastVisit: "22/05/2026",
    status: "Waiting",
    balance: "PKR 750"
  },
  {
    id: "p6",
    patientId: "MD-1006",
    name: "Omar Farooq",
    age: 54,
    gender: "Male",
    phone: "0345-1122446",
    doctorId: "dr-khalid",
    visitReason: "Diabetes follow-up and BP check",
    insurance: "Jubilee Health",
    lastVisit: "22/05/2026",
    status: "Follow-up",
    balance: "PKR 2,500"
  },
  {
    id: "p7",
    patientId: "MD-1007",
    name: "Noor ul Ain",
    age: 19,
    gender: "Female",
    phone: "0320-4567891",
    doctorId: "dr-salman",
    visitReason: "Urgent stomach pain",
    insurance: "Cash",
    lastVisit: "22/05/2026",
    status: "Waiting",
    balance: "PKR 3,200"
  },
  {
    id: "p8",
    patientId: "MD-1008",
    name: "Hassan Rafiq",
    age: 6,
    gender: "Male",
    phone: "0336-9012345",
    doctorId: "dr-sara",
    visitReason: "Pediatric fever review",
    insurance: "Sehat Sahulat",
    lastVisit: "22/05/2026",
    status: "Completed",
    balance: "PKR 0"
  }
];

const extraAppointments: Appointment[] = [
  {
    id: "a5",
    patientId: "p5",
    patient: "Zainab Siddiqui",
    doctorId: "dr-ayesha",
    date: "22/05/2026",
    time: "12:00 PM",
    type: "Family Medicine",
    status: "Confirmed",
    token: "T-005"
  },
  {
    id: "a6",
    patientId: "p6",
    patient: "Omar Farooq",
    doctorId: "dr-khalid",
    date: "22/05/2026",
    time: "12:30 PM",
    type: "Diabetes Follow-up",
    status: "Checked In",
    token: "T-006"
  },
  {
    id: "a7",
    patientId: "p7",
    patient: "Noor ul Ain",
    doctorId: "dr-salman",
    date: "22/05/2026",
    time: "01:10 PM",
    type: "Urgent Consultation",
    status: "Waiting",
    token: "T-007"
  }
];

const monthlyRevenue = [
  6200, 7800, 5200, 9300, 8100, 10400, 6900, 7200, 8600, 9100,
  11800, 12400, 9800, 7600, 8300, 9700, 13400, 14200, 12100, 10700,
  8900, 9500, 11200, 12800, 14600, 13200, 11900, 15300, 16100, 17400
];

function amountToNumber(amount: string) {
  return Number(amount.replace(/[^\d]/g, "")) || 0;
}

function formatCurrency(amount: number) {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

function nextInvoiceId(items: BillingInvoice[]) {
  const maxNumber = items.reduce((highest, item) => {
    const current = Number(item.id.replace(/[^\d]/g, ""));
    return Number.isNaN(current) ? highest : Math.max(highest, current);
  }, 1000);

  return `INV-${maxNumber + 1}`;
}

function statusClass(status: string) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

export function BillingDashboardPage() {
  const patients = useMemo(() => [...initialPatients, ...extraPatients], []);
  const appointments = useMemo(
    () => [...initialAppointments, ...extraAppointments],
    []
  );
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id ?? "");
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [discount, setDiscount] = useState("0");
  const [quickActionMessage, setQuickActionMessage] = useState("");
  const [services, setServices] = useState<ServiceRow[]>([
    { id: "s1", name: "Consultation fee", price: "2000" },
    { id: "s2", name: "Vitals and nursing", price: "500" }
  ]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>(() => [
    ...initialInvoices.map((invoice, index) => ({
      id: invoice.id,
      patientId: invoice.patientId,
      patient: invoice.patient,
      doctorId: invoice.doctorId,
      date: invoice.due,
      services: invoice.service,
      amount: amountToNumber(invoice.amount),
      method: invoice.method,
      status: invoice.status as BillingInvoiceStatus
    })),
    {
      id: "INV-1005",
      patientId: "p5",
      patient: "Zainab Siddiqui",
      doctorId: "dr-ayesha",
      date: "22/05/2026",
      services: "Consultation + migraine review",
      amount: 2750,
      method: "EasyPaisa",
      status: "Partial"
    },
    {
      id: "INV-1006",
      patientId: "p6",
      patient: "Omar Farooq",
      doctorId: "dr-khalid",
      date: "22/05/2026",
      services: "Diabetes follow-up + BP monitoring",
      amount: 3500,
      method: "Card",
      status: "Pending"
    },
    {
      id: "INV-1007",
      patientId: "p7",
      patient: "Noor ul Ain",
      doctorId: "dr-salman",
      date: "21/05/2026",
      services: "Urgent consultation + injection",
      amount: 4200,
      method: "Cash",
      status: "Overdue"
    },
    {
      id: "INV-1008",
      patientId: "p8",
      patient: "Hassan Rafiq",
      doctorId: "dr-sara",
      date: "22/05/2026",
      services: "Pediatric consultation",
      amount: 1800,
      method: "JazzCash",
      status: "Paid"
    }
  ]);

  const doctorMap = useMemo(
    () => Object.fromEntries(doctors.map((doctor) => [doctor.id, doctor])),
    []
  );
  const patientMap = useMemo(
    () => Object.fromEntries(patients.map((patient) => [patient.id, patient])),
    [patients]
  );
  const filteredPatients = useMemo(() => {
    const query = patientQuery.trim().toLowerCase();
    if (!query) {
      return patients;
    }

    return patients.filter((patient) =>
      [patient.name, patient.patientId, patient.phone].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [patientQuery, patients]);
  const subtotal = services.reduce(
    (sum, service) => sum + (Number(service.price) || 0),
    0
  );
  const total = Math.max(0, subtotal - (Number(discount) || 0));
  const totalRevenueToday = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingPayments = invoices
    .filter((invoice) => invoice.status === "Pending" || invoice.status === "Partial")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const thisMonthTotal = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdueInvoices = invoices.filter((invoice) => invoice.status === "Overdue");
  const maxRevenue = Math.max(...monthlyRevenue);

  function addServiceRow() {
    setServices((current) => [
      ...current,
      { id: crypto.randomUUID(), name: "", price: "" }
    ]);
  }

  function updateServiceRow(id: string, field: "name" | "price", value: string) {
    setServices((current) =>
      current.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  }

  function removeServiceRow(id: string) {
    setServices((current) =>
      current.length === 1 ? current : current.filter((service) => service.id !== id)
    );
  }

  function saveInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const patient = patientMap[selectedPatientId];
    if (!patient) {
      return;
    }

    setInvoices((current) => [
      {
        id: nextInvoiceId(current),
        patientId: patient.id,
        patient: patient.name,
        doctorId: selectedDoctorId,
        date: "22/05/2026",
        services: services
          .map((service) => service.name.trim())
          .filter(Boolean)
          .join(" + ") || "Consultation fee",
        amount: total,
        method: paymentMethod,
        status: paymentMethod === "Cash" ? "Paid" : "Pending"
      },
      ...current
    ]);
    setShowInvoiceForm(false);
    setQuickActionMessage("Invoice saved and added to the billing table.");
  }

  return (
    <div className="view-stack" style={{ maxWidth: "100%", minWidth: 0 }}>
      <div className="metric-grid">
        <article className="metric-card">
          <span>Total revenue today</span>
          <strong>{formatCurrency(totalRevenueToday)}</strong>
          <p>Paid invoices collected at reception</p>
        </article>
        <article className="metric-card">
          <span>Pending payments</span>
          <strong>{formatCurrency(pendingPayments)}</strong>
          <p>Pending and partial invoices</p>
        </article>
        <article className="metric-card">
          <span>This month total</span>
          <strong>{formatCurrency(thisMonthTotal)}</strong>
          <p>All billing records in sample data</p>
        </article>
        <article className="metric-card">
          <span>Overdue invoices</span>
          <strong>{overdueInvoices.length}</strong>
          <p>{formatCurrency(overdueInvoices.reduce((sum, invoice) => sum + invoice.amount, 0))} overdue</p>
        </article>
      </div>

      <section className="panel" style={{ maxWidth: "100%", minWidth: 0 }}>
        <div className="panel-head">
          <div>
            <h3>Invoices</h3>
            <p>Full billing desk with payment actions and print-ready entries.</p>
          </div>
          <button
            className="primary-button"
            onClick={() => setShowInvoiceForm((current) => !current)}
          >
            Create New Invoice
          </button>
        </div>

        {showInvoiceForm ? (
          <form className="form-stack" onSubmit={saveInvoice}>
            <div className="two-field">
              <label className="field">
                <span>Patient name search</span>
                <input
                  value={patientQuery}
                  onChange={(event) => setPatientQuery(event.target.value)}
                  placeholder="Search patient name, ID, or phone"
                />
              </label>
              <label className="field">
                <span>Patient</span>
                <select
                  value={selectedPatientId}
                  onChange={(event) => setSelectedPatientId(event.target.value)}
                >
                  {filteredPatients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="two-field">
              <label className="field">
                <span>Doctor</span>
                <select
                  value={selectedDoctorId}
                  onChange={(event) => setSelectedDoctorId(event.target.value)}
                >
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Payment method</span>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                >
                  <option>Cash</option>
                  <option>JazzCash</option>
                  <option>EasyPaisa</option>
                  <option>Card</option>
                </select>
              </label>
            </div>
            {services.map((service) => (
              <div
                key={service.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(120px, 180px) auto",
                  gap: 12,
                  alignItems: "end"
                }}
              >
                <label className="field">
                  <span>Service name</span>
                  <input
                    value={service.name}
                    onChange={(event) =>
                      updateServiceRow(service.id, "name", event.target.value)
                    }
                    placeholder="Consultation, lab, procedure..."
                  />
                </label>
                <label className="field">
                  <span>Price</span>
                  <input
                    value={service.price}
                    onChange={(event) =>
                      updateServiceRow(service.id, "price", event.target.value)
                    }
                    placeholder="2000"
                  />
                </label>
                <button
                  type="button"
                  className="table-action"
                  onClick={() => removeServiceRow(service.id)}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="split-actions">
              <button type="button" className="secondary-button" onClick={addServiceRow}>
                Add Service
              </button>
              <label className="field">
                <span>Discount</span>
                <input
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                  placeholder="0"
                />
              </label>
              <div className="summary-box">
                <span>Total auto-calculation</span>
                <p>{formatCurrency(total)}</p>
              </div>
              <button type="submit" className="primary-button">
                Save
              </button>
              <button type="button" className="secondary-button">
                Print
              </button>
            </div>
          </form>
        ) : null}

        <div className="table-wrap" style={{ maxWidth: "100%" }}>
          <table className="data-table" style={{ minWidth: 1080 }}>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Patient Name</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Services</th>
                <th>Amount (PKR)</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.id}</td>
                  <td>{invoice.patient}</td>
                  <td>{doctorMap[invoice.doctorId]?.name}</td>
                  <td>{invoice.date}</td>
                  <td>{invoice.services}</td>
                  <td>{invoice.amount.toLocaleString("en-PK")}</td>
                  <td>{invoice.method}</td>
                  <td>
                    <span className={`status-chip ${statusClass(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        minWidth: 220
                      }}
                    >
                      <button className="table-action">View</button>
                      <button className="table-action">Print</button>
                      <button
                        className="table-action"
                        onClick={() =>
                          setInvoices((current) =>
                            current.map((entry) =>
                              entry.id === invoice.id
                                ? { ...entry, status: "Paid" }
                                : entry
                            )
                          )
                        }
                      >
                        Mark Paid
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="content-grid" style={{ maxWidth: "100%", minWidth: 0 }}>
        <section className="panel" style={{ minWidth: 0 }}>
          <div className="panel-head">
            <div>
              <h3>Appointments billing list</h3>
              <p>Today&apos;s appointments with quick fee status.</p>
            </div>
          </div>
          <div className="billing-list">
            {appointments.map((appointment) => {
              const invoice = invoices.find(
                (entry) => entry.patientId === appointment.patientId
              );

              return (
                <article key={appointment.id} className="list-card">
                  <div>
                    <strong>{appointment.token} - {appointment.patient}</strong>
                    <p>
                      {doctorMap[appointment.doctorId]?.name} | {appointment.time}
                    </p>
                  </div>
                  <div className="list-card-end">
                    <span>{invoice ? formatCurrency(invoice.amount) : "PKR 0"}</span>
                    <span className={`status-chip ${statusClass(invoice?.status ?? "Pending")}`}>
                      {invoice?.status ?? "Pending"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel" style={{ minWidth: 0 }}>
          <div className="panel-head">
            <div>
              <h3>Monthly revenue chart</h3>
              <p>Last 30 days revenue in PKR.</p>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(30, minmax(8px, 1fr))",
              alignItems: "end",
              gap: 6,
              minHeight: 240,
              padding: 16,
              borderRadius: 16,
              background: "var(--panel-soft)",
              border: "1px solid var(--border)"
            }}
          >
            {monthlyRevenue.map((amount, index) => (
              <div
                key={`${amount}-${index}`}
                title={`Day ${index + 1}: ${formatCurrency(amount)}`}
                style={{
                  minHeight: 20,
                  height: `${Math.max(14, (amount / maxRevenue) * 100)}%`,
                  borderRadius: "10px 10px 4px 4px",
                  background: "linear-gradient(180deg, var(--brand), #53abc7)"
                }}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="panel" style={{ maxWidth: "100%", minWidth: 0 }}>
        <div className="panel-head">
          <div>
            <h3>Quick actions</h3>
            <p>Common billing tasks for the reception desk.</p>
          </div>
        </div>
        <div className="split-actions" style={{ flexWrap: "wrap" }}>
          <button className="primary-button" onClick={() => setShowInvoiceForm(true)}>
            New Invoice
          </button>
          <button
            className="secondary-button"
            onClick={() => setQuickActionMessage("Payment recording panel is ready.")}
          >
            Record Payment
          </button>
          <button
            className="secondary-button"
            onClick={() => setQuickActionMessage("PDF export queued for billing records.")}
          >
            Export PDF
          </button>
          <button
            className="secondary-button"
            onClick={() => setQuickActionMessage("Excel export queued for billing records.")}
          >
            Export Excel
          </button>
        </div>
        {quickActionMessage ? (
          <p style={{ margin: "14px 0 0", color: "var(--text-soft)" }}>
            {quickActionMessage}
          </p>
        ) : null}
      </section>
    </div>
  );
}
