# 💉 ImmuTrack — Clinical Vaccine Scheduler & Immunization Management System

[![Node.js](https://img.shields.io/badge/Node.js-v16+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-Cloud%20Database-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![UI](https://img.shields.io/badge/Design-Soft%20Neumorphic%20Medical-26B9AA)](https://github.com/24pa1a0583/VaccineScheduler)
[![Deployment](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=white)](https://render.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A state-of-the-art, full-stack Clinical Vaccine Scheduling and Immunization Lifecycle Management platform built for healthcare clinicians, pediatricians, and patients. Featuring a soft neumorphic medical aesthetic, live MongoDB Atlas synchronization, dynamic overdue detection with glowing red alert lights, self-administration in the patient portal, direct messaging to unsaved numbers via WhatsApp and SMS, and pinpoint Google Calendar reminders.

---

## 📑 Table of Contents

- [Core Feature Explanation](#-core-feature-explanation)
  - [1. Doctor & Clinician Portal](#1-doctor--clinician-portal)
  - [2. Patient Portal & Personal Immunization Pass](#2-patient-portal--personal-immunization-pass)
  - [3. Dynamic Overdue Detection & Glowing Red Alert Lighting](#3-dynamic-overdue-detection--glowing-red-alert-lighting)
  - [4. Patient Self-Administration Option](#4-patient-self-administration-option)
  - [5. Direct Unsaved Contact Sharing (WhatsApp, SMS, GMail)](#5-direct-unsaved-contact-sharing-whatsapp-sms-gmail)
  - [6. Google Calendar Pinpoint Reminders](#6-google-calendar-pinpoint-reminders)
  - [7. Design System & Soft Neumorphic Medical UI](#7-design-system--soft-neumorphic-medical-ui)
  - [8. Authentication & MongoDB Atlas Architecture](#8-authentication--mongodb-atlas-architecture)
- [How to Run the Application](#-how-to-run-the-application)
  - [Prerequisites](#prerequisites)
  - [Local Installation & Setup](#local-installation--setup)
  - [Environment Variables Configuration](#environment-variables-configuration)
  - [Running Locally](#running-locally)
- [Cloud Deployment (Render)](#-cloud-deployment-render)
  - [Option A: Deploy with Blueprint (`render.yaml`) — Recommended](#option-a-deploy-with-blueprint-renderyaml--recommended)
  - [Option B: Manual Web Service Setup](#option-b-manual-web-service-setup)
  - [⚠️ Critical MongoDB Atlas Network Access Setting](#️-critical-mongodb-atlas-network-access-setting)
- [Demo Credentials](#-demo-credentials)
- [API Reference](#-api-reference)
- [Project Directory Structure](#-project-directory-structure)

---

## 🌟 Core Feature Explanation

### 1. Doctor & Clinician Portal
The Doctor Portal provides an Electronic Health Record (EHR) command center for managing clinical caseloads, scheduling vaccinations, tracking patient histories, and monitoring compliance metrics.

- **Real-Time Clinical Statistics**:
  - **Total Caseload**: Total active patients managed by the clinician.
  - **Compliance Rate**: Percentage of patients up-to-date with recommended immunizations.
  - **Overdue Recalls**: Automatically tallied count of patients whose scheduled vaccination times have lapsed without administration.
  - **High-Risk Caseload**: Patients flagged with medical conditions, prematurity, or documented allergies.
  - **Scheduled Today**: Pinpoint count of patients with appointments scheduled for the current date.
- **Roster Management & Multi-Filter System**:
  - Filter by **All Patients**, **Overdue Recalls**, **Upcoming Confirmed Appointments**, and **Fully Administered**.
  - Real-time patient search by legal name, MRN (Medical Record Number), or contact details.
  - Sorting by compliance rate, patient name, or scheduled appointment slot.
- **Complete Patient Chart Modal**:
  - Clinical overview displaying legal name, calculated age with pediatric/adult categorization, DOB, blood group, gender, 10-digit mobile number, emergency contact, email address, allergies, and chronic conditions.
  - **3-Way Tabbed Schedule**:
    - **All Vaccines**: Chronological timeline of all doses.
    - **Pending Schedule**: Scheduled and overdue vaccine doses with administration and editing controls.
    - **Administered Ledger**: Complete verified history with clinician signatures, lot numbers, anatomical injection sites, and timestamps.
- **Comprehensive Patient & Schedule Editing**:
  - Edit demographics directly from the patient chart or roster table (Legal Name, DOB, Gender, Blood Group, Allergies, Emergency Contact, GMail, 10-digit Phone).
  - Update vaccine formulation, dose, scheduled date, scheduled time, urgency tier, and clinical contraindications.
- **Enroll & Schedule New Patients**:
  - Add existing patients or register brand-new patients with custom facilities and departments (with dedicated "Other" input support).
  - Strict 10-digit mobile number validation ensures clean contact records without messy formatting.

---

### 2. Patient Portal & Personal Immunization Pass
Patients log into a dedicated self-service portal designed to make immunization management transparent and effortless.

- **Digital Smart Health Pass**:
  - Displays Medical Record Number (MRN), primary clinic, attending physician, blood group badge, and overall compliance score.
  - Real-time demographic card showing dynamic age calculation, address, insurance policy details, and documented allergy warnings.
- **Clean-Sheet Architecture**:
  - Demo patients (`patient@immu-track.org`) load realistic clinical demo history for evaluation.
  - Newly registered patients start with a completely pristine, clean sheet (0 records) strictly scoped to their own account.
- **Appointment Scheduling**:
  - Patients can schedule new appointments, selecting the vaccine, dose, preferred date, time slot, healthcare clinic, and optional notes.
- **Appointment Rescheduling & Cancellation**:
  - Patients can reschedule or update appointment details anytime prior to administration.
  - Ability to cancel scheduled appointments with instant database synchronization.

---

### 3. Dynamic Overdue Detection & Glowing Red Alert Lighting
A core clinical principle of VaccineScheduler is that **vaccines are never automatically assumed to be administered**.

- **Why Time-Expiry Alone Does Not Administer**:
  - In real-world healthcare, passing a scheduled appointment time does not mean the patient received the shot. If an appointment is scheduled for `10:00 AM` and the time passes without clinician or patient confirmation, the vaccine is **Overdue**, not completed.
- **Dynamic Overdue Evaluation (`isDoseOverdue`)**:
  - The system evaluates the exact scheduled date and time against the current timestamp.
  - If the appointment time is in the past and the vaccine has not been confirmed as administered, its status automatically transitions to **Overdue**.
- **Visual Overdue Alert Light**:
  - In both Doctor and Patient portals, overdue rows, chart cards, and patient passes pulse with a high-visibility neon red colored light (`animation: redAlertPulse 2s infinite ease-in-out`).
  - Highlights border outlines with `2px solid #ef4444`, `border-left: 6px solid #dc2626`, and a pulsating red glow (`box-shadow: 0 0 24px rgba(239, 68, 68, 0.85)`).
  - Overdue badges display `🚨 Overdue Appointment` or `🚨 Lapsed Clinical Action Required`.

---

### 4. Patient Self-Administration Option
Patients now have full agency to record administered immunizations directly from their portal.

- **"💉 Administer Dose" Button**:
  - Available on all upcoming and overdue vaccine cards in the Patient Portal.
- **Confirmation & Verification Flow**:
  - When the patient takes their vaccine (e.g. at an external clinic or walk-in appointment), they click **"💉 Administer Dose"**.
  - A confirmation modal verifies the vaccine name, dose number, and scheduled slot.
  - Upon confirmation, the backend endpoint `POST /api/data/patient-me/doses/:doseId/administer`:
    1. Removes the dose from the active/overdue list.
    2. Generates an official administration timestamp (e.g., `Oct 26, 2026 • 10:30 AM`).
    3. Issues a verified batch lot number (e.g. `LOT-PAT-1041-2026`).
    4. Records the administering clinic and attending clinician.
    5. Appends the record to the **Verified Administered Vaccines (Completed History)** ledger.
    6. Automatically recalculates the patient's compliance score.
    7. Synchronizes changes with the clinician's master roster.

---

### 5. Direct Unsaved Contact Sharing (WhatsApp, SMS, GMail)
Clinicians and patients can share vaccine notices and overdue recall alerts across multiple messaging channels without saving phone numbers into device contacts.

- **Official Vector Logos**:
  - Uses original SVG vector logos for **Google GMail**, **WhatsApp**, **WhatsApp Web**, **Google Messages (SMS)**, and **Universal Device Share** (replacing generic emojis).
- **Zero-Contact-Required Messaging**:
  - **WhatsApp Click-to-Chat**: Uses the official WhatsApp API `https://api.whatsapp.com/send/?phone=<intlNumber>&text=<encodedMessage>&type=phone_number&app_absent=0`. Formats the 10-digit number into international standard with country code (e.g. `919876543210`), opening a brand-new chat immediately without requiring the recipient to be saved in phone contacts.
  - **WhatsApp Web Button**: Dedicated desktop browser link `https://web.whatsapp.com/send?phone=...` for clinicians operating from clinic desktop PCs.
  - **RFC 5724 Native SMS**: Generates native SMS URIs (`sms:<number>?body=...` on Android/Windows/Mac, `sms:<number>&body=...` on iOS) to immediately launch the default messaging app with unsaved recipient pre-filled.
  - **GMail & Mailto**: Directly launches the official GMail compose window with recipient email, subject line, and structured clinical notification body.
  - **Web Share API**: Native device share sheet integration for sharing to Telegram, Signal, AirDrop, or Notes on supported mobile and tablet browsers.
- **Pre-Populated Clinical Notice**:
  - Message includes Patient Legal Name, Scheduled / Lapsed Slot, Vaccine Formulation, Dose Number, Health Facility, and Attending Doctor.

---

### 6. Google Calendar Pinpoint Reminders
- Each scheduled upcoming vaccination card in the Patient Portal includes an **"Add to Google Calendar"** button featuring the official 4-color Google Calendar logo.
- Automatically computes exact ISO-8601 start and end timestamps from the appointment date and time slot.
- Generates a Google Calendar event URL containing:
  - Event title (e.g. `💉 Vaccination Appointment: MMR Booster (Dose 2 Booster)`).
  - Facility location (e.g. `Swedish Medical Center — Pediatric Specialty Clinic`).
  - Pre-filled reminder notes instructing the patient to bring their digital health pass.

---

### 7. Design System & Soft Neumorphic Medical UI
- **Aesthetic Philosophy**: Clean, soft neumorphic medical design tailored for clinical clarity, low eye strain, and visual delight.
- **Color Palette**:
  - Primary Teal (`#26B9AA`, `#10B981`) for health and wellness.
  - Deep Slate (`#0F172A`, `#1E293B`) for crisp, readable clinical typography.
  - Soft Light Background (`#F8FAFC` to `#F1F5F9`) with convex/concave neumorphic drop shadows (`var(--neo-raised)`).
  - Glowing Neon Coral/Red (`#EF4444`, `#DC2626`) reserved strictly for urgent overdue recalls.
- **Micro-Animations & Feedback**:
  - Smooth hover elevations (`translateY(-2px)`).
  - Toast notification system with success, error, info, and warning states.
  - Interactive password strength meter during registration.

---

### 8. Authentication & MongoDB Atlas Architecture
- **JWT (JSON Web Token)**: Stateless authentication via `Bearer` tokens stored securely in client storage.
- **Role-Based Access Control (RBAC)**:
  - Separate access scopes for `doctor` and `patient` accounts.
  - Doctors access clinical caseloads, chart editing, and patient rosters.
  - Patients access personal health passes, self-scheduling, and verified completed histories.
- **MongoDB Atlas Integration**:
  - Powered by Mongoose ODM connected directly to MongoDB Atlas.
  - Native connection retry resilience (`connectDB` with exponential backoff).
  - Replaces all legacy Firestore dependencies with pure MongoDB collections (`users` and `patientrecords`).

---

## 💻 How to Run the Application

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v16.0.0 or higher recommended, tested on v18, v20, and v24)
- **npm** (v8.0.0 or higher)
- **Git**

---

### Local Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/24pa1a0583/VaccineScheduler.git
   cd VaccineScheduler
   ```

2. **Install Node Dependencies**:
   ```bash
   npm install
   ```

---

### Environment Variables Configuration

Create a `.env` file in the root directory (you can copy `.env.example`):

```bash
cp .env.example .env
```

Ensure your `.env` contains:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret for Session Authentication
JWT_SECRET=super_secret_vaccine_scheduler_jwt_key_2026_secure

# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://24pa1a0583_db_user:TzIs18L2T1TYiEoy@vaccinescheduler.czkuwcd.mongodb.net/vaccinescheduler?retryWrites=true&w=majority
```

> [!NOTE]
> If you have your own MongoDB Atlas cluster, you can replace the `MONGODB_URI` with your own connection string.

---

### Running Locally

1. **Start the Application**:
   ```bash
   npm start
   ```

   *Or for development with automatic server restarts:*
   ```bash
   npm run dev
   ```

2. **Open in Browser**:
   Navigate to:
   ```text
   http://localhost:3000
   ```

3. **Check Server Health**:
   Verify backend and database connectivity by visiting:
   ```text
   http://localhost:3000/api/health
   ```
   *Expected Response:*
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "timestamp": "2026-10-26T10:25:00.000Z"
   }
   ```

---

## 🚀 Cloud Deployment (Render)

VaccineScheduler is production-ready for deployment on [Render](https://render.com/).

### Option A: Deploy with Blueprint (`render.yaml`) — Recommended

1. Push your repository to GitHub.
2. Log in to [dashboard.render.com](https://dashboard.render.com/).
3. Click **New +** in the top navigation bar and select **Blueprint**.
4. Connect your GitHub repository `24pa1a0583/VaccineScheduler`.
5. Render will automatically detect [`render.yaml`](render.yaml) and configure:
   - **Service Name**: `vaccinescheduler`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
   - **Environment Variables**:
     - `NODE_ENV`: `production` (auto-configured)
     - `JWT_SECRET`: auto-generated cryptographically secure secret
6. When prompted for `MONGODB_URI`, paste your MongoDB Atlas connection string:
   ```env
   mongodb+srv://24pa1a0583_db_user:TzIs18L2T1TYiEoy@vaccinescheduler.czkuwcd.mongodb.net/vaccinescheduler?retryWrites=true&w=majority
   ```
7. Click **Apply**. Render will build and deploy your application.

---

### Option B: Manual Web Service Setup

1. On [Render Dashboard](https://dashboard.render.com/), click **New +** &rarr; **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `vaccinescheduler`
   - **Region**: Any (e.g. `Oregon (US West)` or `Singapore`)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | `super_secret_vaccine_scheduler_jwt_key_2026_secure` |
   | `MONGODB_URI` | `mongodb+srv://24pa1a0583_db_user:TzIs18L2T1TYiEoy@vaccinescheduler.czkuwcd.mongodb.net/vaccinescheduler?retryWrites=true&w=majority` |
5. Click **Create Web Service**.

---

### ⚠️ Critical MongoDB Atlas Network Access Setting

Render cloud instances use dynamic outbound IP addresses. To prevent MongoDB connection timeout errors on Render:
1. Go to your [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. In the left navigation menu under **Security**, click **Network Access**.
3. Click **Add IP Address**.
4. Select **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Confirm**.

---

## 🩺 Demo Credentials

Pre-seeded accounts are provided to immediately explore both Doctor and Patient experiences:

| Role | Email Address | Password | Key Features to Test |
|---|---|---|---|
| **Doctor / Clinician** | `doctor@immu-track.org` | `Doctor@123` | Patient Roster, Overdue Recalls, Full Demographic/Schedule Editor, Patient Chart modal, Multi-Channel Share, Lot Logging |
| **Patient** | `patient@immu-track.org` | `Patient@123` | Digital Health Pass, Upcoming & Overdue View, **"💉 Administer Dose"** button, Google Calendar integration, Reschedule/Cancel |

> [!TIP]
> You can also click **"Create an Account"** on the login screen to register your own new Doctor or Patient account with custom department/hospital fields!

---

## 🔌 API Reference

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new Doctor or Patient account | No |
| `POST` | `/api/auth/login` | Authenticate and receive JWT session token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `PUT` | `/api/auth/profile` | Update user profile details | Yes |
| `POST` | `/api/auth/seed-demo` | Re-seed demo doctor and patient records | No |

### Clinical & Patient Data Endpoints (`/api/data`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/data/patients` | Fetch clinician's patient roster and live caseload statistics | Doctor |
| `GET` | `/api/data/patients/:id/chart` | Fetch complete patient chart with pending and administered doses | Doctor |
| `POST` | `/api/data/patients/schedule-new` | Schedule dose for existing patient or enroll brand-new patient | Doctor |
| `POST` | `/api/data/patients/administer-vaccine` | Clinician logs and administers specific pending vaccine | Doctor |
| `POST` | `/api/data/patients/record-dose` | Quick 1-click dose administration row action | Doctor |
| `PUT` | `/api/data/patients/:id/schedule` | Edit patient demographics and full scheduled dose info | Doctor |
| `PUT` | `/api/data/patients/:id/pending-dose/:doseId` | Edit specific pending vaccine details in patient chart | Doctor |
| `DELETE` | `/api/data/patients/:id` | Remove patient from clinical registry | Doctor |
| `DELETE` | `/api/data/patients/:id/pending-dose/:doseId` | Delete specific pending dose from patient chart | Doctor |
| `GET` | `/api/data/patient-me` | Fetch authenticated patient's personal schedule and health pass | Patient |
| `POST` | `/api/data/patient-me/schedule` | Patient schedules new upcoming vaccination appointment | Patient |
| `POST` | `/api/data/patient-me/doses/:doseId/administer` | **Patient explicitly administers their own upcoming/overdue dose** | Patient |
| `PUT` | `/api/data/patient-me/doses/:doseId` | Patient reschedules or edits upcoming appointment | Patient |
| `DELETE` | `/api/data/patient-me/doses/:doseId` | Patient cancels upcoming appointment | Patient |
| `GET` | `/api/health` | System health check (MongoDB connectivity & uptime) | No |

---

## 📁 Project Directory Structure

```text
VaccineScheduler/
├── public/
│   ├── css/
│   │   ├── auth.css          # Neumorphic login/register styles & strength meter
│   │   └── dashboard.css     # Clinical dashboard, red glowing alert light, modals
│   ├── js/
│   │   ├── api.js            # Frontend REST client with JWT interceptor
│   │   ├── auth.js           # Client authentication & form handlers
│   │   └── dashboard.js      # Main dashboard controller, sharing, calendar, administer
│   └── index.html            # Single Page Application HTML5 markup
├── server/
│   ├── routes/
│   │   ├── auth.js           # Authentication & registration endpoints
│   │   └── data.js           # Clinical roster, patient-me, and administer endpoints
│   ├── db.js                 # MongoDB Atlas Mongoose connection & schema models
│   └── index.js              # Express server entry point & static file serving
├── render.yaml               # Render Blueprint infrastructure-as-code specification
├── .env.example              # Sample environment variables configuration
├── package.json              # Project dependencies and npm scripts
└── README.md                 # Complete project documentation & guide
```

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute this software for clinical, educational, or commercial applications.
