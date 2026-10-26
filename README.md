# 💉 ImmuTrack — Vaccine Scheduler & Immunization Manager

> **A user-friendly, modern clinical platform for healthcare doctors and patients to schedule, track, and manage vaccinations with real-time alerts, Google Calendar reminders, and direct WhatsApp/SMS sharing.**

[![Node.js](https://img.shields.io/badge/Node.js-v16+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-Live%20Database-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Design](https://img.shields.io/badge/UI-Soft%20Neumorphic%20Medical-26B9AA)](https://github.com/24pa1a0583/VaccineScheduler)

---

## ⚡ Quick Start: Running the App in 3 Steps

If you want to run this application on your computer right away, follow these 3 simple steps:

### 1. Clone the repository
Open your terminal (Command Prompt, PowerShell, or Terminal) and run:
```bash
git clone https://github.com/24pa1a0583/VaccineScheduler.git
cd VaccineScheduler
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the application
```bash
npm start
```

Now open your web browser (Chrome, Edge, Safari, Firefox) and navigate to:
```text
http://localhost:3000
```

> [!TIP]
> **No database setup is required!** The application is pre-connected to a live MongoDB Atlas cloud database with instant demo accounts ready to test.

---

## 🔑 Ready-to-Use Demo Accounts

You can log in immediately using either of the two demo profiles:

| Account Type | Email | Password | What You Will Experience |
|---|---|---|---|
| **🩺 Doctor Portal** | `doctor@immu-track.org` | `Doctor@123` | Clinical caseload metrics, patient roster, full chart editing, overdue recall tracking, and 1-click dose administration. |
| **👤 Patient Portal** | `patient@immu-track.org` | `Patient@123` | Digital Health Pass, upcoming appointments, **"💉 Administer Dose"** button, Google Calendar sync, and verified immunization history. |

*You can also click **"Create an Account"** on the login page to register your own custom Doctor or Patient profile!*

---

## 📖 User Guide: The Doctor's Perspective

As a doctor, pediatrician, or clinic administrator, the application gives you an Electronic Health Record (EHR) command center to manage your patient caseload efficiently.

```
[Doctor Login] ➔ [Caseload Overview] ➔ [Patient Roster] ➔ [Patient Chart Modal] ➔ [Administer / Share]
```

### 1. Understanding Your Clinical Caseload Overview
At the top of your dashboard, five live metric cards summarize your practice:
- **Total Caseload**: Total active patients currently under your care.
- **Compliance Rate**: Percentage of your patients who are fully up-to-date with their vaccinations.
- **Overdue Recalls**: Number of patients who missed their scheduled vaccine date/time and need urgent follow-up.
- **High-Risk Caseload**: Patients flagged with premature birth history, chronic conditions, or documented allergies.
- **Scheduled Today**: Total appointments due for immunization today.

---

### 2. Finding & Filtering Patients
Use the roster search bar and filter tabs to quickly find any patient:
- **Search**: Type any part of a patient's legal name, Medical Record Number (MRN), or phone number.
- **Filter Tabs**:
  - **All Patients**: Your complete patient directory.
  - **Overdue Recalls**: Filters strictly to patients with lapsed, unadministered vaccines.
  - **Upcoming**: Patients with confirmed future appointments.
  - **Administered**: Patients whose recommended vaccines are complete.

---

### 3. Enrolling a New Patient or Scheduling an Immunization
Click the **"➕ Enroll New Patient"** button at the top right:
1. Enter the patient's legal name, date of birth, gender, and blood group.
2. Enter their primary contact mobile number (strictly 10 digits) and optional emergency contact.
3. Select their assigned department and facility (if your clinic isn't listed, choose **"➕ Other"** to type your custom clinic name!).
4. Choose the vaccine formulation, dose number, scheduled date, and time slot.
5. Click **"Save Patient Record & Schedule Dose"**. The patient is instantly saved to MongoDB and added to your roster.

---

### 4. Opening a Patient's Complete Clinical Chart
Click on any patient's row in the roster to open their full clinical chart modal:
- **Demographics & Clinical Alerts**: Review legal name, age (automatically calculated into pediatric/adult categories), blood group, allergies, and contraindications.
- **Timeline & Schedule**:
  - **All**: Complete view of past and upcoming vaccines.
  - **Pending Schedule**: Scheduled or overdue doses with controls to edit or administer.
  - **Administered History**: Verified records with clinician signatures, lot numbers, injection routes (e.g. Intramuscular Deltoid), and timestamps.

---

### 5. Editing Patient Information & Schedules
Need to correct a spelling, update a phone number, or change an appointment date?
- Click the **"✏️" (Edit)** button on any patient in the roster or inside the patient chart modal.
- An interactive editor opens with all fields pre-filled:
  - Patient legal name, DOB, gender, blood group, allergies.
  - Primary 10-digit mobile, emergency contact, and GMail address.
  - Vaccine name, dose, scheduled date, time slot, and clinical urgency.
- Click **"Save Changes"** to update both the patient chart and the database immediately.

---

### 6. Administering a Vaccine Dose (Recording Completion)
In VaccineScheduler, **vaccines are never marked as completed automatically**. An appointment only becomes completed when a doctor or patient confirms it:
- Click the **"💉" (Syringe Icon)** on the patient row, or click **"💉 Administer Dose Now"** inside their chart.
- The system automatically:
  1. Removes the dose from the pending/overdue list.
  2. Generates an official date and time stamp (e.g., `Oct 26, 2026 • 10:30 AM`).
  3. Assigns an official batch lot number.
  4. Moves the dose to the **Administered History** ledger.
  5. Updates the patient's compliance score.

---

### 7. Sharing Vaccination Notices to Patients
Click the **"📤 Share"** button on any patient record or scheduled dose:
- **No Contact Saving Required!** You do **not** need to save the patient's phone number into your device contacts:
  - **WhatsApp**: Click the green WhatsApp button to open a new chat with the patient immediately via WhatsApp's direct Click-to-Chat API.
  - **WhatsApp Web**: Click to open a direct chat tab in your desktop browser.
  - **Google Messages / SMS**: Click to open your device's native SMS app with the unsaved recipient and notice pre-filled.
  - **GMail**: Opens a pre-formatted clinical notification email ready to send.
  - **Universal Share**: Opens your phone/tablet's native share menu.

---

## 👤 User Guide: The Patient's Perspective

As a patient or parent, the Patient Portal gives you transparent, 24/7 access to your immunization records and lets you manage your appointments with complete confidence.

```
[Patient Login] ➔ [Digital Health Pass] ➔ [Schedule Appointment] ➔ [Google Calendar Sync] ➔ [Self-Administer]
```

### 1. Your Digital Smart Health Pass
When you log in, your personal Digital Pass displays:
- **Medical Record Number (MRN)** and primary clinic.
- **Dynamic Age**: Calculated precisely from your Date of Birth (e.g. `Pediatric (3y)` or `Adult (24y)`).
- **Blood Group & Allergies**: Critical health alerts prominently displayed.
- **Overall Compliance Score**: Progress meter showing your vaccination completeness (e.g. `100% Complete`).

---

### 2. Scheduling a New Vaccine Appointment
Want to schedule a routine booster, seasonal flu shot, or travel vaccine?
1. Click **"➕ Schedule New Vaccine"** on your dashboard.
2. Select or type the vaccine name and dose.
3. Pick your preferred appointment date and time.
4. Select your clinic or health facility.
5. Add optional notes (e.g., "Egg allergy formulation needed").
6. Click **"Confirm & Add Vaccine Appointment"**.

---

### 3. Adding 1-Click Reminders to Google Calendar
Never forget a vaccination appointment:
- On any upcoming scheduled vaccine card, click the **"Add to Google Calendar"** button (with the official Google Calendar icon).
- A new Google Calendar event opens automatically with:
  - The exact start and end times pre-calculated.
  - Event title: `💉 Vaccination Appointment: [Vaccine Name]`.
  - Clinic address pre-filled as the location.
  - Notes reminding you to bring your digital health pass.
- Simply click **"Save"** in Google Calendar!

---

### 4. What Happens if You Miss an Appointment? (🚨 Overdue Alert)
- If your scheduled appointment date and time have passed and you have not confirmed taking the shot, the application **does not assume you took it**.
- Instead, it moves the appointment into a dedicated **🚨 Overdue Vaccines (Scheduled Time Has Passed)** section.
- The card pulses with a **neon red glowing alert light**, letting you know immediate action is required.
- You have two direct options:
  1. **"💉 Administer Dose"**: If you already took the vaccine (e.g. at a walk-in clinic), click this button to record it.
  2. **"✏️ Reschedule / Edit"**: Click to pick a new date and time that fits your schedule.

---

### 5. How to Administer a Vaccine (Recording Your Shot)
When you receive your vaccine:
1. Find the vaccine under your Scheduled or Overdue section.
2. Click the green **"💉 Administer Dose"** button.
3. A confirmation dialog appears asking you to confirm administration.
4. Click **"OK"**.
5. The vaccine instantly moves from the active schedule into your **📜 Verified Administered Vaccines (Completed History)** table with an official timestamp, clinician credit, and verified EHR status!

---

### 6. Rescheduling or Cancelling Appointments
- **To Reschedule**: Click **"✏️ Reschedule / Edit"** on any upcoming dose card, adjust the date, time, clinic, or notes, and save.
- **To Cancel**: Click **"🗑️ Cancel Appointment"** and confirm. The appointment is removed from both your portal and your doctor's schedule.

---

## 🌟 Key Feature Breakdown

### 📱 Zero-Contact WhatsApp & SMS Direct Chat
- **The Problem in Healthcare**: Doctors and clinic staff frequently have to send reminders to hundreds of patients, but saving every patient's mobile number into phone contacts is time-consuming and clutters the device address book.
- **Our Solution**: ImmuTrack formats the patient's 10-digit number into international format (with a country code selector like `+91`, `+1`, `+44`) and uses direct deep-linking (`api.whatsapp.com/send/?phone=...` and RFC 5724 `sms:...`). It opens a direct, private chat thread immediately without saving the number.

### 🚨 Pulsing Red Glowing Alert Light for Overdue Recalls
- Overdue vaccines are highlighted with an active glowing red light animation (`@keyframes redAlertPulse`).
- Neon red borders pulse continuously on overdue roster rows, chart modal cards, and patient passes, ensuring missed immunizations are never overlooked.

### 🛡️ Clean Sheet Architecture for New Users
- When a new patient registers on the platform, they start with a completely pristine, empty record sheet tailored strictly to them.
- Demo accounts (`patient@immu-track.org`) retain realistic sample data for instant demonstration and testing.

### 🎨 Soft Neumorphic Medical Aesthetic
- Custom-crafted medical UI combining soft extruded shadows, crisp typography, responsive layout, and distinct color indicators (Teal for healthy compliance, Emerald for verified administration, and Pulsing Red for urgent overdue recalls).

---

## ❓ Frequently Asked Questions (FAQ)

#### Q: Why did my scheduled vaccine move into the "Overdue" section?
> **A:** Vaccines are only marked as completed when someone explicitly clicks the Administer button. If the appointment date and time have passed and you haven't clicked "Administer Dose", the app treats it as overdue to alert you that the shot was missed or needs recording.

#### Q: How do I mark an overdue vaccine as completed?
> **A:** Simply click the green **"💉 Administer Dose"** button on that vaccine card in either the Patient Portal or Doctor Portal. Confirm the prompt, and it will immediately move to the Verified Administered ledger.

#### Q: Do I need to install WhatsApp Web or save contacts to use the share feature?
> **A:** No! Clicking the WhatsApp button directly opens WhatsApp on your phone or computer and starts a chat with the unsaved number. You can also use the SMS button to text without saving contacts.

#### Q: Can I run this without internet access?
> **A:** The backend server and frontend code run locally on your computer. However, an internet connection is needed for the live cloud MongoDB Atlas database connection.

---

## 🛠️ Technology Stack

- **Backend**: Node.js & Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Frontend**: Semantic HTML5 & Vanilla JavaScript
- **Styling**: Vanilla CSS3 with Soft Neumorphic Design System & Keyframe Animations
- **Authentication**: Stateless JSON Web Tokens (JWT) & bcrypt password hashing
- **Deployment**: Ready for Render (`render.yaml` Blueprint included)

---

## 📄 License

This project is licensed under the **MIT License**. You are free to use, modify, and distribute it for clinical, personal, educational, or commercial applications.
