"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BillingDashboardPage } from "@/components/billing-dashboard-page";
import {
  demoCredentials,
  doctors,
  initialAppointments,
  initialAssistantMessages,
  initialInvoices,
  initialPatients,
  queue,
  type Appointment,
  type AssistantTask,
  type ChatMessage,
  type Invoice,
  type PatientRecord,
  type QueueItem
} from "@/lib/dummy-data";

type View = "overview" | "patients" | "appointments" | "billing" | "assistant";
type TimePreference = "First available" | "Morning" | "Afternoon" | "Evening";
type AiVisitPlan = {
  recommendedDoctorId: string;
  urgency: "Routine" | "Priority" | "Urgent";
  visitType: string;
  suggestedDate: string;
  suggestedTime: string;
  suggestedTests: string[];
  instructions: string[];
  reasons: string[];
  caution: string;
  bookingPrompt: string;
};

const DEMO_PATIENT_NAMES = [
  "Areeba Khan",
  "Usman Tariq",
  "Hina Aslam",
  "Bilal Qureshi",
  "Mahnoor Ahmed"
];

const TIME_PREFERENCE_TO_SLOT: Record<TimePreference, string> = {
  "First available": "11:30 AM",
  Morning: "09:30 AM",
  Afternoon: "02:00 PM",
  Evening: "05:30 PM"
};

function clonePatients() {
  return initialPatients.map((patient) => ({ ...patient }));
}

function cloneAppointments() {
  return initialAppointments.map((appointment) => ({ ...appointment }));
}

function cloneInvoices() {
  return initialInvoices.map((invoice) => ({ ...invoice }));
}

function cloneQueue() {
  return queue.map((item) => ({
    ...item,
    details: [...item.details]
  }));
}

function cloneMessages() {
  return initialAssistantMessages.map((message) => ({
    ...message,
    appointmentCard: message.appointmentCard
      ? { ...message.appointmentCard }
      : undefined
  }));
}

function amountToNumber(amount: string) {
  return Number(amount.replace(/[^\d]/g, "")) || 0;
}

function formatCurrency(amount: number) {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

function formatDisplayDate(value: string) {
  if (!value) {
    return "";
  }

  if (value.includes("/")) {
    return value;
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nextTokenFrom(items: QueueItem[] | Appointment[]) {
  const maxNumber = items.reduce((highest, item) => {
    const current = Number(item.token.replace(/[^\d]/g, ""));
    return Number.isNaN(current) ? highest : Math.max(highest, current);
  }, 0);

  return `T-${String(maxNumber + 1).padStart(3, "0")}`;
}

function nextInvoiceId(items: Invoice[]) {
  const maxNumber = items.reduce((highest, item) => {
    const current = Number(item.id.replace(/[^\d]/g, ""));
    return Number.isNaN(current) ? highest : Math.max(highest, current);
  }, 1000);

  return `INV-${maxNumber + 1}`;
}

function nextPatientCode(items: PatientRecord[]) {
  const maxNumber = items.reduce((highest, item) => {
    const current = Number(item.patientId.replace(/[^\d]/g, ""));
    return Number.isNaN(current) ? highest : Math.max(highest, current);
  }, 1000);

  return `MD-${maxNumber + 1}`;
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function uniqueItems(items: string[]) {
  return [...new Set(items)];
}

function buildAiVisitPlan(
  symptoms: string,
  ageValue: string,
  preferredDate: string,
  timePreference: TimePreference
): AiVisitPlan {
  const normalizedSymptoms = symptoms.toLowerCase();
  const age = Number(ageValue) || 0;
  const emergencySymptoms = [
    "chest pain",
    "shortness of breath",
    "breathing",
    "faint",
    "severe pain",
    "bleeding",
    "injury",
    "fracture"
  ];
  const pediatricSymptoms = ["child", "baby", "kid", "vaccination", "pediatric"];
  const familySymptoms = [
    "migraine",
    "allergy",
    "thyroid",
    "follow-up",
    "follow up",
    "rash",
    "stomach",
    "skin"
  ];
  const infectionSymptoms = ["fever", "cough", "cold", "sore throat", "flu"];
  const metabolicSymptoms = ["sugar", "diabetes", "bp", "blood pressure", "dizziness"];
  const urinarySymptoms = ["urine", "urinary", "burning urine"];

  const isEmergency = includesAny(normalizedSymptoms, emergencySymptoms);
  const isPediatric =
    age > 0 && age <= 14
      ? true
      : includesAny(normalizedSymptoms, pediatricSymptoms);
  const isFamilyMedicine = includesAny(normalizedSymptoms, familySymptoms);
  const hasInfectionPattern = includesAny(normalizedSymptoms, infectionSymptoms);
  const hasMetabolicPattern = includesAny(normalizedSymptoms, metabolicSymptoms);

  let recommendedDoctorId = "dr-khalid";
  let urgency: AiVisitPlan["urgency"] = "Routine";
  let visitType = "Consultation";
  const reasons: string[] = [];
  const suggestedTests = ["Basic vitals at reception"];
  const instructions = [
    "Bring old prescriptions, recent reports, and current medicine list.",
    "Arrive 15 minutes early so vitals can be checked before the doctor sees the patient.",
    "Avoid paying for outside tests before the doctor confirms they are actually needed."
  ];

  if (isEmergency) {
    recommendedDoctorId = "dr-salman";
    urgency = "Urgent";
    visitType = "Urgent consultation";
    reasons.push("Symptoms sound high priority for emergency review.");
    suggestedTests.push(
      "Blood pressure and pulse oximetry at reception",
      "ECG only if chest pain or breathing symptoms are present and the doctor approves"
    );
    instructions.push(
      "If symptoms are getting worse right now, move the patient to urgent care instead of waiting."
    );
  } else if (isPediatric) {
    recommendedDoctorId = "dr-sara";
    urgency = "Priority";
    visitType = "Pediatric review";
    reasons.push("Age or symptoms fit a pediatric visit best.");
    suggestedTests.push("Weight and temperature check before rooming the child");
    instructions.push("Bring the child vaccination card or any previous pediatric notes.");
  } else if (isFamilyMedicine) {
    recommendedDoctorId = "dr-ayesha";
    reasons.push("Symptoms match a family medicine style follow-up or general review.");
  } else if (hasInfectionPattern || hasMetabolicPattern) {
    recommendedDoctorId = "dr-khalid";
    reasons.push("A general physician is a good first low-cost doctor match for these symptoms.");
  } else {
    recommendedDoctorId = "dr-ayesha";
    reasons.push("A broad family medicine review is the safest first appointment choice.");
  }

  if (hasInfectionPattern) {
    suggestedTests.push(
      "Temperature check before consultation",
      "CBC only if fever has lasted several days or the doctor requests it"
    );
    instructions.push("Note when the fever, cough, or throat symptoms first started.");
  }

  if (hasMetabolicPattern) {
    suggestedTests.push(
      "Random blood sugar if the clinic already offers it at reception",
      "Blood pressure check before entering the room"
    );
  }

  if (includesAny(normalizedSymptoms, urinarySymptoms)) {
    suggestedTests.push("Urine routine test if the doctor wants confirmation after first review");
  }

  if (includesAny(normalizedSymptoms, ["dizziness", "weakness", "fatigue"])) {
    suggestedTests.push("Pulse and blood pressure check before appointment");
  }

  return {
    recommendedDoctorId,
    urgency,
    visitType,
    suggestedDate: formatDisplayDate(preferredDate),
    suggestedTime: TIME_PREFERENCE_TO_SLOT[timePreference],
    suggestedTests: uniqueItems(suggestedTests),
    instructions: uniqueItems(instructions),
    reasons,
    caution:
      "Administrative suggestion only. The doctor should confirm any tests and the final clinical plan.",
    bookingPrompt: `Book ${visitType.toLowerCase()} with ${recommendedDoctorId} on ${formatDisplayDate(
      preferredDate
    )} at ${TIME_PREFERENCE_TO_SLOT[timePreference]}.`
  };
}

export function MediDeskApp() {
  const [activeView, setActiveView] = useState<View>("overview");
  const [patients, setPatients] = useState<PatientRecord[]>(clonePatients);
  const [appointments, setAppointments] =
    useState<Appointment[]>(cloneAppointments);
  const [invoices, setInvoices] = useState<Invoice[]>(cloneInvoices);
  const [queueItems, setQueueItems] = useState<QueueItem[]>(cloneQueue);
  const [selectedQueueId, setSelectedQueueId] = useState(queue[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatTask, setChatTask] = useState<AssistantTask>("general");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(cloneMessages);
  const [loadingReply, setLoadingReply] = useState(false);
  const [toast, setToast] = useState("");
  const [demoWalkInCount, setDemoWalkInCount] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [patientForm, setPatientForm] = useState({
    name: "",
    age: "",
    gender: "Female",
    phone: "",
    doctorId: doctors[0]?.id ?? "",
    visitReason: "",
    insurance: "Cash"
  });
  const [appointmentForm, setAppointmentForm] = useState({
    patientId: initialPatients[0]?.id ?? "",
    doctorId: doctors[0]?.id ?? "",
    date: formatInputDate(new Date()),
    time: "12:30 PM",
    type: "Follow-up"
  });
  const [invoiceForm, setInvoiceForm] = useState({
    patientId: initialPatients[0]?.id ?? "",
    service: "Consultation fee",
    amount: "2000",
    method: "Cash",
    due: formatInputDate(new Date())
  });
  const [assistantIntake, setAssistantIntake] = useState({
    patientId: "new",
    patientName: "",
    age: "",
    gender: "Female",
    phone: "",
    symptoms: "",
    preferredDate: formatInputDate(new Date()),
    timePreference: "First available" as TimePreference
  });
  const [aiVisitPlan, setAiVisitPlan] = useState<AiVisitPlan | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const doctorMap = useMemo(
    () => Object.fromEntries(doctors.map((doctor) => [doctor.id, doctor])),
    []
  );

  const balanceByPatientId = useMemo(() => {
    return invoices.reduce<Record<string, number>>((totals, invoice) => {
      if (invoice.status === "Paid") {
        return totals;
      }

      totals[invoice.patientId] =
        (totals[invoice.patientId] ?? 0) + amountToNumber(invoice.amount);
      return totals;
    }, {});
  }, [invoices]);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return patients;
    }

    return patients.filter((patient) =>
      [
        patient.name,
        patient.patientId,
        patient.phone,
        patient.visitReason,
        patient.insurance
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [patients, search]);

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return appointments;
    }

    return appointments.filter((appointment) =>
      [
        appointment.patient,
        appointment.type,
        appointment.date,
        appointment.token,
        doctorMap[appointment.doctorId]?.name ?? ""
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [appointments, doctorMap, search]);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return invoices;
    }

    return invoices.filter((invoice) =>
      [
        invoice.id,
        invoice.patient,
        invoice.service,
        invoice.method,
        invoice.status
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [invoices, search]);

  const filteredQueue = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return queueItems;
    }

    return queueItems.filter((item) =>
      [item.patient, item.token, item.visitType, item.status].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [queueItems, search]);

  const selectedQueue =
    queueItems.find((item) => item.id === selectedQueueId) ?? filteredQueue[0];

  const todaysRevenue = useMemo(() => {
    return invoices
      .filter((invoice) => invoice.status === "Paid")
      .reduce((sum, invoice) => sum + amountToNumber(invoice.amount), 0);
  }, [invoices]);

  const pendingRevenue = useMemo(() => {
    return invoices
      .filter((invoice) => invoice.status !== "Paid")
      .reduce((sum, invoice) => sum + amountToNumber(invoice.amount), 0);
  }, [invoices]);

  const waitingCount = queueItems.filter(
    (item) => item.status === "Unread" || item.status === "Waiting"
  ).length;

  const checkedInCount = appointments.filter(
    (appointment) => appointment.status === "Checked In"
  ).length;

  function notify(message: string) {
    setToast(message);
  }

  function resetDemoData() {
    setPatients(clonePatients());
    setAppointments(cloneAppointments());
    setInvoices(cloneInvoices());
    setQueueItems(cloneQueue());
    setChatMessages(cloneMessages());
    setSelectedQueueId(queue[0]?.id ?? "");
    setSearch("");
    setDemoWalkInCount(0);
    setPatientForm({
      name: "",
      age: "",
      gender: "Female",
      phone: "",
      doctorId: doctors[0]?.id ?? "",
      visitReason: "",
      insurance: "Cash"
    });
    setAppointmentForm((current) => ({
      ...current,
      patientId: initialPatients[0]?.id ?? "",
      doctorId: doctors[0]?.id ?? "",
      date: formatInputDate(new Date()),
      time: "12:30 PM",
      type: "Follow-up"
    }));
    setInvoiceForm((current) => ({
      ...current,
      patientId: initialPatients[0]?.id ?? "",
      service: "Consultation fee",
      amount: "2000",
      method: "Cash",
      due: formatInputDate(new Date())
    }));
    setAssistantIntake({
      patientId: "new",
      patientName: "",
      age: "",
      gender: "Female",
      phone: "",
      symptoms: "",
      preferredDate: formatInputDate(new Date()),
      timePreference: "First available"
    });
    setAiVisitPlan(null);
    notify("Demo clinic reset to fresh sample data.");
  }

  function addPatientRecord(patient: PatientRecord, queueItem?: QueueItem) {
    setPatients((current) => [patient, ...current]);
    setAppointmentForm((current) => ({
      ...current,
      patientId: patient.id,
      doctorId: patient.doctorId
    }));
    setInvoiceForm((current) => ({
      ...current,
      patientId: patient.id
    }));

    if (queueItem) {
      setQueueItems((current) => [queueItem, ...current]);
      setSelectedQueueId(queueItem.id);
    }
  }

  function addAppointmentForPatient(
    patient: PatientRecord,
    details: {
      doctorId: string;
      date: string;
      time: string;
      type: string;
      status?: Appointment["status"];
    }
  ) {
    const token = nextTokenFrom(appointments);
    const appointment: Appointment = {
      id: crypto.randomUUID(),
      patientId: patient.id,
      patient: patient.name,
      doctorId: details.doctorId,
      date: formatDisplayDate(details.date),
      time: details.time.trim(),
      type: details.type.trim() || "Consultation",
      status: details.status ?? "Confirmed",
      token
    };

    setAppointments((current) => [appointment, ...current]);
    setPatients((current) =>
      current.map((entry) =>
        entry.id === patient.id
          ? {
              ...entry,
              doctorId: details.doctorId,
              lastVisit: appointment.date
            }
          : entry
      )
    );

    if (appointment.date === formatDisplayDate(formatInputDate(new Date()))) {
      const queueItem: QueueItem = {
        id: crypto.randomUUID(),
        patientId: patient.id,
        token,
        patient: patient.name,
        doctorId: details.doctorId,
        visitType: appointment.type,
        amount: "PKR 2,000",
        time: appointment.time,
        status: "Waiting",
        unread: false,
        summary: "Appointment created from the scheduling panel.",
        details: [
          `Doctor: ${doctorMap[details.doctorId]?.name ?? "Assigned doctor"}`,
          `Date: ${appointment.date}`,
          `Type: ${appointment.type}`
        ],
        insurance: patient.insurance
      };

      setQueueItems((current) => [queueItem, ...current]);
      setSelectedQueueId(queueItem.id);
    }

    return appointment;
  }

  function handleAddPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!patientForm.name.trim() || !patientForm.phone.trim() || !patientForm.visitReason.trim()) {
      notify("Please complete name, phone, and visit reason.");
      return;
    }

    const patientId = crypto.randomUUID();
    const token = nextTokenFrom(queueItems);
    const isEmergency = patientForm.visitReason.toLowerCase().includes("emergency");
    const patient: PatientRecord = {
      id: patientId,
      patientId: nextPatientCode(patients),
      name: patientForm.name.trim(),
      age: Number(patientForm.age) || 0,
      gender: patientForm.gender as PatientRecord["gender"],
      phone: patientForm.phone.trim(),
      doctorId: patientForm.doctorId,
      visitReason: patientForm.visitReason.trim(),
      insurance: patientForm.insurance.trim() || "Cash",
      lastVisit: formatDisplayDate(formatInputDate(new Date())),
      status: "Waiting",
      balance: "PKR 0"
    };

    const queueItem: QueueItem = {
      id: crypto.randomUUID(),
      patientId,
      token,
      patient: patient.name,
      doctorId: patient.doctorId,
      visitType: isEmergency ? "Emergency Visit" : "Walk-in Registration",
      amount: isEmergency ? "PKR 3,000" : "PKR 2,000",
      time: now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      }),
      status: "Unread",
      unread: true,
      summary: "New patient added from the front-desk form. Review and book a slot.",
      details: [
        `Phone: ${patient.phone}`,
        `Reason: ${patient.visitReason}`,
        `Insurance: ${patient.insurance}`
      ],
      insurance: patient.insurance
    };

    addPatientRecord(patient, queueItem);
    setPatientForm({
      name: "",
      age: "",
      gender: "Female",
      phone: "",
      doctorId: patientForm.doctorId,
      visitReason: "",
      insurance: patientForm.insurance
    });
    setActiveView("patients");
    notify(`${patient.name} added to demo patients.`);
  }

  function handleAddAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const patient = patients.find((entry) => entry.id === appointmentForm.patientId);
    if (!patient || !appointmentForm.time.trim()) {
      notify("Select a patient and enter a valid time.");
      return;
    }

    addAppointmentForPatient(patient, {
      doctorId: appointmentForm.doctorId,
      date: appointmentForm.date,
      time: appointmentForm.time,
      type: appointmentForm.type
    });

    setAppointmentForm((current) => ({
      ...current,
      time: "12:30 PM",
      type: "Follow-up"
    }));
    setActiveView("appointments");
    notify(`Appointment booked for ${patient.name}.`);
  }

  function handleGenerateAiPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!assistantIntake.symptoms.trim()) {
      notify("Enter symptoms so the AI planner can recommend a doctor.");
      return;
    }

    const plan = buildAiVisitPlan(
      assistantIntake.symptoms,
      assistantIntake.age,
      assistantIntake.preferredDate,
      assistantIntake.timePreference
    );

    setAiVisitPlan(plan);
    setChatTask(plan.urgency === "Urgent" ? "triage" : "scheduling");
    setChatMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        task: plan.urgency === "Urgent" ? "triage" : "scheduling",
        content: [
          `AI visit planner prepared a ${plan.urgency.toLowerCase()} recommendation.`,
          `Preferred doctor: ${doctorMap[plan.recommendedDoctorId]?.name}.`,
          `Suggested slot: ${plan.suggestedDate} at ${plan.suggestedTime}.`,
          `Pre-visit tests: ${plan.suggestedTests.join(", ")}.`,
          plan.caution
        ].join("\n")
      }
    ]);
    notify("AI visit planner created a recommendation.");
  }

  function handleBookAiAppointment() {
    if (!aiVisitPlan) {
      notify("Create an AI recommendation first.");
      return;
    }

    let patient =
      assistantIntake.patientId !== "new"
        ? patients.find((entry) => entry.id === assistantIntake.patientId)
        : undefined;

    if (!patient) {
      if (!assistantIntake.patientName.trim()) {
        notify("Enter a patient name or choose an existing patient.");
        return;
      }

      const newPatient: PatientRecord = {
        id: crypto.randomUUID(),
        patientId: nextPatientCode(patients),
        name: assistantIntake.patientName.trim(),
        age: Number(assistantIntake.age) || 0,
        gender: assistantIntake.gender as PatientRecord["gender"],
        phone: assistantIntake.phone.trim() || "To confirm",
        doctorId: aiVisitPlan.recommendedDoctorId,
        visitReason: assistantIntake.symptoms.trim(),
        insurance: "To confirm",
        lastVisit: aiVisitPlan.suggestedDate,
        status: "Follow-up",
        balance: "PKR 0"
      };

      addPatientRecord(newPatient);
      patient = newPatient;
    }

    const appointment = addAppointmentForPatient(patient, {
      doctorId: aiVisitPlan.recommendedDoctorId,
      date: aiVisitPlan.suggestedDate,
      time: aiVisitPlan.suggestedTime,
      type: aiVisitPlan.visitType
    });

    setAssistantIntake((current) => ({
      ...current,
      patientId: patient?.id ?? current.patientId
    }));
    setChatMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        task: "scheduling",
        content: [
          `Appointment booked for ${patient.name}.`,
          `Doctor: ${doctorMap[appointment.doctorId]?.name}.`,
          `When: ${appointment.date} at ${appointment.time}.`,
          `Token: ${appointment.token}.`,
          `Reminder: ${aiVisitPlan.caution}`
        ].join("\n")
      }
    ]);
    setActiveView("appointments");
    notify(`AI booked ${patient.name} with ${doctorMap[appointment.doctorId]?.name}.`);
  }

  function handleAddInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const patient = patients.find((entry) => entry.id === invoiceForm.patientId);
    if (!patient || !invoiceForm.amount.trim()) {
      notify("Select a patient and enter a valid amount.");
      return;
    }

    const invoice: Invoice = {
      id: nextInvoiceId(invoices),
      patientId: patient.id,
      patient: patient.name,
      doctorId: patient.doctorId,
      service: invoiceForm.service.trim() || "Consultation fee",
      amount: formatCurrency(Number(invoiceForm.amount) || 0),
      method: invoiceForm.method.trim() || "Cash",
      status: "Pending",
      due: formatDisplayDate(invoiceForm.due)
    };

    setInvoices((current) => [invoice, ...current]);
    setInvoiceForm((current) => ({
      ...current,
      amount: "2000",
      service: "Consultation fee"
    }));
    setActiveView("billing");
    notify(`Invoice ${invoice.id} created for ${patient.name}.`);
  }

  function addDemoWalkIn() {
    const demoName = DEMO_PATIENT_NAMES[demoWalkInCount % DEMO_PATIENT_NAMES.length];
    const doctor = doctors[demoWalkInCount % doctors.length];
    const patientId = crypto.randomUUID();
    const patient: PatientRecord = {
      id: patientId,
      patientId: nextPatientCode(patients),
      name: demoName,
      age: 24 + (demoWalkInCount % 9),
      gender: demoWalkInCount % 2 === 0 ? "Female" : "Male",
      phone: `03${String(10 + demoWalkInCount).padStart(2, "0")}-555${String(700 + demoWalkInCount).padStart(3, "0")}`,
      doctorId: doctor.id,
      visitReason: "Quick demo walk-in consultation",
      insurance: demoWalkInCount % 2 === 0 ? "Cash" : "EFU Health",
      lastVisit: formatDisplayDate(formatInputDate(new Date())),
      status: "Waiting",
      balance: "PKR 0"
    };

    const token = nextTokenFrom(queueItems);
    const queueItem: QueueItem = {
      id: crypto.randomUUID(),
      patientId: patient.id,
      token,
      patient: patient.name,
      doctorId: doctor.id,
      visitType: "Demo Walk-in",
      amount: "PKR 2,000",
      time: `${12 + (demoWalkInCount % 4)}:${demoWalkInCount % 2 === 0 ? "00" : "30"} PM`,
      status: "Unread",
      unread: true,
      summary: "This sample patient was added using the one-click demo action.",
      details: [
        `Assigned doctor: ${doctor.name}`,
        "Auto-created patient, appointment, and billing records.",
        "Useful for showing a complete clinic flow to staff."
      ],
      insurance: patient.insurance
    };

    const appointment: Appointment = {
      id: crypto.randomUUID(),
      patientId: patient.id,
      patient: patient.name,
      doctorId: doctor.id,
      date: formatDisplayDate(formatInputDate(new Date())),
      time: queueItem.time,
      type: "Demo Follow-up",
      status: "Confirmed",
      token
    };

    const invoice: Invoice = {
      id: nextInvoiceId(invoices),
      patientId: patient.id,
      patient: patient.name,
      doctorId: doctor.id,
      service: "Consultation fee",
      amount: "PKR 2,000",
      method: demoWalkInCount % 2 === 0 ? "Cash" : "Card",
      status: "Pending",
      due: formatDisplayDate(formatInputDate(new Date()))
    };

    addPatientRecord(patient, queueItem);
    setAppointments((current) => [appointment, ...current]);
    setInvoices((current) => [invoice, ...current]);
    setDemoWalkInCount((current) => current + 1);
    setActiveView("overview");
    notify(`Demo walk-in added for ${patient.name}.`);
  }

  function markInvoicePaid(invoiceId: string) {
    setInvoices((current) =>
      current.map((invoice) =>
        invoice.id === invoiceId ? { ...invoice, status: "Paid" } : invoice
      )
    );
    notify(`Invoice ${invoiceId} marked as paid.`);
  }

  function checkInAppointment(appointmentId: string) {
    const appointment = appointments.find((entry) => entry.id === appointmentId);
    if (!appointment) {
      return;
    }

    setAppointments((current) =>
      current.map((entry) =>
        entry.id === appointmentId ? { ...entry, status: "Checked In" } : entry
      )
    );
    setPatients((current) =>
      current.map((patient) =>
        patient.id === appointment.patientId
          ? { ...patient, status: "In Consultation" }
          : patient
      )
    );
    notify(`${appointment.patient} checked in.`);
  }

  function completeQueueItem(queueId: string) {
    const queueItem = queueItems.find((entry) => entry.id === queueId);
    if (!queueItem) {
      return;
    }

    setQueueItems((current) =>
      current.map((entry) =>
        entry.id === queueId
          ? { ...entry, status: "Completed", unread: false }
          : entry
      )
    );
    setAppointments((current) =>
      current.map((entry) =>
        entry.patientId === queueItem.patientId
          ? { ...entry, status: "Completed" }
          : entry
      )
    );
    setPatients((current) =>
      current.map((patient) =>
        patient.id === queueItem.patientId
          ? { ...patient, status: "Completed" }
          : patient
      )
    );
    notify(`${queueItem.patient} moved to completed.`);
  }

  async function sendAssistantMessage(
    prompt: string,
    task: AssistantTask = chatTask
  ) {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...chatMessages,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: cleanPrompt,
        task
      }
    ];

    setChatMessages(nextMessages);
    setChatInput("");
    setLoadingReply(true);
    setActiveView("assistant");

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          task,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content
          }))
        })
      });

      const payload = (await response.json()) as {
        reply?: string;
        error?: string;
        model?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Assistant request failed.");
      }

      setChatMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          task,
          content: `${payload.reply ?? "No reply returned."}\n\nSource: ${payload.model ?? "Demo assistant"}`
        }
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected assistant error.";
      setChatMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          task,
          content: `Assistant fallback notice: ${message}`
        }
      ]);
    } finally {
      setLoadingReply(false);
    }
  }

  function renderOverview() {
    return (
      <div className="view-stack">
        <div className="metric-grid">
          <article className="metric-card">
            <span>Patients today</span>
            <strong>{patients.length}</strong>
            <p>{waitingCount} still waiting in queue</p>
          </article>
          <article className="metric-card">
            <span>Appointments</span>
            <strong>{appointments.length}</strong>
            <p>{checkedInCount} checked in right now</p>
          </article>
          <article className="metric-card">
            <span>Revenue collected</span>
            <strong>{formatCurrency(todaysRevenue)}</strong>
            <p>{formatCurrency(pendingRevenue)} still pending</p>
          </article>
          <article className="metric-card">
            <span>Doctors available</span>
            <strong>
              {doctors.filter((doctor) => doctor.status === "Available").length}/
              {doctors.length}
            </strong>
            <p>Live room coverage for the day shift</p>
          </article>
        </div>

        <div className="content-grid">
          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>Live queue</h3>
                <p>Simple front-desk view with actionable tokens.</p>
              </div>
              <button className="secondary-button" onClick={addDemoWalkIn}>
                Add demo walk-in
              </button>
            </div>
            <div className="queue-list">
              {filteredQueue.map((item) => (
                <button
                  key={item.id}
                  className={`queue-row ${selectedQueue?.id === item.id ? "active" : ""}`}
                  onClick={() => setSelectedQueueId(item.id)}
                >
                  <div>
                    <strong>
                      {item.token} - {item.patient}
                    </strong>
                    <p>
                      {item.visitType} | {doctorMap[item.doctorId]?.name}
                    </p>
                  </div>
                  <span
                    className={`status-chip ${item.status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {item.status}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel detail-panel">
            {selectedQueue ? (
              <>
                <div className="panel-head">
                  <div>
                    <h3>{selectedQueue.patient}</h3>
                    <p>
                      {selectedQueue.token} | {selectedQueue.time} |{" "}
                      {doctorMap[selectedQueue.doctorId]?.room}
                    </p>
                  </div>
                  <button
                    className="primary-button"
                    onClick={() => completeQueueItem(selectedQueue.id)}
                  >
                    Mark complete
                  </button>
                </div>
                <div className="summary-box">
                  <span>Front desk summary</span>
                  <p>{selectedQueue.summary}</p>
                </div>
                <ul className="detail-list">
                  {selectedQueue.details.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <div className="split-actions">
                  <button
                    className="secondary-button"
                    onClick={() =>
                      void sendAssistantMessage(
                        `Give a short front-desk handoff note for ${selectedQueue.patient}.`,
                        "summary"
                      )
                    }
                  >
                    Ask assistant
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => setActiveView("appointments")}
                  >
                    Open appointments
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-card">
                <h3>No queue item selected</h3>
                <p>Add a demo patient or search for an existing record.</p>
              </div>
            )}
          </section>
        </div>

        <div className="content-grid">
          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>Today&apos;s appointments</h3>
                <p>Reception-friendly list with one-click check-in.</p>
              </div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>When</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.slice(0, 5).map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{appointment.patient}</td>
                      <td>{doctorMap[appointment.doctorId]?.name}</td>
                      <td>
                        {appointment.date} | {appointment.time}
                      </td>
                      <td>{appointment.status}</td>
                      <td>
                        <button
                          className="table-action"
                          onClick={() => checkInAppointment(appointment.id)}
                        >
                          Check in
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>Billing snapshot</h3>
                <p>Pending bills stay visible without opening another screen.</p>
              </div>
            </div>
            <div className="billing-list">
              {filteredInvoices.slice(0, 4).map((invoice) => (
                <article key={invoice.id} className="list-card">
                  <div>
                    <strong>{invoice.id}</strong>
                    <p>
                      {invoice.patient} | {invoice.service}
                    </p>
                  </div>
                  <div className="list-card-end">
                    <span>{invoice.amount}</span>
                    <button
                      className="table-action"
                      onClick={() => markInvoicePaid(invoice.id)}
                    >
                      Mark paid
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  function renderPatients() {
    return (
      <div className="view-stack">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Patients</h3>
              <p>Search by name, ID, phone, reason, or insurance.</p>
            </div>
            <button className="secondary-button" onClick={addDemoWalkIn}>
              Quick demo entry
            </button>
          </div>
          <div className="card-grid">
            {filteredPatients.map((patient) => (
              <article key={patient.id} className="patient-card">
                <div className="patient-card-top">
                  <div>
                    <strong>{patient.name}</strong>
                    <p>
                      {patient.patientId} | {patient.age} yrs | {patient.gender}
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
                  <span>{patient.phone}</span>
                  <span>{doctorMap[patient.doctorId]?.name}</span>
                </div>
                <div className="meta-row">
                  <span>{patient.insurance}</span>
                  <span>{formatCurrency(balanceByPatientId[patient.id] ?? 0)}</span>
                </div>
                <button
                  className="secondary-button"
                  onClick={() =>
                    void sendAssistantMessage(
                      `Write a short doctor briefing for ${patient.name} based on a ${patient.visitReason.toLowerCase()} visit.`,
                      "summary"
                    )
                  }
                >
                  Create AI summary
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  }

  function renderAppointments() {
    return (
      <div className="view-stack">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Appointments</h3>
              <p>New bookings appear instantly and same-day visits also enter the queue.</p>
            </div>
            <button
              className="secondary-button"
              onClick={() =>
                void sendAssistantMessage(
                  "Suggest the best available appointment slot for a follow-up patient this afternoon.",
                  "scheduling"
                )
              }
            >
              Ask for slot suggestion
            </button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.token}</td>
                    <td>{appointment.patient}</td>
                    <td>{doctorMap[appointment.doctorId]?.name}</td>
                    <td>
                      {appointment.date} | {appointment.time}
                    </td>
                    <td>{appointment.type}</td>
                    <td>{appointment.status}</td>
                    <td>
                      <button
                        className="table-action"
                        onClick={() => checkInAppointment(appointment.id)}
                      >
                        Check in
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  function renderBilling() {
    return <BillingDashboardPage />;
  }

  function renderAssistant() {
    const assistantPatientOptions = patients.map((patient) => (
      <option key={patient.id} value={patient.id}>
        {patient.name}
      </option>
    ));

    return (
      <div className="assistant-layout">
        <aside className="assistant-side">
          <div className="panel-head align-start">
            <div>
              <h3>MediDesk Assistant</h3>
              <p>
                Book visits, guide the patient, prefer a doctor from symptoms, and suggest
                simple tests before the appointment.
              </p>
            </div>
          </div>
          <label className="field">
            <span>Task mode</span>
            <select
              value={chatTask}
              onChange={(event) => setChatTask(event.target.value as AssistantTask)}
            >
              <option value="general">General</option>
              <option value="triage">Triage</option>
              <option value="scheduling">Scheduling</option>
              <option value="summary">Summary</option>
            </select>
          </label>
          <div className="quick-prompt-list">
            <button
              className="secondary-button"
              onClick={() =>
                void sendAssistantMessage(
                  "Summarize the front-desk situation for the next doctor and mention any urgent bookings.",
                  "summary"
                )
              }
            >
              Doctor handoff
            </button>
            <button
              className="secondary-button"
              onClick={() =>
                void sendAssistantMessage(
                  "Choose the best doctor for fever, dizziness, and weakness, and suggest only low-cost pre-visit tests if needed.",
                  "triage"
                )
              }
            >
              Doctor by symptoms
            </button>
            <button
              className="secondary-button"
              onClick={() =>
                void sendAssistantMessage(
                  "Book a follow-up visit, give arrival instructions, and suggest any simple tests that may save time before consultation.",
                  "scheduling"
                )
              }
            >
              Smart booking
            </button>
          </div>
          <form className="panel form-stack assistant-planner" onSubmit={handleGenerateAiPlan}>
            <div className="panel-head align-start compact-head">
              <div>
                <h3>AI visit planner</h3>
                <p>Enter symptoms once and let the assistant prepare a low-friction visit plan.</p>
              </div>
            </div>
            <label className="field">
              <span>Existing patient</span>
              <select
                value={assistantIntake.patientId}
                onChange={(event) =>
                  setAssistantIntake((current) => ({
                    ...current,
                    patientId: event.target.value
                  }))
                }
              >
                <option value="new">New patient</option>
                {assistantPatientOptions}
              </select>
            </label>
            {assistantIntake.patientId === "new" ? (
              <>
                <label className="field">
                  <span>Patient name</span>
                  <input
                    value={assistantIntake.patientName}
                    onChange={(event) =>
                      setAssistantIntake((current) => ({
                        ...current,
                        patientName: event.target.value
                      }))
                    }
                    placeholder="Patient name"
                  />
                </label>
                <div className="two-field">
                  <label className="field">
                    <span>Age</span>
                    <input
                      value={assistantIntake.age}
                      onChange={(event) =>
                        setAssistantIntake((current) => ({
                          ...current,
                          age: event.target.value
                        }))
                      }
                      placeholder="28"
                    />
                  </label>
                  <label className="field">
                    <span>Gender</span>
                    <select
                      value={assistantIntake.gender}
                      onChange={(event) =>
                        setAssistantIntake((current) => ({
                          ...current,
                          gender: event.target.value
                        }))
                      }
                    >
                      <option>Female</option>
                      <option>Male</option>
                    </select>
                  </label>
                </div>
                <label className="field">
                  <span>Phone</span>
                  <input
                    value={assistantIntake.phone}
                    onChange={(event) =>
                      setAssistantIntake((current) => ({
                        ...current,
                        phone: event.target.value
                      }))
                    }
                    placeholder="03xx-xxxxxxx"
                  />
                </label>
              </>
            ) : null}
            <label className="field">
              <span>Symptoms</span>
              <input
                value={assistantIntake.symptoms}
                onChange={(event) =>
                  setAssistantIntake((current) => ({
                    ...current,
                    symptoms: event.target.value
                  }))
                }
                placeholder="Fever for 3 days, cough, weakness..."
              />
            </label>
            <div className="two-field">
              <label className="field">
                <span>Preferred date</span>
                <input
                  type="date"
                  value={assistantIntake.preferredDate}
                  onChange={(event) =>
                    setAssistantIntake((current) => ({
                      ...current,
                      preferredDate: event.target.value
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>Time preference</span>
                <select
                  value={assistantIntake.timePreference}
                  onChange={(event) =>
                    setAssistantIntake((current) => ({
                      ...current,
                      timePreference: event.target.value as TimePreference
                    }))
                  }
                >
                  <option>First available</option>
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Evening</option>
                </select>
              </label>
            </div>
            <button type="submit" className="primary-button wide">
              Generate AI plan
            </button>
          </form>
        </aside>

        <section className="panel assistant-main">
          {aiVisitPlan ? (
            <article className="assistant-plan">
              <div className="panel-head">
                <div>
                  <h3>Recommended visit plan</h3>
                  <p>
                    {doctorMap[aiVisitPlan.recommendedDoctorId]?.name} | {aiVisitPlan.visitType} |{" "}
                    {aiVisitPlan.urgency}
                  </p>
                </div>
                <button className="primary-button" onClick={handleBookAiAppointment}>
                  Book this visit
                </button>
              </div>
              <div className="plan-grid">
                <div className="summary-box">
                  <span>Suggested slot</span>
                  <p>
                    {aiVisitPlan.suggestedDate} at {aiVisitPlan.suggestedTime}
                  </p>
                </div>
                <div className="summary-box">
                  <span>Why this doctor</span>
                  <p>{aiVisitPlan.reasons.join(" ")}</p>
                </div>
              </div>
              <div className="plan-grid">
                <div className="plan-block">
                  <span>Tests before appointment</span>
                  <ul className="detail-list">
                    {aiVisitPlan.suggestedTests.map((test) => (
                      <li key={test}>{test}</li>
                    ))}
                  </ul>
                </div>
                <div className="plan-block">
                  <span>Instructions for patient</span>
                  <ul className="detail-list">
                    {aiVisitPlan.instructions.map((instruction) => (
                      <li key={instruction}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="assistant-note">{aiVisitPlan.caution}</p>
            </article>
          ) : null}
          <div className="chat-stream">
            {chatMessages.map((message) => (
              <article
                key={message.id}
                className={`chat-bubble ${message.role === "user" ? "user" : "assistant"}`}
              >
                <p>{message.content}</p>
              </article>
            ))}
            {loadingReply ? (
              <article className="chat-bubble assistant">
                <p>Preparing a reply...</p>
              </article>
            ) : null}
          </div>
          <form
            className="chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              void sendAssistantMessage(chatInput);
            }}
          >
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Ask for booking, billing, or patient summary help..."
            />
            <button type="submit" className="primary-button">
              Send
            </button>
          </form>
        </section>
      </div>
    );
  }

  function renderSidebar() {
    const patientOptions = patients.map((patient) => (
      <option key={patient.id} value={patient.id}>
        {patient.name}
      </option>
    ));

    return (
      <div className="sidebar-stack">
        {(activeView === "overview" || activeView === "patients") && (
          <section className="panel form-panel">
            <div className="panel-head align-start">
              <div>
                <h3>Add patient</h3>
                <p>Simple demo form so staff can test the flow quickly.</p>
              </div>
            </div>
            <form className="form-stack" onSubmit={handleAddPatient}>
              <label className="field">
                <span>Patient name</span>
                <input
                  value={patientForm.name}
                  onChange={(event) =>
                    setPatientForm((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                  placeholder="Enter patient name"
                />
              </label>
              <div className="two-field">
                <label className="field">
                  <span>Age</span>
                  <input
                    value={patientForm.age}
                    onChange={(event) =>
                      setPatientForm((current) => ({
                        ...current,
                        age: event.target.value
                      }))
                    }
                    placeholder="32"
                  />
                </label>
                <label className="field">
                  <span>Gender</span>
                  <select
                    value={patientForm.gender}
                    onChange={(event) =>
                      setPatientForm((current) => ({
                        ...current,
                        gender: event.target.value
                      }))
                    }
                  >
                    <option>Female</option>
                    <option>Male</option>
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Phone</span>
                <input
                  value={patientForm.phone}
                  onChange={(event) =>
                    setPatientForm((current) => ({
                      ...current,
                      phone: event.target.value
                    }))
                  }
                  placeholder="03xx-xxxxxxx"
                />
              </label>
              <label className="field">
                <span>Doctor</span>
                <select
                  value={patientForm.doctorId}
                  onChange={(event) =>
                    setPatientForm((current) => ({
                      ...current,
                      doctorId: event.target.value
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
              <label className="field">
                <span>Visit reason</span>
                <input
                  value={patientForm.visitReason}
                  onChange={(event) =>
                    setPatientForm((current) => ({
                      ...current,
                      visitReason: event.target.value
                    }))
                  }
                  placeholder="Follow-up, walk-in, fever..."
                />
              </label>
              <label className="field">
                <span>Insurance</span>
                <input
                  value={patientForm.insurance}
                  onChange={(event) =>
                    setPatientForm((current) => ({
                      ...current,
                      insurance: event.target.value
                    }))
                  }
                  placeholder="Cash or insurance provider"
                />
              </label>
              <button type="submit" className="primary-button wide">
                Save patient entry
              </button>
            </form>
          </section>
        )}

        {(activeView === "overview" || activeView === "appointments") && (
          <section className="panel form-panel">
            <div className="panel-head align-start">
              <div>
                <h3>Book appointment</h3>
                <p>Creates a real demo appointment record immediately.</p>
              </div>
            </div>
            <form className="form-stack" onSubmit={handleAddAppointment}>
              <label className="field">
                <span>Patient</span>
                <select
                  value={appointmentForm.patientId}
                  onChange={(event) =>
                    setAppointmentForm((current) => ({
                      ...current,
                      patientId: event.target.value
                    }))
                  }
                >
                  {patientOptions}
                </select>
              </label>
              <label className="field">
                <span>Doctor</span>
                <select
                  value={appointmentForm.doctorId}
                  onChange={(event) =>
                    setAppointmentForm((current) => ({
                      ...current,
                      doctorId: event.target.value
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
              <div className="two-field">
                <label className="field">
                  <span>Date</span>
                  <input
                    type="date"
                    value={appointmentForm.date}
                    onChange={(event) =>
                      setAppointmentForm((current) => ({
                        ...current,
                        date: event.target.value
                      }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Time</span>
                  <input
                    value={appointmentForm.time}
                    onChange={(event) =>
                      setAppointmentForm((current) => ({
                        ...current,
                        time: event.target.value
                      }))
                    }
                    placeholder="02:00 PM"
                  />
                </label>
              </div>
              <label className="field">
                <span>Type</span>
                <input
                  value={appointmentForm.type}
                  onChange={(event) =>
                    setAppointmentForm((current) => ({
                      ...current,
                      type: event.target.value
                    }))
                  }
                  placeholder="Follow-up"
                />
              </label>
              <button type="submit" className="primary-button wide">
                Create appointment
              </button>
            </form>
          </section>
        )}

        {(activeView === "overview" || activeView === "billing") && (
          <section className="panel form-panel">
            <div className="panel-head align-start">
              <div>
                <h3>Create invoice</h3>
                <p>Add demo billing records without leaving the page.</p>
              </div>
            </div>
            <form className="form-stack" onSubmit={handleAddInvoice}>
              <label className="field">
                <span>Patient</span>
                <select
                  value={invoiceForm.patientId}
                  onChange={(event) =>
                    setInvoiceForm((current) => ({
                      ...current,
                      patientId: event.target.value
                    }))
                  }
                >
                  {patientOptions}
                </select>
              </label>
              <label className="field">
                <span>Service</span>
                <input
                  value={invoiceForm.service}
                  onChange={(event) =>
                    setInvoiceForm((current) => ({
                      ...current,
                      service: event.target.value
                    }))
                  }
                  placeholder="Consultation fee"
                />
              </label>
              <div className="two-field">
                <label className="field">
                  <span>Amount</span>
                  <input
                    value={invoiceForm.amount}
                    onChange={(event) =>
                      setInvoiceForm((current) => ({
                        ...current,
                        amount: event.target.value
                      }))
                    }
                    placeholder="2000"
                  />
                </label>
                <label className="field">
                  <span>Method</span>
                  <select
                    value={invoiceForm.method}
                    onChange={(event) =>
                      setInvoiceForm((current) => ({
                        ...current,
                        method: event.target.value
                      }))
                    }
                  >
                    <option>Cash</option>
                    <option>Card</option>
                    <option>JazzCash</option>
                    <option>Insurance</option>
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Due date</span>
                <input
                  type="date"
                  value={invoiceForm.due}
                  onChange={(event) =>
                    setInvoiceForm((current) => ({
                      ...current,
                      due: event.target.value
                    }))
                  }
                />
              </label>
              <button type="submit" className="primary-button wide">
                Save billing entry
              </button>
            </form>
          </section>
        )}
      </div>
    );
  }

  function renderMainContent() {
    switch (activeView) {
      case "patients":
        return renderPatients();
      case "appointments":
        return renderAppointments();
      case "billing":
        return renderBilling();
      case "assistant":
        return renderAssistant();
      default:
        return renderOverview();
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">MD</div>
          <div>
            <strong>MediDesk Clinic Demo</strong>
            <p>User-friendly front desk workspace with real demo entries.</p>
          </div>
        </div>
        <div className="topbar-actions">
          <span className="soft-pill">
            Demo mode ready | {demoCredentials.email}
          </span>
          <button className="secondary-button" onClick={addDemoWalkIn}>
            Add demo walk-in
          </button>
          <button className="primary-button" onClick={resetDemoData}>
            Reset sample data
          </button>
        </div>
      </header>

      <main className="app-shell">
        <section className="hero-panel">
          <div>
            <span className="eyebrow">Clinic workspace</span>
            <h1>Simple demo flow for patients, appointments, billing, and AI help.</h1>
            <p>
              The demo now opens directly into a usable clinic UI. You can add patient
              entries, schedule visits, issue bills, and test the assistant without
              fighting the interface.
            </p>
          </div>
          <div className="hero-side">
            <article className="hero-stat">
              <span>Current time</span>
              <strong>
                {now.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit"
                })}
              </strong>
              <p>{now.toLocaleDateString("en-GB")}</p>
            </article>
            <article className="hero-stat">
              <span>Front desk status</span>
              <strong>{waitingCount} waiting</strong>
              <p>{checkedInCount} patients already checked in</p>
            </article>
          </div>
        </section>

        <section className="workspace-shell">
          <aside className="workspace-nav">
            <button
              className={activeView === "overview" ? "active" : ""}
              onClick={() => setActiveView("overview")}
            >
              Overview
            </button>
            <button
              className={activeView === "patients" ? "active" : ""}
              onClick={() => setActiveView("patients")}
            >
              Patients
            </button>
            <button
              className={activeView === "appointments" ? "active" : ""}
              onClick={() => setActiveView("appointments")}
            >
              Appointments
            </button>
            <button
              className={activeView === "billing" ? "active" : ""}
              onClick={() => setActiveView("billing")}
            >
              Billing
            </button>
            <button
              className={activeView === "assistant" ? "active" : ""}
              onClick={() => setActiveView("assistant")}
            >
              Assistant
            </button>
          </aside>

          <section className="workspace-main">
            <div className="workspace-head">
              <div>
                <h2>
                  {activeView === "overview" && "Clinic overview"}
                  {activeView === "patients" && "Patient records"}
                  {activeView === "appointments" && "Appointment desk"}
                  {activeView === "billing" && "Billing records"}
                  {activeView === "assistant" && "Clinic assistant"}
                </h2>
                <p>
                  Search works across the current view so the demo feels closer to a
                  real product.
                </p>
              </div>
              <input
                className="search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search current records..."
              />
            </div>
            {renderMainContent()}
          </section>

          <aside className="workspace-side">{renderSidebar()}</aside>
        </section>
      </main>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
