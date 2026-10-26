const express = require('express');
const router = express.Router();
const { User, PatientRecord, AppointmentRequest } = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * Strict 10-digit mobile phone validator and formatter
 * Rejects any number that has more than 10 digits or less than 10 digits.
 */
function validate10DigitPhone(phoneStr) {
  if (!phoneStr || String(phoneStr).trim() === '') {
    return { valid: true, value: '' };
  }
  const digits = String(phoneStr).replace(/\D/g, '');
  if (digits.length > 10) {
    return {
      valid: false,
      message: `Invalid mobile number: Entered number contains ${digits.length} digits. Mobile numbers must be exactly 10 digits. Higher digits are not allowed.`
    };
  }
  if (digits.length < 10) {
    return {
      valid: false,
      message: `Invalid mobile number: Entered number contains ${digits.length} digits. Mobile numbers must be exactly 10 digits.`
    };
  }
  return {
    valid: true,
    value: digits, // Normal 10-digit representation: e.g. "9876543210"
    rawDigits: digits
  };
}

function format10DigitPhone(phoneStr) {
  const result = validate10DigitPhone(phoneStr);
  return result.valid ? result.value : '';
}

// Comprehensive Clinical Patient Seed with Demographics & Detailed Vaccine History
const SEED_PATIENT_RECORDS = [
  {
    id: 'pat-chen-liam',
    fullName: 'Chen, Liam',
    mrn: 'MRN-LIAM-CHEN',
    gender: 'Male',
    bloodGroup: 'O+',
    dob: '2026-04-22',
    ageDisplay: '5m 28d',
    phone: '5552348901',
    email: 'chen.family@gmail.com',
    emergencyContact: 'Chen, Wei (Father) • 5552348900',
    address: '842 Summit Ave E, Seattle, WA 98102',
    insurance: 'Premera BlueCross • ID #WA-904128',
    gestationalAge: '34w GA (Premature)',
    allergies: 'Egg protein (mild)',
    riskFactors: 'Premature (34w GA)',
    protocol: 'CDC',
    compliancePercent: 44,
    dosesCount: '4/9',
    vaccineName: 'RotaTeq (RV5) / Rotarix (RV1)',
    doseNumber: 'Dose 2',
    status: 'Overdue',
    scheduledTimestamp: '2026-10-18T10:30:00Z',
    scheduledDateDisplay: 'Oct 18, 2026 • 10:30 AM (Lapsed 2d)',
    doctorAssigned: 'Dr. Sarah Jenkins, MD, FAAP',
    clinicAssigned: 'Swedish Medical Center — Pediatric Specialty Clinic',
    
    // Detailed Administered Vaccines
    administeredVaccines: [
      {
        id: 'adm-lc-1',
        vaccine: 'Hepatitis B (Recombivax HB)',
        disease: 'Hepatitis B',
        dose: 'Dose 1 (Birth Dose)',
        administeredDate: 'Apr 23, 2026 • 09:30 AM',
        lotNumber: 'LOT-HB-8921B',
        siteRoute: 'Right Anterolateral Thigh (IM)',
        clinician: 'Dr. Sarah Jenkins',
        facility: 'Swedish Medical Center — L&D Unit',
        status: 'Administered'
      },
      {
        id: 'adm-lc-2',
        vaccine: 'Infanrix (DTaP)',
        disease: 'Diphtheria, Tetanus, Pertussis',
        dose: 'Dose 1 (2 Months)',
        administeredDate: 'Jun 20, 2026 • 10:15 AM',
        lotNumber: 'LOT-DT-4122C',
        siteRoute: 'Left Anterolateral Thigh (IM)',
        clinician: 'Dr. Sarah Jenkins',
        facility: 'Swedish Medical Center — Pediatric Clinic',
        status: 'Administered'
      },
      {
        id: 'adm-lc-3',
        vaccine: 'Prevnar 20 (PCV20)',
        disease: 'Pneumococcal Disease',
        dose: 'Dose 1 (2 Months)',
        administeredDate: 'Jun 20, 2026 • 10:20 AM',
        lotNumber: 'LOT-PV-7781A',
        siteRoute: 'Right Anterolateral Thigh (IM)',
        clinician: 'Dr. Sarah Jenkins',
        facility: 'Swedish Medical Center — Pediatric Clinic',
        status: 'Administered'
      },
      {
        id: 'adm-lc-4',
        vaccine: 'ActHIB (Hib-PRP-T)',
        disease: 'Haemophilus influenzae type b',
        dose: 'Dose 1 (2 Months)',
        administeredDate: 'Jun 20, 2026 • 10:25 AM',
        lotNumber: 'LOT-HB-3301E',
        siteRoute: 'Left Anterolateral Thigh (IM)',
        clinician: 'Dr. Sarah Jenkins',
        facility: 'Swedish Medical Center — Pediatric Clinic',
        status: 'Administered'
      }
    ],

    // Detailed Pending Schedule
    pendingVaccines: [
      {
        id: 'pen-lc-1',
        vaccine: 'RotaTeq (RV5) / Rotarix (RV1)',
        disease: 'Rotavirus Gastroenteritis',
        dose: 'Dose 2 (4 Months)',
        scheduledDisplay: 'Oct 18, 2026 • 10:30 AM (Lapsed 2d)',
        status: 'Overdue',
        siteRoute: 'Oral Suspension (PO)',
        urgency: 'Action Required — 2 days overdue',
        contraindications: 'Severe Combined Immunodeficiency (SCID), Intussusception history'
      },
      {
        id: 'pen-lc-2',
        vaccine: 'Infanrix (DTaP)',
        disease: 'Diphtheria, Tetanus, Pertussis',
        dose: 'Dose 2 (4 Months)',
        scheduledDisplay: 'Oct 28, 2026 • 11:00 AM',
        status: 'Upcoming',
        siteRoute: 'Left Anterolateral Thigh (IM)',
        urgency: 'Scheduled in 10 days',
        contraindications: 'Encephalopathy within 7 days of previous dose'
      },
      {
        id: 'pen-lc-3',
        vaccine: 'Prevnar 20 (PCV20)',
        disease: 'Pneumococcal Disease',
        dose: 'Dose 2 (4 Months)',
        scheduledDisplay: 'Oct 28, 2026 • 11:00 AM',
        status: 'Upcoming',
        siteRoute: 'Right Anterolateral Thigh (IM)',
        urgency: 'Scheduled in 10 days',
        contraindications: 'Severe allergic reaction to diphtheria toxoid'
      },
      {
        id: 'pen-lc-4',
        vaccine: 'ActHIB (Hib)',
        disease: 'Haemophilus influenzae type b',
        dose: 'Dose 2 (4 Months)',
        scheduledDisplay: 'Oct 28, 2026 • 11:00 AM',
        status: 'Upcoming',
        siteRoute: 'Left Anterolateral Thigh (IM)',
        urgency: 'Scheduled in 10 days',
        contraindications: 'Age under 6 weeks'
      },
      {
        id: 'pen-lc-5',
        vaccine: 'IPOL (Inactivated Polio)',
        disease: 'Poliomyelitis',
        dose: 'Dose 2 (4 Months)',
        scheduledDisplay: 'Oct 28, 2026 • 11:00 AM',
        status: 'Upcoming',
        siteRoute: 'Right Anterolateral Thigh (IM)',
        urgency: 'Scheduled in 10 days',
        contraindications: 'Severe hypersensitivity to neomycin, streptomycin'
      }
    ],

    clinicalAlerts: [
      '⚠️ Overdue recall: RotaTeq Dose 2 missed by 2 days. Contact parent for priority reschedule.',
      'ℹ️ Preterm infant protocol (34w GA) — monitored for apnea post-administration.'
    ],

    complianceMilestones: [
      { name: 'Birth Dose HepB', achieved: true, date: 'Apr 23, 2026' },
      { name: '2-Month Primary Series', achieved: true, date: 'Jun 20, 2026' },
      { name: '4-Month Primary Series', achieved: false, date: 'Oct 18, 2026 (Pending)' },
      { name: '6-Month Comprehensive', achieved: false, date: 'Dec 22, 2026 (Upcoming)' }
    ]
  },

  {
    id: 'pat-okafor-amara',
    fullName: 'Okafor, Amara',
    mrn: 'MRN-AMARA-OKAFOR',
    gender: 'Female',
    bloodGroup: 'B+',
    dob: '2025-08-14',
    ageDisplay: '1y 2m 6d',
    phone: '5554127890',
    email: 'amara.okafor@gmail.com',
    emergencyContact: 'Okafor, Chidi (Father) • 5554127899',
    address: '1520 11th Ave, Seattle, WA 98122',
    insurance: 'Molina Healthcare • ID #WA-440192',
    gestationalAge: '39w GA (Full Term)',
    allergies: 'None reported',
    riskFactors: 'Sickle cell trait',
    protocol: 'CDC',
    compliancePercent: 88,
    dosesCount: '15/17',
    vaccineName: 'M-M-R II + Varivax (MMR-V)',
    doseNumber: 'Dose 1 (12-15m)',
    status: 'Scheduled Today',
    scheduledTimestamp: new Date().toISOString(),
    scheduledDateDisplay: 'Today • 02:00 PM',
    doctorAssigned: 'Dr. Sarah Jenkins, MD, FAAP',
    clinicAssigned: 'Swedish Medical Center — Pediatric Specialty Clinic',

    administeredVaccines: [
      { id: 'adm-ao-1', vaccine: 'Hepatitis B', dose: 'Dose 1 (Birth)', administeredDate: 'Aug 14, 2025', clinician: 'Dr. S. Jenkins', status: 'Administered' },
      { id: 'adm-ao-2', vaccine: 'DTaP (Infanrix)', dose: 'Dose 1 (2m)', administeredDate: 'Oct 15, 2025', clinician: 'Dr. S. Jenkins', status: 'Administered' },
      { id: 'adm-ao-3', vaccine: 'PCV20 (Prevnar)', dose: 'Dose 1 (2m)', administeredDate: 'Oct 15, 2025', clinician: 'Dr. S. Jenkins', status: 'Administered' },
      { id: 'adm-ao-4', vaccine: 'Hib (ActHIB)', dose: 'Dose 1 (2m)', administeredDate: 'Oct 15, 2025', clinician: 'Dr. S. Jenkins', status: 'Administered' },
      { id: 'adm-ao-5', vaccine: 'Rotavirus (RotaTeq)', dose: 'Dose 1 (2m)', administeredDate: 'Oct 15, 2025', clinician: 'Dr. S. Jenkins', status: 'Administered' },
      { id: 'adm-ao-6', vaccine: 'IPV (Polio)', dose: 'Dose 1 (2m)', administeredDate: 'Oct 15, 2025', clinician: 'Dr. S. Jenkins', status: 'Administered' },
      { id: 'adm-ao-7', vaccine: 'DTaP (Infanrix)', dose: 'Dose 2 (4m)', administeredDate: 'Dec 18, 2025', clinician: 'Dr. S. Jenkins', status: 'Administered' },
      { id: 'adm-ao-8', vaccine: 'PCV20', dose: 'Dose 2 (4m)', administeredDate: 'Dec 18, 2025', clinician: 'Dr. S. Jenkins', status: 'Administered' },
      { id: 'adm-ao-9', vaccine: 'Hib', dose: 'Dose 2 (4m)', administeredDate: 'Dec 18, 2025', clinician: 'Dr. S. Jenkins', status: 'Administered' },
      { id: 'adm-ao-10', vaccine: 'Rotavirus', dose: 'Dose 2 (4m)', administeredDate: 'Dec 18, 2025', clinician: 'Dr. S. Jenkins', status: 'Administered' },
      { id: 'adm-ao-11', vaccine: 'IPV', dose: 'Dose 2 (4m)', administeredDate: 'Dec 18, 2025', clinician: 'Dr. S. Jenkins', status: 'Administered' },
      { id: 'adm-ao-12', vaccine: 'DTaP', dose: 'Dose 3 (6m)', administeredDate: 'Feb 20, 2026', clinician: 'Dr. S. Jenkins', status: 'Administered' },
      { id: 'adm-ao-13', vaccine: 'PCV20', dose: 'Dose 3 (6m)', administeredDate: 'Feb 20, 2026', clinician: 'Dr. S. Jenkins', status: 'Administered' },
      { id: 'adm-ao-14', vaccine: 'Hib', dose: 'Dose 3 (6m)', administeredDate: 'Feb 20, 2026', clinician: 'Dr. S. Jenkins', status: 'Administered' },
      { id: 'adm-ao-15', vaccine: 'Hepatitis B', dose: 'Dose 3 (6m)', administeredDate: 'Feb 20, 2026', clinician: 'Dr. S. Jenkins', status: 'Administered' }
    ],

    pendingVaccines: [
      {
        id: 'pen-ao-1',
        vaccine: 'M-M-R II (Measles, Mumps, Rubella)',
        disease: 'Measles, Mumps, Rubella',
        dose: 'Dose 1 (12 Months)',
        scheduledDisplay: 'Today • 02:00 PM',
        status: 'Scheduled',
        siteRoute: 'Subcutaneous (Deltoid)',
        urgency: 'Scheduled appointment today',
        contraindications: 'Severe immunodeficiency, pregnancy'
      },
      {
        id: 'pen-ao-2',
        vaccine: 'Varivax (Varicella)',
        disease: 'Chickenpox',
        dose: 'Dose 1 (12 Months)',
        scheduledDisplay: 'Today • 02:00 PM',
        status: 'Scheduled',
        siteRoute: 'Subcutaneous (Deltoid)',
        urgency: 'Scheduled appointment today',
        contraindications: 'History of anaphylaxis to gelatin or neomycin'
      }
    ],

    clinicalAlerts: [
      '✅ Due today for 1-Year MMR and Varicella immunization. Parents arrived in clinic lobby.',
      'ℹ️ High compliance (88%). No clinical contraindications recorded.'
    ],

    complianceMilestones: [
      { name: 'Birth Dose', achieved: true, date: 'Aug 14, 2025' },
      { name: '2-Month Doses', achieved: true, date: 'Oct 15, 2025' },
      { name: '4-Month Doses', achieved: true, date: 'Dec 18, 2025' },
      { name: '6-Month Doses', achieved: true, date: 'Feb 20, 2026' },
      { name: '12-Month Live Vaccines', achieved: false, date: 'Today (In Progress)' }
    ]
  },

  {
    id: 'pat-novak-sofia',
    fullName: 'Novak, Sofia',
    mrn: 'MRN-SOFIA-NOVAK',
    gender: 'Female',
    bloodGroup: 'A-',
    dob: '2024-11-05',
    ageDisplay: '1y 11m 15d',
    phone: '5559871234',
    email: 'leo.novak@gmail.com',
    emergencyContact: 'Novak, Elena (Mother) • 5559871230',
    address: '405 Olive Way, Apt 12A, Seattle, WA 98101',
    insurance: 'Kaiser Permanente • ID #WA-771920',
    gestationalAge: '40w GA',
    allergies: 'Latex (mild rash)',
    riskFactors: 'Asthma (reactive airway)',
    protocol: 'CDC',
    compliancePercent: 100,
    dosesCount: '19/19',
    vaccineName: 'Annual Influenza (Fluzone High-Dose)',
    doseNumber: '2026-2027 Season',
    status: 'Administered',
    scheduledTimestamp: '2026-10-14T09:00:00Z',
    scheduledDateDisplay: 'Administered Oct 14, 2026',
    doctorAssigned: 'Dr. Sarah Jenkins, MD, FAAP',
    clinicAssigned: 'Swedish Medical Center — Pediatric Specialty Clinic',

    administeredVaccines: [
      { id: 'adm-sn-1', vaccine: 'Annual Influenza (Fluzone)', dose: '2026-2027 Seasonal', administeredDate: 'Oct 14, 2026 • 09:15 AM', clinician: 'Dr. Sarah Jenkins', status: 'Administered' },
      { id: 'adm-sn-2', vaccine: 'Hepatitis A (Vaqta)', dose: 'Dose 2 (18m)', administeredDate: 'May 10, 2026', clinician: 'Dr. Sarah Jenkins', status: 'Administered' },
      { id: 'adm-sn-3', vaccine: 'DTaP (Infanrix)', dose: 'Dose 4 (15m)', administeredDate: 'Feb 12, 2026', clinician: 'Dr. Sarah Jenkins', status: 'Administered' },
      { id: 'adm-sn-4', vaccine: 'Varivax', dose: 'Dose 1 (12m)', administeredDate: 'Nov 10, 2025', clinician: 'Dr. Sarah Jenkins', status: 'Administered' },
      { id: 'adm-sn-5', vaccine: 'MMR II', dose: 'Dose 1 (12m)', administeredDate: 'Nov 10, 2025', clinician: 'Dr. Sarah Jenkins', status: 'Administered' }
    ],

    pendingVaccines: [],

    clinicalAlerts: [
      '🌟 100% compliant with CDC childhood schedule! Next routine boosters scheduled at age 4 (Kindergarten entry).'
    ],

    complianceMilestones: [
      { name: '12-Month Live Vaccines', achieved: true, date: 'Nov 10, 2025' },
      { name: '15-Month DTaP Booster', achieved: true, date: 'Feb 12, 2026' },
      { name: '18-Month HepA Series', achieved: true, date: 'May 10, 2026' },
      { name: 'Annual Flu 2026', achieved: true, date: 'Oct 14, 2026' }
    ]
  }
];

/**
 * Seed or update MongoDB with rich clinical records for demo doctor
 */
async function ensurePatientRecordsSeeded() {
  try {
    const count = await PatientRecord.countDocuments();
    if (count === 0) {
      console.log('Synchronizing rich clinical patient roster with MongoDB...');
      await PatientRecord.insertMany(SEED_PATIENT_RECORDS);
      console.log('✅ Rich clinical patient roster synchronized in MongoDB.');
    } else {
      // Clean up any legacy +1 formatted phone numbers in existing database records
      const records = await PatientRecord.find({});
      for (const r of records) {
        let changed = false;
        if (r.phone && r.phone.includes('+1')) {
          r.phone = r.phone.replace(/\D/g, '').slice(-10);
          changed = true;
        }
        if (r.emergencyContact && r.emergencyContact.includes('+1')) {
          r.emergencyContact = r.emergencyContact
            .replace(/\+1\s*\(([0-9]{3})\)\s*([0-9]{3})-([0-9]{4})/g, '$1$2$3')
            .replace(/\+1\s*([0-9]{10})/g, '$1');
          changed = true;
        }
        const seedMatch = SEED_PATIENT_RECORDS.find(s => s.id === r.id);
        if (seedMatch && seedMatch.email && (!r.email || r.email === '')) {
          r.email = seedMatch.email;
          changed = true;
        }
        if (changed) await r.save();
      }
    }
  } catch (err) {
    console.error('Seed patient records error:', err.message);
  }
}

// Seed upon module load
ensurePatientRecordsSeeded();

/**
 * Dynamic age calculation helper based on current timestamp
 * Returns age in years/months and category: Pediatric (<18) vs Adult (>=18)
 */
function calculatePatientAge(dobInput) {
  if (!dobInput) return { ageYears: null, ageDisplay: 'N/A', category: 'Patient', isPediatric: false };
  const dob = new Date(dobInput);
  if (isNaN(dob.getTime())) return { ageYears: null, ageDisplay: 'N/A', category: 'Patient', isPediatric: false };

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  const d = now.getDate() - dob.getDate();
  if (m < 0 || (m === 0 && d < 0)) {
    age--;
  }
  const isPediatric = age < 18;
  let ageDisplay = `${age}y`;
  if (age === 0) {
    let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    if (d < 0) months--;
    ageDisplay = `${Math.max(0, months)}m`;
  }
  const category = isPediatric ? (age === 0 ? `Pediatric (${ageDisplay})` : `Pediatric (${age}y)`) : `Adult (${age}y)`;

  return { ageYears: age, ageDisplay, category, isPediatric };
}

/**
 * Helper: Determine if a scheduled vaccine dose is past its scheduled date and time
 * In VaccineScheduler, a vaccine is ONLY marked 'Administered' when explicitly confirmed
 * by clicking the Administer button. If the scheduled time has passed and it is still not administered,
 * it automatically moves to the Overdue status and section.
 */
function isDoseOverdue(dose, now = new Date()) {
  if (!dose) return false;
  if (dose.status === 'Administered') return false;
  if (dose.status === 'Overdue') return true;

  // 1. Direct ISO timestamp
  if (dose.scheduledTimestamp) {
    const t = new Date(dose.scheduledTimestamp);
    if (!isNaN(t.getTime())) {
      return t < now;
    }
  }

  // 2. scheduledDate + scheduledTime
  if (dose.scheduledDate) {
    let timeStr = dose.scheduledTime || '23:59';
    let cleanTime = timeStr;
    if (/am|pm/i.test(timeStr)) {
      const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2];
        const isPm = match[3].toLowerCase() === 'pm';
        if (isPm && h < 12) h += 12;
        if (!isPm && h === 12) h = 0;
        cleanTime = `${String(h).padStart(2, '0')}:${m}`;
      }
    }
    if (cleanTime.length === 5) {
      const combined = new Date(`${dose.scheduledDate}T${cleanTime}:00`);
      if (!isNaN(combined.getTime())) {
        return combined < now;
      }
    }
    const dayOnly = new Date(`${dose.scheduledDate}T23:59:59`);
    if (!isNaN(dayOnly.getTime())) {
      return dayOnly < now;
    }
  }

  // 3. scheduledDisplay parsing
  if (dose.scheduledDisplay) {
    if (/lapsed|overdue/i.test(dose.scheduledDisplay)) return true;
    if (dose.scheduledDisplay.includes('Today')) {
      const timeMatch = dose.scheduledDisplay.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let h = parseInt(timeMatch[1], 10);
        const m = parseInt(timeMatch[2], 10);
        const isPm = timeMatch[3].toUpperCase() === 'PM';
        if (isPm && h < 12) h += 12;
        if (!isPm && h === 12) h = 0;
        const target = new Date(now);
        target.setHours(h, m, 0, 0);
        return target < now;
      }
    }
    const cleaned = dose.scheduledDisplay.replace('•', '').replace(/\(.*\)/, '').trim();
    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) {
      return parsed < now;
    }
  }

  return false;
}

/**
 * GET /api/data/patients
 * Fetch all patients for authenticated clinician
 * Demo doctor sees demo patients; newly registered doctors only see their own added patients.
 */
router.get('/patients', verifyToken, async (req, res) => {
  try {
    const isDemoDoctor = (req.user.email || '').toLowerCase() === 'doctor@immu-track.org' || req.user.uid === 'demo-doctor-01';

    let rawPatients;
    if (isDemoDoctor) {
      rawPatients = await PatientRecord.find().lean();
    } else {
      rawPatients = await PatientRecord.find({ doctorId: req.user.uid }).lean();
    }

    // Only demo doctor falls back to SEED_PATIENT_RECORDS if empty
    const rawRoster = isDemoDoctor && rawPatients.length === 0 ? SEED_PATIENT_RECORDS : rawPatients;
    const now = new Date();

    const roster = rawRoster.map(p => {
      const cleanP = { ...p };
      delete cleanP._id;
      delete cleanP.__v;

      // Dynamically evaluate overdue status for pending vaccines
      let pendingList = Array.isArray(cleanP.pendingVaccines) ? cleanP.pendingVaccines.map(d => {
        if (d.status !== 'Administered' && isDoseOverdue(d, now)) {
          return {
            ...d,
            status: 'Overdue',
            urgency: d.urgency && d.urgency.toLowerCase().includes('overdue') ? d.urgency : 'Action Required — Overdue'
          };
        }
        return d;
      }) : [];
      cleanP.pendingVaccines = pendingList;

      // Overall patient status: if not Administered, flag Overdue if pending doses or scheduled date/time has passed
      const hasOverduePending = pendingList.some(d => d.status === 'Overdue');
      const isOverallPassed = isDoseOverdue({
        scheduledTimestamp: cleanP.scheduledTimestamp,
        scheduledDisplay: cleanP.scheduledDateDisplay,
        status: cleanP.status
      }, now);

      if ((hasOverduePending || isOverallPassed) && cleanP.status !== 'Administered') {
        cleanP.status = 'Overdue';
      }

      if (cleanP.dob) {
        const ageCalc = calculatePatientAge(cleanP.dob);
        return {
          ...cleanP,
          ageYears: ageCalc.ageYears,
          ageDisplay: ageCalc.ageDisplay,
          cohortCategory: ageCalc.category
        };
      }
      return cleanP;
    });

    const totalCaseload = roster.length;
    const administeredCount = roster.filter(p => p.status === 'Administered').length;
    const overdueCount = roster.filter(p => p.status === 'Overdue').length;
    const complianceRate = totalCaseload > 0 ? `${Math.round((administeredCount / totalCaseload) * 100)}%` : '0%';

    return res.json({
      success: true,
      patients: roster,
      stats: {
        totalCaseload,
        complianceRate,
        overdueRecalls: overdueCount,
        highRiskCount: roster.filter(p => p.riskFactors && p.riskFactors !== 'None').length,
        scheduledToday: roster.filter(p => p.scheduledDateDisplay && p.scheduledDateDisplay.includes('Today')).length
      }
    });
  } catch (err) {
    console.error('Fetch patients error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch patients list.' });
  }
});

/**
 * GET /api/data/patients/:id/chart
 * Fetch a single patient's complete clinical chart with demographics and vaccines
 */
router.get('/patients/:id/chart', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const rawPatient = await PatientRecord.findOne({ id }).lean();

    if (!rawPatient) {
      return res.status(404).json({ success: false, message: 'Patient record not found.' });
    }

    delete rawPatient._id;
    delete rawPatient.__v;

    const now = new Date();
    // Dynamic Overdue evaluation for pending vaccines
    let pendingList = Array.isArray(rawPatient.pendingVaccines) ? rawPatient.pendingVaccines.map(d => {
      if (d.status !== 'Administered' && isDoseOverdue(d, now)) {
        return {
          ...d,
          status: 'Overdue',
          urgency: d.urgency && d.urgency.toLowerCase().includes('overdue') ? d.urgency : 'Action Required — Overdue'
        };
      }
      return d;
    }) : [];

    rawPatient.pendingVaccines = pendingList;
    const hasOverdue = pendingList.some(d => d.status === 'Overdue');
    if (hasOverdue && rawPatient.status !== 'Administered') {
      rawPatient.status = 'Overdue';
    }

    const ageCalc = calculatePatientAge(rawPatient.dob);
    const patient = {
      ...rawPatient,
      ageYears: ageCalc.ageYears,
      ageDisplay: ageCalc.ageDisplay,
      cohortCategory: ageCalc.category
    };
    return res.json({ success: true, patient });
  } catch (err) {
    console.error('Fetch chart error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/data/patients/administer-vaccine
 * Administers a specific pending vaccine from the patient's chart, logs timestamp & moves to administered list
 */
router.post('/patients/administer-vaccine', verifyToken, async (req, res) => {
  try {
    const { patientId, pendingVaccineId, lotNumber, siteRoute } = req.body;
    if (!patientId || !pendingVaccineId) {
      return res.status(400).json({ success: false, message: 'patientId and pendingVaccineId are required.' });
    }

    const patient = await PatientRecord.findOne({ id: patientId });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found.' });
    }

    const pendingList = Array.isArray(patient.pendingVaccines) ? patient.pendingVaccines : [];
    const administeredList = Array.isArray(patient.administeredVaccines) ? patient.administeredVaccines : [];

    // Find the pending vaccine
    const index = pendingList.findIndex(p => p.id === pendingVaccineId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Pending vaccine dose not found.' });
    }

    const targetVaccine = pendingList[index];
    pendingList.splice(index, 1);

    const now = new Date();
    const formattedTimestamp = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' • ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Create new administered record
    const newlyAdministered = {
      id: `adm-${Date.now()}`,
      vaccine: targetVaccine.vaccine,
      disease: targetVaccine.disease || targetVaccine.vaccine,
      dose: targetVaccine.dose,
      administeredDate: formattedTimestamp,
      lotNumber: lotNumber || `LOT-${Math.floor(1000 + Math.random() * 9000)}-${now.getFullYear()}`,
      siteRoute: siteRoute || targetVaccine.siteRoute || 'Intramuscular (Deltoid)',
      clinician: req.user.fullName || 'Dr. Sarah Jenkins, MD, FAAP',
      facility: patient.clinicAssigned || 'Swedish Medical Center — Pediatric Specialty Clinic',
      status: 'Administered'
    };

    administeredList.unshift(newlyAdministered);

    // Recalculate status and compliance
    const totalDoses = administeredList.length + pendingList.length;
    const newCompliance = totalDoses > 0 ? Math.round((administeredList.length / totalDoses) * 100) : 100;
    const hasRemainingOverdue = pendingList.some(p => p.status === 'Overdue');
    const newStatus = hasRemainingOverdue ? 'Overdue' : (pendingList.length > 0 ? 'Scheduled' : 'Administered');

    patient.pendingVaccines = pendingList;
    patient.administeredVaccines = administeredList;
    patient.compliancePercent = newCompliance;
    patient.dosesCount = `${administeredList.length}/${totalDoses}`;
    patient.status = newStatus;
    patient.scheduledDateDisplay = pendingList.length > 0 ? pendingList[0].scheduledDisplay : `All Up-to-Date • ${formattedTimestamp}`;
    patient.vaccineName = pendingList.length > 0 ? pendingList[0].vaccine : newlyAdministered.vaccine;
    patient.doseNumber = pendingList.length > 0 ? pendingList[0].dose : newlyAdministered.dose;
    patient.lastAdministeredAt = now;

    patient.markModified('pendingVaccines');
    patient.markModified('administeredVaccines');
    await patient.save();

    const cleanPatient = patient.toObject ? patient.toObject() : { ...patient };
    delete cleanPatient._id;
    delete cleanPatient.__v;

    return res.json({
      success: true,
      message: `${targetVaccine.vaccine} (${targetVaccine.dose}) successfully administered and recorded in patient chart!`,
      patient: cleanPatient
    });
  } catch (err) {
    console.error('Administer specific vaccine error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/data/patients/record-dose (quick row action)
 */
router.post('/patients/record-dose', verifyToken, async (req, res) => {
  try {
    const { patientId } = req.body;
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'patientId is required.' });
    }

    const patient = await PatientRecord.findOne({ id: patientId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const pendingList = Array.isArray(patient.pendingVaccines) ? patient.pendingVaccines : [];
    const administeredList = Array.isArray(patient.administeredVaccines) ? patient.administeredVaccines : [];

    const now = new Date();
    const timeFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' • ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (pendingList.length > 0) {
      const topPending = pendingList.shift();
      administeredList.unshift({
        id: `adm-${Date.now()}`,
        vaccine: topPending.vaccine,
        disease: topPending.disease || topPending.vaccine,
        dose: topPending.dose,
        administeredDate: timeFormatted,
        lotNumber: `LOT-CLINIC-${Math.floor(1000 + Math.random() * 9000)}`,
        siteRoute: topPending.siteRoute || 'Intramuscular',
        clinician: req.user.fullName || 'Dr. Sarah Jenkins',
        facility: 'Swedish Medical Center',
        status: 'Administered'
      });
    }

    const hasOverdue = pendingList.some(p => p.status === 'Overdue');
    const newStatus = hasOverdue ? 'Overdue' : (pendingList.length > 0 ? 'Scheduled' : 'Administered');

    patient.status = newStatus;
    patient.pendingVaccines = pendingList;
    patient.administeredVaccines = administeredList;
    patient.scheduledDateDisplay = pendingList.length > 0 ? pendingList[0].scheduledDisplay : `Administered ${timeFormatted}`;
    patient.lastAdministeredAt = now;

    patient.markModified('pendingVaccines');
    patient.markModified('administeredVaccines');
    await patient.save();

    return res.json({
      success: true,
      message: `Vaccine dose successfully logged in patient chart at ${timeFormatted}!`,
      updatedDisplay: `Administered ${timeFormatted}`
    });
  } catch (err) {
    console.error('Record dose error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/data/patients/schedule-new
 * Schedules a new vaccine dose for an existing patient OR enrolls a new patient for the doctor
 */
router.post('/patients/schedule-new', verifyToken, async (req, res) => {
  try {
    const {
      patientId,
      fullName,
      dob,
      gender,
      bloodGroup,
      allergies,
      phone,
      email,
      emergencyContact,
      vaccineName,
      doseNumber,
      vaccineDescription,
      scheduledDate,
      scheduledTime
    } = req.body;

    if (!vaccineName || !scheduledDate) {
      return res.status(400).json({ success: false, message: 'Vaccine name and scheduled date are required.' });
    }

    const formattedDate = new Date(`${scheduledDate}T${scheduledTime || '10:00'}:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ` • ${scheduledTime || '10:00 AM'}`;

    // CASE 1: Scheduling a dose for an EXISTING PATIENT (e.g. from Open Chart modal)
    if (patientId) {
      const patient = await PatientRecord.findOne({ id: patientId });

      if (email && (!patient.email || patient.email === '')) {
        patient.email = email.trim().toLowerCase();
      }

      const pendingList = Array.isArray(patient.pendingVaccines) ? [...patient.pendingVaccines] : [];
      const administeredList = Array.isArray(patient.administeredVaccines) ? [...patient.administeredVaccines] : [];

      const newPendingDose = {
        id: `pen-${Date.now()}`,
        vaccine: vaccineName,
        disease: vaccineDescription ? `${vaccineName} (${vaccineDescription})` : vaccineName,
        description: vaccineDescription || '',
        dose: doseNumber || 'Routine Dose',
        scheduledDisplay: formattedDate,
        status: 'Scheduled',
        siteRoute: 'Intramuscular (Deltoid)',
        urgency: 'Scheduled appointment',
        contraindications: allergies || patient.allergies || 'None'
      };

      pendingList.push(newPendingDose);
      const totalDoses = administeredList.length + pendingList.length;
      const compliancePercent = totalDoses > 0 ? Math.round((administeredList.length / totalDoses) * 100) : 0;
      const hasRemainingOverdue = pendingList.some(p => p.status === 'Overdue');
      const newStatus = hasRemainingOverdue ? 'Overdue' : 'Scheduled';

      patient.pendingVaccines = pendingList;
      patient.vaccineName = vaccineName;
      patient.doseNumber = doseNumber || 'Routine Dose';
      patient.status = newStatus;
      patient.scheduledDateDisplay = formattedDate;
      patient.scheduledTimestamp = new Date(`${scheduledDate}T${scheduledTime || '10:00'}:00`).toISOString();
      patient.compliancePercent = compliancePercent;
      patient.dosesCount = `${administeredList.length}/${totalDoses}`;

      patient.markModified('pendingVaccines');
      await patient.save();

      const cleanPatient = patient.toObject ? patient.toObject() : { ...patient };
      delete cleanPatient._id;
      delete cleanPatient.__v;

      return res.status(200).json({
        success: true,
        message: `${vaccineName} (${doseNumber || 'Routine Dose'}) successfully scheduled for ${patient.fullName}!`,
        patient: cleanPatient
      });
    }

    // CASE 2: Enrolling and scheduling a BRAND NEW PATIENT for this Doctor
    if (!fullName || fullName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Patient name is required when adding a new patient.' });
    }

    // Strict 10-digit mobile number validation
    if (phone && String(phone).trim() !== '') {
      const pVal = validate10DigitPhone(phone);
      if (!pVal.valid) {
        return res.status(400).json({ success: false, message: pVal.message });
      }
    }

    const docId = `pat-${fullName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const cleanPhone = phone ? format10DigitPhone(phone) : 'Not provided';

    const newRecord = {
      id: docId,
      doctorId: req.user.uid,
      doctorAssigned: req.user.fullName || 'Attending Physician',
      fullName: fullName.trim(),
      mrn: `MRN-${fullName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8) || 'PAT'}-${Math.floor(100 + Math.random() * 900)}`,
      gender: gender || 'Other',
      bloodGroup: bloodGroup || 'O+',
      dob: dob || null,
      ageDisplay: dob ? calculatePatientAge(dob).ageDisplay : 'Calculated at intake',
      phone: cleanPhone,
      email: email ? String(email).trim().toLowerCase() : '',
      emergencyContact: emergencyContact && emergencyContact.trim() !== '' ? emergencyContact.trim() : 'Not provided',
      address: 'Not provided',
      insurance: 'Not provided',
      allergies: allergies && allergies.trim() !== '' ? allergies.trim() : 'None documented',
      riskFactors: 'None',
      protocol: 'CDC',
      compliancePercent: 0,
      dosesCount: '0/1',
      vaccineName,
      doseNumber: doseNumber || 'Dose 1',
      status: 'Scheduled',
      scheduledTimestamp: new Date(`${scheduledDate}T${scheduledTime || '10:00'}:00`).toISOString(),
      scheduledDateDisplay: formattedDate,
      clinicAssigned: req.user.doctorDetails?.hospital || 'Clinical Immunization Center',
      administeredVaccines: [],
      pendingVaccines: [
        {
          id: `pen-${Date.now()}`,
          vaccine: vaccineName,
          disease: vaccineDescription ? `${vaccineName} (${vaccineDescription})` : vaccineName,
          description: vaccineDescription || '',
          dose: doseNumber || 'Dose 1',
          scheduledDisplay: formattedDate,
          status: 'Scheduled',
          siteRoute: 'Intramuscular (Deltoid)',
          urgency: 'Scheduled slot',
          contraindications: allergies || 'None'
        }
      ]
    };

    const createdRecord = await PatientRecord.create(newRecord);
    const cleanCreated = createdRecord.toObject ? createdRecord.toObject() : { ...createdRecord };
    delete cleanCreated._id;
    delete cleanCreated.__v;

    return res.status(201).json({
      success: true,
      message: `Patient ${fullName} successfully added and appointment scheduled!`,
      patient: cleanCreated
    });
  } catch (err) {
    console.error('Schedule patient error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/data/patient-me
 * Returns authenticated patient's profile, full demographic details, allergies, medical conditions,
 * upcoming vaccines with dates/times, and completed vaccination ledger from MongoDB.
 * Scoped strictly to authenticated user; preserves clean sheet (0 records) for new users.
 */
router.get('/patient-me', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    const userData = user ? user.toObject() : req.user;
    const patientDetails = userData.patientDetails || {};

    const isDemoPatient = (userData.email || '').toLowerCase() === 'patient@immu-track.org';

    const defaultUpcoming = [
      {
        id: 'dose-up-01',
        vaccine: 'MMR Booster (Measles, Mumps, Rubella)',
        disease: 'Measles, Mumps, Rubella',
        dose: 'Dose 2 Booster',
        scheduledDate: '2026-11-02',
        scheduledTime: '10:30',
        scheduledDisplay: 'Nov 02, 2026 • 10:30 AM',
        clinic: 'Swedish Medical Center — Pediatric Specialty Clinic',
        doctor: 'Dr. Sarah Jenkins, MD, FAAP',
        siteRoute: 'Subcutaneous (Deltoid)',
        status: 'Confirmed Appointment',
        notes: 'Annual immunity surveillance. Patient should bring digital pass.'
      },
      {
        id: 'dose-up-02',
        vaccine: 'Annual Influenza Quadrivalent (Fluarix)',
        disease: 'Influenza Types A & B',
        dose: 'Seasonal Booster (2026-2027)',
        scheduledDate: '2026-12-15',
        scheduledTime: '14:00',
        scheduledDisplay: 'Dec 15, 2026 • 02:00 PM',
        clinic: 'Swedish Medical Center — Pediatric Specialty Clinic',
        doctor: 'Dr. Sarah Jenkins, MD, FAAP',
        siteRoute: 'Intramuscular (Deltoid)',
        status: 'Scheduled Appointment',
        notes: 'Pre-season respiratory protection. Non-egg based formulation advised.'
      }
    ];

    const defaultCompleted = [
      {
        id: 'dose-adm-01',
        vaccine: 'Hepatitis B (Recombivax HB)',
        disease: 'Hepatitis B Virus',
        dose: 'Dose 3 of 3',
        administeredDate: 'May 14, 2025 • 11:30 AM',
        clinic: 'Metro Children Health & Specialty Center',
        lotNumber: 'LOT-HB-8921B',
        doctor: 'Dr. Sarah Jenkins, MD',
        siteRoute: 'Intramuscular (Right Thigh)',
        status: 'Administered'
      },
      {
        id: 'dose-adm-02',
        vaccine: 'DTaP (Infanrix)',
        disease: 'Diphtheria, Tetanus, Pertussis',
        dose: 'Dose 4 (15-18 Months)',
        administeredDate: 'Aug 22, 2024 • 09:15 AM',
        clinic: 'Metro Children Health & Specialty Center',
        lotNumber: 'LOT-DT-4122C',
        doctor: 'Dr. Sarah Jenkins, MD',
        siteRoute: 'Intramuscular (Left Deltoid)',
        status: 'Administered'
      },
      {
        id: 'dose-adm-03',
        vaccine: 'Polio IPV (IPOL)',
        disease: 'Poliomyelitis',
        dose: 'Dose 3 of 4',
        administeredDate: 'Jan 10, 2024 • 03:45 PM',
        clinic: 'Metro Children Health & Specialty Center',
        lotNumber: 'LOT-PV-1109A',
        doctor: 'Dr. Sarah Jenkins, MD',
        siteRoute: 'Subcutaneous (Arm)',
        status: 'Administered'
      }
    ];

    let upcomingDoses = userData.upcomingDoses;
    let completedHistory = userData.completedHistory;

    if (isDemoPatient) {
      if (!upcomingDoses || !Array.isArray(upcomingDoses) || upcomingDoses.length === 0) {
        upcomingDoses = defaultUpcoming;
        if (user) {
          user.upcomingDoses = defaultUpcoming;
          user.markModified('upcomingDoses');
          await user.save().catch(() => {});
        }
      }
      if (!completedHistory || !Array.isArray(completedHistory) || completedHistory.length === 0) {
        completedHistory = defaultCompleted;
        if (user) {
          user.completedHistory = defaultCompleted;
          user.markModified('completedHistory');
          await user.save().catch(() => {});
        }
      }
    } else {
      // Clean sheet for all non-demo patients: strictly scoped to authenticated user records
      upcomingDoses = Array.isArray(upcomingDoses) ? upcomingDoses : [];
      completedHistory = Array.isArray(completedHistory) ? completedHistory : [];
    }

    const now = new Date();
    // Dynamically evaluate overdue status: if scheduled date/time has passed and not administered, status becomes Overdue
    upcomingDoses = upcomingDoses.map(dose => {
      if (dose.status !== 'Administered' && isDoseOverdue(dose, now)) {
        return {
          ...dose,
          status: 'Overdue',
          isOverdue: true,
          urgency: 'Action Required — Overdue'
        };
      }
      return dose;
    });

    // Dynamic age calculation based on user's actual DOB
    const dobValue = patientDetails.dob || (isDemoPatient ? '2020-03-12' : null);
    const ageCalc = dobValue
      ? calculatePatientAge(dobValue)
      : { ageYears: null, ageDisplay: 'Not provided', category: 'Not provided', isPediatric: false };

    const patientInfo = {
      fullName: userData.fullName || (isDemoPatient ? 'Alex Vance' : ''),
      email: userData.email || '',
      phone: userData.phone || '',
      altPhone: userData.altPhone || patientDetails.altPhone || '',
      mrn: userData.mrn || `MRN-${(userData.uid || req.user.uid || 'PAT').substring(0, 8).toUpperCase()}`,
      dob: dobValue,
      ageYears: ageCalc.ageYears,
      ageDisplay: ageCalc.ageDisplay,
      cohortCategory: ageCalc.category,
      isPediatric: ageCalc.isPediatric,
      bloodGroup: patientDetails.bloodGroup || (isDemoPatient ? 'B+' : ''),
      gender: patientDetails.gender || (isDemoPatient ? 'Male' : ''),
      emergencyContact: patientDetails.emergencyContact || (isDemoPatient ? 'Vance, Eli (Father)' : ''),
      address: patientDetails.address || (isDemoPatient ? '2100 Western Ave, Apt 4B, Seattle, WA 98121' : ''),
      insurance: patientDetails.insurance || (isDemoPatient ? 'Premera BlueCross Comprehensive • ID #WA-884192' : ''),
      allergies: patientDetails.allergies !== undefined && patientDetails.allergies !== null ? patientDetails.allergies : (isDemoPatient ? 'Penicillin (mild sensitivity), Seasonal Pollen' : ''),
      medicalConditions: patientDetails.medicalConditions !== undefined && patientDetails.medicalConditions !== null ? patientDetails.medicalConditions : (isDemoPatient ? 'Childhood Asthma (Mild Intermittent)' : ''),
      riskFactors: patientDetails.riskFactors || (isDemoPatient ? 'Routine Monitoring Protocol' : ''),
      protocol: patientDetails.protocol || (isDemoPatient ? 'CDC Schedule' : ''),
      primaryPhysician: patientDetails.primaryPhysician || (isDemoPatient ? 'Dr. Sarah Jenkins, MD, FAAP' : ''),
      clinicAssigned: patientDetails.clinicAssigned || (isDemoPatient ? 'Swedish Medical Center — Pediatric Specialty Clinic' : ''),
      complianceScore: completedHistory.length > 0
        ? `${Math.min(100, Math.round((completedHistory.length / (completedHistory.length + upcomingDoses.length || 1)) * 100))}% Complete`
        : '0%',
      totalDosesCount: `${completedHistory.length} Doses Recorded`
    };

    return res.json({
      success: true,
      patientInfo,
      upcomingDoses,
      completedHistory
    });
  } catch (err) {
    console.error('Patient Me error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch personal schedule.' });
  }
});

/**
 * GET /api/data/doctors
 * Returns all registered doctors from the database for patient assignment
 */
router.get('/doctors', verifyToken, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).lean();
    let formatted = doctors.map(d => ({
      uid: d.uid,
      fullName: d.fullName || 'Doctor',
      email: d.email || '',
      phone: format10DigitPhone(d.phone) || d.phone || '',
      specialization: d.doctorDetails?.specialization || 'Pediatrician / Immunologist',
      hospital: d.doctorDetails?.hospital || 'Swedish Medical Center — Pediatric Specialty Clinic',
      licenseNumber: d.doctorDetails?.licenseNumber || 'WA-MED-8492'
    }));

    // Ensure demo doctor is always accessible if not already in collection
    const hasDemo = formatted.some(d => d.email === 'doctor@immu-track.org' || d.uid === 'demo-doctor-01');
    if (!hasDemo) {
      formatted.unshift({
        uid: 'demo-doctor-01',
        fullName: 'Dr. Sarah Jenkins, MD, FAAP',
        email: 'doctor@immu-track.org',
        phone: '5552348901',
        specialization: 'Lead Pediatrician & Immunologist',
        hospital: 'Swedish Medical Center — Pediatric Specialty Clinic',
        licenseNumber: 'NPI #8492019482'
      });
    }

    return res.json({ success: true, doctors: formatted });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    return res.status(500).json({ success: false, message: 'Could not fetch doctors list.' });
  }
});

/**
 * POST /api/data/patient-me/schedule
 * Patient schedules vaccine and assigns a doctor from the database.
 * Dispatches an AppointmentRequest directly to that doctor.
 * The appointment is in pending status until the doctor accepts or rejects.
 */
router.post('/patient-me/schedule', verifyToken, async (req, res) => {
  try {
    const {
      vaccineName,
      doseNumber,
      scheduledDate,
      scheduledTime,
      clinic,
      notes,
      vaccineDescription,
      doctorId
    } = req.body;

    if (!vaccineName || !scheduledDate) {
      return res.status(400).json({ success: false, message: 'Vaccine name and scheduled date are required.' });
    }

    const timeStr = scheduledTime || '10:00';
    const dateObj = new Date(`${scheduledDate}T${timeStr}:00`);
    
    // Format human readable time
    let formattedTime = timeStr;
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      formattedTime = `${hours}:${minutes} ${ampm}`;
    }

    const formattedDisplay = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ` • ${formattedTime}`;

    // Get user details
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const patientDetails = user.patientDetails || {};
    const doseId = `dose-up-${Date.now()}`;
    const hasDoctorAssigned = Boolean(
      doctorId &&
      doctorId !== 'none' &&
      doctorId !== 'unassigned' &&
      typeof doctorId === 'string' &&
      doctorId.trim() !== ''
    );

    let assignedDoctor = null;
    let requestId = null;
    let newDose = null;

    if (hasDoctorAssigned) {
      // Look up chosen doctor from database
      assignedDoctor = await User.findOne({ uid: doctorId, role: 'doctor' });
      if (!assignedDoctor && doctorId === 'demo-doctor-01') {
        assignedDoctor = await User.findOne({
          $or: [
            { uid: 'demo-doctor-01' },
            { email: 'doctor@immu-track.org' },
            { role: 'doctor' }
          ]
        });
      }

      if (assignedDoctor) {
        const doctorUid = assignedDoctor.uid;
        const doctorName = assignedDoctor.fullName || 'Dr. Sarah Jenkins, MD';
        const doctorEmail = assignedDoctor.email || 'doctor@immu-track.org';
        const doctorHospital = assignedDoctor?.doctorDetails?.hospital || clinic || 'Swedish Medical Center — Pediatric Specialty Clinic';
        const doctorSpecialization = assignedDoctor?.doctorDetails?.specialization || 'Pediatrician / Immunologist';

        requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        // Create persistent AppointmentRequest in MongoDB for clinician approval
        const apptRequest = new AppointmentRequest({
          id: requestId,
          patientUid: user.uid,
          patientName: user.fullName || req.user.fullName || 'Patient',
          patientEmail: user.email || '',
          patientPhone: format10DigitPhone(user.phone) || user.phone || '',
          patientDob: patientDetails.dob || null,
          patientGender: patientDetails.gender || '',
          patientBloodGroup: patientDetails.bloodGroup || '',
          patientAllergies: patientDetails.allergies || 'None',
          doctorId: doctorUid,
          doctorName: doctorName,
          doctorEmail: doctorEmail,
          doctorHospital: doctorHospital,
          doctorSpecialization: doctorSpecialization,
          vaccineName,
          doseNumber: doseNumber || 'Routine Dose',
          vaccineDescription: vaccineDescription || '',
          scheduledDate,
          scheduledTime: timeStr,
          scheduledDisplay: formattedDisplay,
          clinic: clinic || doctorHospital,
          notes: notes || '',
          status: 'pending',
          doctorNotes: '',
          doseId: doseId,
          createdAtIso: new Date().toISOString()
        });

        await apptRequest.save();

        // Send direct in-app notification to the assigned doctor
        if (!Array.isArray(assignedDoctor.notifications)) assignedDoctor.notifications = [];
        assignedDoctor.notifications.unshift({
          id: `notif-doc-${Date.now()}`,
          type: 'new_appointment_request',
          title: 'New Appointment Request 📋',
          message: `Patient ${user.fullName || 'Alex Vance'} has requested an appointment with you for ${vaccineName} (${doseNumber || 'Routine Dose'}) on ${formattedDisplay}.`,
          requestId: requestId,
          patientName: user.fullName || 'Patient',
          patientUid: user.uid,
          vaccineName,
          doseNumber: doseNumber || 'Routine Dose',
          scheduledDisplay: formattedDisplay,
          createdAt: new Date().toISOString(),
          read: false
        });
        assignedDoctor.markModified('notifications');
        await assignedDoctor.save().catch(err => console.error('Could not save doctor notification:', err));

        newDose = {
          id: doseId,
          requestId: requestId,
          vaccine: vaccineName,
          dose: doseNumber || 'Routine Dose',
          description: vaccineDescription || '',
          scheduledDate,
          scheduledTime: timeStr,
          scheduledDisplay: formattedDisplay,
          clinic: clinic || doctorHospital,
          doctor: doctorName,
          doctorId: doctorUid,
          status: 'Pending Doctor Approval',
          requestStatus: 'pending',
          notes: notes ? `${notes} • Assigned Doctor: ${doctorName}` : `Assigned Doctor: ${doctorName}`
        };
      }
    }

    // If no doctor was assigned (used for personal remembering / self-tracking)
    if (!newDose) {
      newDose = {
        id: doseId,
        requestId: null,
        vaccine: vaccineName,
        dose: doseNumber || 'Routine Dose',
        description: vaccineDescription || '',
        scheduledDate,
        scheduledTime: timeStr,
        scheduledDisplay: formattedDisplay,
        clinic: clinic || 'Community Health Clinic',
        doctor: 'None (Personal Tracking)',
        doctorId: null,
        status: 'Confirmed Appointment',
        requestStatus: 'self_scheduled',
        notes: notes ? `${notes} • Personal Reminder` : 'Personal vaccination reminder'
      };
    }

    let currentUpcoming = Array.isArray(user.upcomingDoses) ? [...user.upcomingDoses] : [];
    currentUpcoming.unshift(newDose);
    user.upcomingDoses = currentUpcoming;
    user.markModified('upcomingDoses');
    await user.save();

    const successMessage = (hasDoctorAssigned && assignedDoctor)
      ? `${vaccineName} scheduled! Appointment request dispatched to ${newDose.doctor} for approval.`
      : `${vaccineName} scheduled successfully for personal reminder and tracking!`;

    return res.status(201).json({
      success: true,
      message: successMessage,
      newDose,
      requestId,
      upcomingDoses: currentUpcoming
    });
  } catch (err) {
    console.error('Schedule dose error:', err);
    res.status(500).json({ success: false, message: 'Could not schedule vaccine appointment: ' + err.message });
  }
});

/**
 * GET /api/data/doctor/appointment-requests
 * Allows doctor to view all pending and past appointment requests sent to them
 */
router.get('/doctor/appointment-requests', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Access restricted to medical doctors.' });
    }

    const isDemoDoctor = (req.user.email || '').toLowerCase() === 'doctor@immu-track.org' || req.user.uid === 'demo-doctor-01';
    let query = { doctorId: req.user.uid };
    if (isDemoDoctor) {
      query = { $or: [{ doctorId: 'demo-doctor-01' }, { doctorId: req.user.uid }] };
    }

    const requests = await AppointmentRequest.find(query).sort({ createdAt: -1 }).lean();
    const pendingCount = requests.filter(r => r.status === 'pending').length;

    return res.json({
      success: true,
      requests,
      pendingCount
    });
  } catch (err) {
    console.error('Error fetching doctor appointment requests:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch appointment requests: ' + err.message });
  }
});

/**
 * POST /api/data/doctor/appointment-requests/:id/respond
 * Doctor accepts or rejects an appointment request.
 * - Accept: Patient is officially enrolled into the doctor's active patient list (PatientRecord),
 *           and an acceptance notification is sent to the patient.
 * - Reject: Request is rejected, reason recorded, patient NOT added to doctor roster,
 *           and rejection notification sent to the patient.
 */
router.post('/doctor/appointment-requests/:id/respond', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Access restricted to medical doctors.' });
    }

    const { id } = req.params;
    const { action, notes } = req.body; // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action. Must be "accept" or "reject".' });
    }

    const isDemoDoctor = (req.user.email || '').toLowerCase() === 'doctor@immu-track.org' || req.user.uid === 'demo-doctor-01';
    const request = await AppointmentRequest.findOne({ id });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Appointment request not found.' });
    }

    if (!isDemoDoctor && request.doctorId !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'Unauthorized: This request belongs to another doctor.' });
    }

    const doctorDisplayName = req.user.fullName || request.doctorName || 'Attending Clinician';
    const nowIso = new Date().toISOString();

    if (action === 'accept') {
      request.status = 'accepted';
      request.respondedAtIso = nowIso;
      request.doctorNotes = notes ? notes.trim() : 'Appointment confirmed by attending clinician.';
      await request.save();

      // 1. Enroll Patient into Doctor's active Caseload Roster (PatientRecord)
      const patRecordId = `pat-${request.patientUid}`;
      const patientUser = await User.findOne({ uid: request.patientUid });
      const patDetails = (patientUser && patientUser.patientDetails) || {};
      const scheduledIso = new Date(`${request.scheduledDate}T${request.scheduledTime || '10:00'}:00`).toISOString();

      let patientRec = await PatientRecord.findOne({ id: patRecordId });
      if (!patientRec) {
        patientRec = new PatientRecord({
          id: patRecordId,
          doctorId: req.user.uid,
          fullName: request.patientName,
          mrn: `MRN-${request.patientUid.substring(0, 8).toUpperCase()}`,
          gender: request.patientGender || patDetails.gender || '',
          bloodGroup: request.patientBloodGroup || patDetails.bloodGroup || '',
          dob: request.patientDob || patDetails.dob || null,
          ageDisplay: patDetails.age || '',
          phone: format10DigitPhone(request.patientPhone) || format10DigitPhone(patientUser?.phone) || '',
          email: request.patientEmail || patientUser?.email || '',
          emergencyContact: patDetails.emergencyContact || '',
          address: patDetails.address || '',
          insurance: patDetails.insurance || '',
          allergies: request.patientAllergies || patDetails.allergies || 'None',
          riskFactors: patDetails.riskFactors || '',
          protocol: patDetails.protocol || 'CDC',
          vaccineName: request.vaccineName,
          doseNumber: request.doseNumber,
          vaccineDescription: request.vaccineDescription,
          status: 'Scheduled',
          scheduledDateDisplay: request.scheduledDisplay,
          scheduledTimestamp: scheduledIso,
          doctorAssigned: doctorDisplayName,
          clinicAssigned: request.clinic || req.user.doctorDetails?.hospital || 'General Clinic',
          notes: request.notes,
          pendingVaccines: [
            {
              id: request.doseId || `dose-${Date.now()}`,
              vaccine: request.vaccineName,
              dose: request.doseNumber,
              scheduledDate: request.scheduledDate,
              scheduledTime: request.scheduledTime,
              scheduledDisplay: request.scheduledDisplay,
              status: 'Scheduled',
              doctor: doctorDisplayName,
              clinic: request.clinic || req.user.doctorDetails?.hospital || 'General Clinic'
            }
          ]
        });
        await patientRec.save();
      } else {
        patientRec.doctorId = req.user.uid;
        patientRec.status = 'Scheduled';
        patientRec.vaccineName = request.vaccineName;
        patientRec.doseNumber = request.doseNumber;
        patientRec.scheduledDateDisplay = request.scheduledDisplay;
        patientRec.scheduledTimestamp = scheduledIso;
        patientRec.doctorAssigned = doctorDisplayName;
        if (!Array.isArray(patientRec.pendingVaccines)) patientRec.pendingVaccines = [];
        const hasDose = patientRec.pendingVaccines.some(p => p.id === request.doseId);
        if (!hasDose) {
          patientRec.pendingVaccines.unshift({
            id: request.doseId || `dose-${Date.now()}`,
            vaccine: request.vaccineName,
            dose: request.doseNumber,
            scheduledDate: request.scheduledDate,
            scheduledTime: request.scheduledTime,
            scheduledDisplay: request.scheduledDisplay,
            status: 'Scheduled',
            doctor: doctorDisplayName,
            clinic: request.clinic || req.user.doctorDetails?.hospital || 'General Clinic'
          });
        }
        await patientRec.save();
      }

      // 2. Update Patient's User upcomingDoses & Dispatch Notification to Patient
      if (patientUser) {
        if (Array.isArray(patientUser.upcomingDoses)) {
          const doseIdx = patientUser.upcomingDoses.findIndex(d => d.id === request.doseId || d.requestId === request.id);
          if (doseIdx !== -1) {
            patientUser.upcomingDoses[doseIdx].status = 'Confirmed Appointment';
            patientUser.upcomingDoses[doseIdx].requestStatus = 'accepted';
            patientUser.upcomingDoses[doseIdx].doctor = doctorDisplayName;
          }
        }
        if (!Array.isArray(patientUser.notifications)) patientUser.notifications = [];
        patientUser.notifications.unshift({
          id: `notif-pat-${Date.now()}`,
          type: 'appointment_accepted',
          title: 'Appointment Request Accepted! 🎉',
          message: `Dr. ${doctorDisplayName} has ACCEPTED your appointment for ${request.vaccineName} (${request.doseNumber}) on ${request.scheduledDisplay}. You are now on their active patient list.`,
          doctorId: req.user.uid,
          doctorName: doctorDisplayName,
          vaccineName: request.vaccineName,
          doseNumber: request.doseNumber,
          scheduledDisplay: request.scheduledDisplay,
          doctorNotes: request.doctorNotes,
          createdAt: nowIso,
          read: false
        });
        patientUser.markModified('upcomingDoses');
        patientUser.markModified('notifications');
        await patientUser.save();
      }

      return res.json({
        success: true,
        message: `Appointment for ${request.patientName} accepted! Patient enrolled in your caseload list.`,
        request
      });

    } else {
      // REJECT ACTION
      request.status = 'rejected';
      request.respondedAtIso = nowIso;
      request.doctorNotes = notes && notes.trim() !== '' ? notes.trim() : 'Attending physician is unavailable at the requested time slot.';
      await request.save();

      // Update patient's dose to declined & send rejection notification
      const patientUser = await User.findOne({ uid: request.patientUid });
      if (patientUser) {
        if (Array.isArray(patientUser.upcomingDoses)) {
          const doseIdx = patientUser.upcomingDoses.findIndex(d => d.id === request.doseId || d.requestId === request.id);
          if (doseIdx !== -1) {
            patientUser.upcomingDoses[doseIdx].status = 'Declined by Doctor';
            patientUser.upcomingDoses[doseIdx].requestStatus = 'rejected';
            patientUser.upcomingDoses[doseIdx].rejectionReason = request.doctorNotes;
          }
        }
        if (!Array.isArray(patientUser.notifications)) patientUser.notifications = [];
        patientUser.notifications.unshift({
          id: `notif-pat-${Date.now()}`,
          type: 'appointment_rejected',
          title: 'Appointment Request Declined ⚠️',
          message: `Dr. ${doctorDisplayName} was unable to accept your appointment for ${request.vaccineName} on ${request.scheduledDisplay}. Reason: ${request.doctorNotes}`,
          doctorId: req.user.uid,
          doctorName: doctorDisplayName,
          vaccineName: request.vaccineName,
          doseNumber: request.doseNumber,
          scheduledDisplay: request.scheduledDisplay,
          reason: request.doctorNotes,
          createdAt: nowIso,
          read: false
        });
        patientUser.markModified('upcomingDoses');
        patientUser.markModified('notifications');
        await patientUser.save();
      }

      // Patient is deliberately NOT added to PatientRecord.
      return res.json({
        success: true,
        message: `Appointment request rejected. Rejection notification dispatched to ${request.patientName}.`,
        request
      });
    }
  } catch (err) {
    console.error('Error responding to appointment request:', err);
    return res.status(500).json({ success: false, message: 'Could not process request response: ' + err.message });
  }
});

/**
 * GET /api/data/patient-me/notifications
 * Patient fetches notifications
 */
router.get('/patient-me/notifications', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid }).lean();
    const notifications = user?.notifications || [];
    const unreadCount = notifications.filter(n => !n.read).length;
    return res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch patient notifications.' });
  }
});

/**
 * POST /api/data/patient-me/notifications/mark-read
 * Marks all patient notifications as read
 */
router.post('/patient-me/notifications/mark-read', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (user && Array.isArray(user.notifications)) {
      user.notifications.forEach(n => { n.read = true; });
      user.markModified('notifications');
      await user.save();
    }
    return res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to mark notifications read.' });
  }
});

/**
 * POST /api/data/doctor/notifications/mark-read
 * Marks doctor notifications as read
 */
router.post('/doctor/notifications/mark-read', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (user && Array.isArray(user.notifications)) {
      user.notifications.forEach(n => { n.read = true; });
      user.markModified('notifications');
      await user.save();
    }
    return res.json({ success: true, message: 'Doctor notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to mark notifications read.' });
  }
});

/**
 * DELETE /api/data/patients/:id
 * Delete a patient and their entire chart from MongoDB (Doctor Portal)
 */
router.delete('/patients/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await PatientRecord.findOne({ id });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found.' });
    }

    // Allow doctor to delete their own patient or demo doctor
    if (patient.doctorId && patient.doctorId !== req.user.uid && req.user.email !== 'doctor@immu-track.org') {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this patient record.' });
    }

    const patientName = patient.fullName;
    await PatientRecord.deleteOne({ id });

    return res.json({
      success: true,
      message: `Patient "${patientName}" has been successfully removed from clinical records.`
    });
  } catch (err) {
    console.error('Delete patient error:', err);
    res.status(500).json({ success: false, message: 'Could not delete patient: ' + err.message });
  }
});

/**
 * DELETE /api/data/patients/:patientId/pending-dose/:doseId
 * Delete a specific scheduled pending vaccine dose from a patient chart (Doctor Portal)
 */
router.delete('/patients/:patientId/pending-dose/:doseId', verifyToken, async (req, res) => {
  try {
    const { patientId, doseId } = req.params;
    const patient = await PatientRecord.findOne({ id: patientId });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found.' });
    }

    let pendingList = Array.isArray(patient.pendingVaccines) ? [...patient.pendingVaccines] : [];
    const administeredList = Array.isArray(patient.administeredVaccines) ? [...patient.administeredVaccines] : [];

    const doseIndex = pendingList.findIndex(d => d.id === doseId);
    if (doseIndex === -1) {
      return res.status(404).json({ success: false, message: 'Scheduled dose not found in pending schedule.' });
    }

    const removedDose = pendingList.splice(doseIndex, 1)[0];
    const totalDoses = administeredList.length + pendingList.length;
    const compliancePercent = totalDoses > 0 ? Math.round((administeredList.length / totalDoses) * 100) : (administeredList.length > 0 ? 100 : 0);
    const hasRemainingOverdue = pendingList.some(p => p.status === 'Overdue');
    const newStatus = hasRemainingOverdue ? 'Overdue' : (pendingList.length > 0 ? 'Scheduled' : (administeredList.length > 0 ? 'Administered' : 'Scheduled'));

    patient.pendingVaccines = pendingList;
    patient.compliancePercent = compliancePercent;
    patient.dosesCount = `${administeredList.length}/${totalDoses}`;
    patient.status = newStatus;
    patient.scheduledDateDisplay = pendingList.length > 0 ? pendingList[0].scheduledDisplay : (administeredList.length > 0 ? 'All Up-to-Date' : 'No Active Slots');
    patient.vaccineName = pendingList.length > 0 ? pendingList[0].vaccine : (administeredList.length > 0 ? administeredList[0].vaccine : 'None Scheduled');
    patient.doseNumber = pendingList.length > 0 ? pendingList[0].dose : 'None';

    patient.markModified('pendingVaccines');
    await patient.save();

    const cleanPatient = patient.toObject ? patient.toObject() : { ...patient };
    delete cleanPatient._id;
    delete cleanPatient.__v;

    return res.json({
      success: true,
      message: `Scheduled dose "${removedDose.vaccine}" removed from patient schedule.`,
      patient: cleanPatient
    });
  } catch (err) {
    console.error('Delete pending dose error:', err);
    res.status(500).json({ success: false, message: 'Could not delete scheduled dose: ' + err.message });
  }
});

/**
 * DELETE /api/data/patient-me/doses/:doseId
 * Cancel and delete an upcoming appointment dose from patient portal (Patient Portal)
 */
router.delete('/patient-me/doses/:doseId', verifyToken, async (req, res) => {
  try {
    const { doseId } = req.params;
    const user = await User.findOne({ uid: req.user.uid });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    let upcomingDoses = Array.isArray(user.upcomingDoses) ? [...user.upcomingDoses] : [];
    const doseIndex = upcomingDoses.findIndex(d => d.id === doseId);

    if (doseIndex === -1) {
      return res.status(404).json({ success: false, message: 'Scheduled appointment not found.' });
    }

    const cancelledDose = upcomingDoses.splice(doseIndex, 1)[0];
    user.upcomingDoses = upcomingDoses;
    user.markModified('upcomingDoses');
    await user.save();

    // Also update mirror roster record if present
    await PatientRecord.findOneAndUpdate(
      { id: `pat-${req.user.uid}` },
      {
        $set: {
          scheduledDateDisplay: upcomingDoses.length > 0 ? upcomingDoses[0].scheduledDisplay : 'No Upcoming Appointments',
          vaccineName: upcomingDoses.length > 0 ? upcomingDoses[0].vaccine : 'None Scheduled'
        }
      }
    ).catch(() => {});

    return res.json({
      success: true,
      message: `Appointment for "${cancelledDose.vaccine}" has been cancelled and removed.`,
      upcomingDoses
    });
  } catch (err) {
    console.error('Cancel patient appointment error:', err);
    res.status(500).json({ success: false, message: 'Could not cancel appointment: ' + err.message });
  }
});

/**
 * PUT /api/data/patients/:patientId/pending-dose/:doseId
 * Edit / Update an existing scheduled pending vaccine in patient chart (Doctor Portal)
 */
router.put('/patients/:patientId/pending-dose/:doseId', verifyToken, async (req, res) => {
  try {
    const { patientId, doseId } = req.params;
    const {
      fullName,
      dob,
      gender,
      bloodGroup,
      allergies,
      email,
      phone,
      emergencyContact,
      vaccineName,
      doseNumber,
      scheduledDate,
      scheduledTime,
      description,
      urgency,
      status
    } = req.body;

    if (!vaccineName || !scheduledDate) {
      return res.status(400).json({ success: false, message: 'Vaccine name and scheduled date are required.' });
    }

    if (phone && String(phone).trim() !== '') {
      const pVal = validate10DigitPhone(phone);
      if (!pVal.valid) {
        return res.status(400).json({ success: false, message: pVal.message });
      }
    }

    const patient = await PatientRecord.findOne({ id: patientId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found.' });
    }

    // Update patient profile demographics & contacts
    if (fullName && fullName.trim()) patient.fullName = fullName.trim();
    if (dob !== undefined && dob !== null && dob !== '') {
      patient.dob = dob;
      patient.ageDisplay = calculatePatientAge(dob).ageDisplay;
    }
    if (gender) patient.gender = gender;
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (allergies !== undefined) patient.allergies = allergies.trim();
    if (email !== undefined) patient.email = email.trim().toLowerCase();
    if (phone !== undefined) patient.phone = phone ? format10DigitPhone(phone) : '';
    if (emergencyContact !== undefined) patient.emergencyContact = emergencyContact.trim();

    let pendingList = Array.isArray(patient.pendingVaccines) ? [...patient.pendingVaccines] : [];
    const doseIndex = pendingList.findIndex(d => d.id === doseId);

    if (doseIndex === -1) {
      return res.status(404).json({ success: false, message: 'Scheduled dose not found in patient chart.' });
    }

    const timeStr = scheduledTime || '10:00';
    const dateObj = new Date(`${scheduledDate}T${timeStr}:00`);
    let formattedTime = timeStr;
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      formattedTime = `${hours}:${minutes} ${ampm}`;
    }

    const formattedDisplay = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ` • ${formattedTime}`;

    // Update the pending dose
    pendingList[doseIndex] = {
      ...pendingList[doseIndex],
      vaccine: vaccineName.trim(),
      disease: pendingList[doseIndex].disease || vaccineName.trim(),
      dose: (doseNumber || 'Routine Dose').trim(),
      description: description !== undefined ? description.trim() : pendingList[doseIndex].description,
      urgency: urgency !== undefined ? urgency.trim() : pendingList[doseIndex].urgency,
      status: status || pendingList[doseIndex].status || 'Scheduled',
      scheduledDate,
      scheduledTime: timeStr,
      scheduledDisplay: formattedDisplay,
      scheduledTimestamp: dateObj.toISOString()
    };

    const hasOverdue = pendingList.some(p => p.status === 'Overdue');
    patient.pendingVaccines = pendingList;
    patient.status = hasOverdue ? 'Overdue' : (pendingList.length > 0 ? (status || 'Scheduled') : 'Administered');

    // If this was the first pending dose, keep main patient record in sync
    if (doseIndex === 0) {
      patient.vaccineName = vaccineName.trim();
      patient.doseNumber = (doseNumber || 'Routine Dose').trim();
      patient.scheduledDateDisplay = formattedDisplay;
      patient.scheduledTimestamp = dateObj.toISOString();
    }

    patient.markModified('pendingVaccines');
    await patient.save();

    // Synchronize to matching User if account exists
    const cleanUserId = patient.id.replace('pat-', '');
    await User.findOneAndUpdate(
      { $or: [{ id: cleanUserId }, { email: patient.email }] },
      {
        $set: {
          fullName: patient.fullName,
          email: patient.email,
          phone: patient.phone,
          emergencyContact: patient.emergencyContact,
          bloodGroup: patient.bloodGroup,
          allergies: patient.allergies,
          dob: patient.dob,
          gender: patient.gender
        }
      }
    ).catch(() => {});

    const cleanPatient = patient.toObject ? patient.toObject() : { ...patient };
    delete cleanPatient._id;
    delete cleanPatient.__v;

    return res.json({
      success: true,
      message: `Patient information & scheduled dose "${vaccineName}" updated successfully!`,
      patient: cleanPatient
    });
  } catch (err) {
    console.error('Update pending dose error:', err);
    res.status(500).json({ success: false, message: 'Could not update scheduled dose: ' + err.message });
  }
});

/**
 * PUT /api/data/patients/:patientId/schedule
 * Direct update of the primary scheduled vaccine & patient info for a patient (Doctor Portal Roster)
 */
router.put('/patients/:patientId/schedule', verifyToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      fullName,
      dob,
      gender,
      bloodGroup,
      allergies,
      email,
      phone,
      emergencyContact,
      vaccineName,
      doseNumber,
      scheduledDate,
      scheduledTime,
      description,
      urgency,
      status
    } = req.body;

    if (!vaccineName || !scheduledDate) {
      return res.status(400).json({ success: false, message: 'Vaccine name and scheduled date are required.' });
    }

    if (phone && String(phone).trim() !== '') {
      const pVal = validate10DigitPhone(phone);
      if (!pVal.valid) {
        return res.status(400).json({ success: false, message: pVal.message });
      }
    }

    const patient = await PatientRecord.findOne({ id: patientId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found.' });
    }

    // Update patient profile demographics & contacts
    if (fullName && fullName.trim()) patient.fullName = fullName.trim();
    if (dob !== undefined && dob !== null && dob !== '') {
      patient.dob = dob;
      patient.ageDisplay = calculatePatientAge(dob).ageDisplay;
    }
    if (gender) patient.gender = gender;
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (allergies !== undefined) patient.allergies = allergies.trim();
    if (email !== undefined) patient.email = email.trim().toLowerCase();
    if (phone !== undefined) patient.phone = phone ? format10DigitPhone(phone) : '';
    if (emergencyContact !== undefined) patient.emergencyContact = emergencyContact.trim();

    const timeStr = scheduledTime || '10:00';
    const dateObj = new Date(`${scheduledDate}T${timeStr}:00`);
    let formattedTime = timeStr;
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      formattedTime = `${hours}:${minutes} ${ampm}`;
    }

    const formattedDisplay = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ` • ${formattedTime}`;

    patient.vaccineName = vaccineName.trim();
    patient.doseNumber = (doseNumber || 'Routine Dose').trim();
    patient.scheduledDateDisplay = formattedDisplay;
    patient.scheduledTimestamp = dateObj.toISOString();
    if (status) patient.status = status;

    let pendingList = Array.isArray(patient.pendingVaccines) ? [...patient.pendingVaccines] : [];
    if (pendingList.length > 0) {
      pendingList[0] = {
        ...pendingList[0],
        vaccine: vaccineName.trim(),
        dose: (doseNumber || 'Routine Dose').trim(),
        description: description !== undefined ? description.trim() : pendingList[0].description,
        urgency: urgency !== undefined ? urgency.trim() : pendingList[0].urgency,
        status: status || pendingList[0].status || 'Scheduled',
        scheduledDate,
        scheduledTime: timeStr,
        scheduledDisplay: formattedDisplay,
        scheduledTimestamp: dateObj.toISOString()
      };
      patient.pendingVaccines = pendingList;
      patient.markModified('pendingVaccines');
    }

    await patient.save();

    // Synchronize to matching User if account exists
    const cleanUserId = patient.id.replace('pat-', '');
    await User.findOneAndUpdate(
      { $or: [{ id: cleanUserId }, { email: patient.email }] },
      {
        $set: {
          fullName: patient.fullName,
          email: patient.email,
          phone: patient.phone,
          emergencyContact: patient.emergencyContact,
          bloodGroup: patient.bloodGroup,
          allergies: patient.allergies,
          dob: patient.dob,
          gender: patient.gender
        }
      }
    ).catch(() => {});

    const cleanPatient = patient.toObject ? patient.toObject() : { ...patient };
    delete cleanPatient._id;
    delete cleanPatient.__v;

    return res.json({
      success: true,
      message: `Patient information & vaccine schedule for "${patient.fullName}" updated successfully!`,
      patient: cleanPatient
    });
  } catch (err) {
    console.error('Update roster schedule error:', err);
    res.status(500).json({ success: false, message: 'Could not update scheduled vaccine: ' + err.message });
  }
});

/**
 * PUT /api/data/patient-me/doses/:doseId
 * Edit and reschedule an existing upcoming vaccine appointment (Patient Portal)
 */
router.put('/patient-me/doses/:doseId', verifyToken, async (req, res) => {
  try {
    const { doseId } = req.params;
    const {
      vaccineName,
      doseNumber,
      scheduledDate,
      scheduledTime,
      clinic,
      notes,
      vaccineDescription
    } = req.body;

    if (!vaccineName || !scheduledDate) {
      return res.status(400).json({ success: false, message: 'Vaccine name and scheduled date are required.' });
    }

    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    let upcomingDoses = Array.isArray(user.upcomingDoses) ? [...user.upcomingDoses] : [];
    const doseIndex = upcomingDoses.findIndex(d => d.id === doseId);

    if (doseIndex === -1) {
      return res.status(404).json({ success: false, message: 'Scheduled appointment not found.' });
    }

    const timeStr = scheduledTime || '10:00';
    const dateObj = new Date(`${scheduledDate}T${timeStr}:00`);
    let formattedTime = timeStr;
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      formattedTime = `${hours}:${minutes} ${ampm}`;
    }

    const formattedDisplay = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ` • ${formattedTime}`;

    upcomingDoses[doseIndex] = {
      ...upcomingDoses[doseIndex],
      vaccine: vaccineName.trim(),
      dose: (doseNumber || 'Routine Dose').trim(),
      description: vaccineDescription !== undefined ? vaccineDescription.trim() : upcomingDoses[doseIndex].description,
      clinic: clinic || upcomingDoses[doseIndex].clinic || 'Community Health Clinic',
      notes: notes !== undefined ? notes.trim() : upcomingDoses[doseIndex].notes,
      scheduledDate,
      scheduledTime: timeStr,
      scheduledDisplay: formattedDisplay
    };

    user.upcomingDoses = upcomingDoses;
    user.markModified('upcomingDoses');
    await user.save();

    // Mirror to doctor patient roster if present
    await PatientRecord.findOneAndUpdate(
      { id: `pat-${req.user.uid}` },
      {
        $set: {
          vaccineName: vaccineName.trim(),
          doseNumber: (doseNumber || 'Routine Dose').trim(),
          scheduledDateDisplay: formattedDisplay,
          scheduledTimestamp: dateObj.toISOString()
        }
      }
    ).catch(() => {});

    return res.json({
      success: true,
      message: `Appointment for "${vaccineName}" rescheduled successfully!`,
      updatedDose: upcomingDoses[doseIndex],
      upcomingDoses
    });
  } catch (err) {
    console.error('Edit patient appointment error:', err);
    res.status(500).json({ success: false, message: 'Could not reschedule appointment: ' + err.message });
  }
});

/**
 * POST /api/data/patient-me/doses/:doseId/administer
 * Patient administers an upcoming/overdue dose themselves from the patient portal.
 * Explicitly records administration timestamp, updates completedHistory, removes from upcoming,
 * and synchronizes verified immunization records.
 */
router.post('/patient-me/doses/:doseId/administer', verifyToken, async (req, res) => {
  try {
    const { doseId } = req.params;
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    let upcoming = Array.isArray(user.upcomingDoses) ? [...user.upcomingDoses] : [];
    let completed = Array.isArray(user.completedHistory) ? [...user.completedHistory] : [];

    const doseIndex = upcoming.findIndex(d => String(d.id) === String(doseId));
    if (doseIndex === -1) {
      return res.status(404).json({ success: false, message: 'Scheduled dose not found in upcoming schedule.' });
    }

    const targetDose = upcoming.splice(doseIndex, 1)[0];
    const now = new Date();
    const formattedTimestamp = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' • ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newAdministered = {
      id: `adm-pat-${Date.now()}`,
      vaccine: targetDose.vaccine,
      disease: targetDose.disease || targetDose.vaccine,
      dose: targetDose.dose,
      administeredDate: formattedTimestamp,
      clinic: targetDose.clinic || user.patientDetails?.clinicAssigned || 'Community Health Clinic',
      doctor: targetDose.doctor || user.patientDetails?.primaryPhysician || 'Attending Physician',
      lotNumber: targetDose.lotNumber || `LOT-PAT-${Math.floor(1000 + Math.random() * 9000)}-${now.getFullYear()}`,
      siteRoute: targetDose.siteRoute || 'Intramuscular (Deltoid)',
      status: 'Administered'
    };

    completed.unshift(newAdministered);

    user.upcomingDoses = upcoming;
    user.completedHistory = completed;
    user.markModified('upcomingDoses');
    user.markModified('completedHistory');
    await user.save();

    // Also sync with PatientRecord in roster if exists
    const patientRec = await PatientRecord.findOne({
      $or: [
        { id: `pat-${req.user.uid}` },
        { email: user.email ? user.email.toLowerCase() : '____no_match____' }
      ]
    });

    if (patientRec) {
      let pendingList = Array.isArray(patientRec.pendingVaccines) ? [...patientRec.pendingVaccines] : [];
      let admList = Array.isArray(patientRec.administeredVaccines) ? [...patientRec.administeredVaccines] : [];

      const pIndex = pendingList.findIndex(p => String(p.id) === String(doseId) || p.vaccine === targetDose.vaccine);
      if (pIndex !== -1) {
        pendingList.splice(pIndex, 1);
      }
      admList.unshift(newAdministered);

      const total = pendingList.length + admList.length;
      patientRec.pendingVaccines = pendingList;
      patientRec.administeredVaccines = admList;
      patientRec.dosesCount = `${admList.length}/${total}`;
      patientRec.compliancePercent = total > 0 ? Math.round((admList.length / total) * 100) : 100;
      const hasOverdue = pendingList.some(p => isDoseOverdue(p, now));
      patientRec.status = hasOverdue ? 'Overdue' : (pendingList.length > 0 ? 'Scheduled' : 'Administered');
      patientRec.scheduledDateDisplay = pendingList.length > 0 ? pendingList[0].scheduledDisplay : `Administered ${formattedTimestamp}`;
      patientRec.markModified('pendingVaccines');
      patientRec.markModified('administeredVaccines');
      await patientRec.save();
    }

    return res.json({
      success: true,
      message: `${targetDose.vaccine} (${targetDose.dose}) successfully administered and recorded in verified immunization ledger!`,
      newAdministered,
      upcomingDoses: upcoming,
      completedHistory: completed
    });
  } catch (err) {
    console.error('Patient administer dose error:', err);
    res.status(500).json({ success: false, message: 'Could not administer dose: ' + err.message });
  }
});

module.exports = router;
