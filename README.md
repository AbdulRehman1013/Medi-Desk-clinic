# MediDesk Clinic Portal 🏥

MediDesk is a comprehensive, production-ready Healthcare Clinic Management System built with **Next.js 15**. It provides role-based interfaces for Admins, Doctors, and Patients, seamlessly integrating clinical workflows with advanced AI capabilities powered by NVIDIA AI endpoints.

This project uses **clean, custom vanilla CSS architecture** (explicitly avoiding styling frameworks like Tailwind CSS) to maintain a fast, highly-performant, and bespoke user interface design.

---

## 🚀 Key Features

### 1. Admin Dashboard 💳
* **Comprehensive Billing Management:** Dedicated left-sidebar section featuring quick statistics (Total Revenue, Pending Payments, Overdue Invoices) and an active Invoices Table.
* **Invoice Generation:** Inline creation form with live medical service price calculation, custom discount inputs, and payment method selection (Cash, JazzCash, EasyPaisa, Card).
* **Data Export:** Built-in actions to easily view, print, or track outstanding balances.

### 2. Doctor Dashboard 📅
* **Patient History Access:** Doctors can securely review comprehensive patient history records, including previous diagnoses, vital signs, prescriptions, and historical lab logs.
* **1-Month Interactive Calendar:** Seamless scheduling tool allowing doctors to toggle months, view upcoming appointments, track free slots, and actively mark "Holidays / Leaves" which sync globally.

### 3. Patient Portal & NVIDIA AI Assistant 🤖
* **Self-Service Portal:** Patients can check active medical summaries, appointments, and report statuses.
* **NVIDIA AI Clinical Helper:** Integrated backend endpoint (`api/assistant/route.ts`) enabling smart medical data processing and intuitive context analysis.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 15.5+ (App Router architecture)
* **Language:** TypeScript
* **State Management:** Custom Client Store (`lib/portal-clinic-store.ts`)
* **AI Engine:** NVIDIA API Integration
* **Styling:** Custom Vanilla CSS Modules & Inline Styling (No Tailwind CSS)

---

## 📂 Project Structure

```text
media desk/
├── app/
│   ├── page.tsx                  # Landing & Login Entry
│   ├── layout.tsx                # Root layout configuration
│   ├── globals.css               # Global baseline styles
│   ├── admin/dashboard/page.tsx  # Admin dashboard view routing
│   ├── doctor/dashboard/page.tsx # Doctor dashboard view routing
│   ├── patient/dashboard/page.tsx# Patient dashboard view routing
│   └── api/assistant/route.ts    # NVIDIA AI Assistant endpoint
├── components/
│   ├── medidesk-portal-home.tsx  # Main Landing Page UI
│   ├── medidesk-app.tsx          # General Core Shell Component
│   ├── admin-dashboard-page.tsx  # Admin Views & Nav Layout
│   ├── billing-dashboard-page.tsx# Custom Billing & Invoicing Panel
│   ├── doctor-dashboard-page.tsx # Doctor Panel & Interactive Calendar
│   └── patient-dashboard-page.tsx# Patient Portal Layout
└── lib/
    ├── nvidia.ts                 # NVIDIA API Gateway configuration
    ├── portal-auth.ts            # Authentication & RBAC Core Logic
    ├── portal-clinic-store.ts    # Global Application State Store
    └── dummy-data.ts             # Clean Mock Datasets & Schemes
