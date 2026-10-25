const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, PatientRecord } = require('../db');
const { verifyToken, JWT_SECRET } = require('../middleware/authMiddleware');

/**
 * Generate standard JWT token
 */
function createAuthToken(user) {
  return jwt.sign(
    {
      uid: user.uid,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Strip sensitive fields from user object
 */
function sanitizeUser(userData) {
  if (!userData) return null;
  const sanitized = userData.toObject ? userData.toObject() : { ...userData };
  delete sanitized.passwordHash;
  delete sanitized.__v;
  delete sanitized._id;
  return sanitized;
}

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

function formatPhoneNumber(phoneStr) {
  const result = validate10DigitPhone(phoneStr);
  return result.valid ? result.value : '';
}

/**
 * POST /api/auth/register
 * Register a new Doctor or Patient into MongoDB
 */
router.post('/register', async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      phone,
      altPhone,
      // Doctor fields
      specialization,
      licenseNumber,
      hospital,
      experienceYears,
      // Patient fields
      dob,
      gender,
      bloodGroup,
      emergencyContact,
      address,
      insurance,
      allergies,
      medicalConditions
    } = req.body;

    // Basic Validations
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, password, and account role are required.'
      });
    }

    if (!['doctor', 'patient'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "doctor" or "patient".'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Strict 10-digit mobile number validation
    if (phone && String(phone).trim() !== '') {
      const phoneValidation = validate10DigitPhone(phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({
          success: false,
          message: phoneValidation.message
        });
      }
    }

    if (altPhone && String(altPhone).trim() !== '') {
      const altPhoneValidation = validate10DigitPhone(altPhone);
      if (!altPhoneValidation.valid) {
        return res.status(400).json({
          success: false,
          message: altPhoneValidation.message
        });
      }
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already registered in MongoDB
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `An account with email "${cleanEmail}" is already registered. Please sign in instead.`
      });
    }

    const docId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Hash password securely with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Prepare role-specific structured data
    const doctorDetails = role === 'doctor' ? {
      specialization: specialization || 'General Pediatrics & Immunization',
      licenseNumber: licenseNumber || `MED-${Math.floor(100000 + Math.random() * 900000)}`,
      hospital: hospital || 'Apex Health Center & Vaccine Clinic',
      experienceYears: experienceYears || '5',
      verified: true
    } : null;

    // Clean sheet initialization for new patients: no dummy mock strings
    const cleanPhone = formatPhoneNumber(phone);
    const cleanAltPhone = formatPhoneNumber(altPhone);

    const patientDetails = role === 'patient' ? {
      dob: dob && String(dob).trim() !== '' ? String(dob).trim() : null,
      gender: gender && String(gender).trim() !== '' ? String(gender).trim() : null,
      bloodGroup: bloodGroup && String(bloodGroup).trim() !== '' ? String(bloodGroup).trim() : null,
      emergencyContact: emergencyContact && String(emergencyContact).trim() !== '' ? String(emergencyContact).trim() : null,
      altPhone: cleanAltPhone || null,
      address: address && String(address).trim() !== '' ? String(address).trim() : null,
      insurance: insurance && String(insurance).trim() !== '' ? String(insurance).trim() : null,
      allergies: allergies && String(allergies).trim() !== '' ? String(allergies).trim() : null,
      medicalConditions: medicalConditions && String(medicalConditions).trim() !== '' ? String(medicalConditions).trim() : null
    } : null;

    const now = new Date().toISOString();

    const newUser = await User.create({
      uid: docId,
      fullName: fullName.trim(),
      email: cleanEmail,
      passwordHash,
      role,
      phone: cleanPhone,
      altPhone: cleanAltPhone,
      doctorDetails,
      patientDetails,
      upcomingDoses: [],
      completedHistory: [],
      status: 'active',
      avatarUrl: '',
      createdAtIso: now,
      lastLoginIso: now
    });

    console.log(`✅ [MongoDB] Created user ${docId} with role "${role}".`);

    const token = createAuthToken(newUser);
    const safeUser = sanitizeUser(newUser);

    return res.status(201).json({
      success: true,
      message: `Account created successfully as ${role === 'doctor' ? 'Doctor' : 'Patient'}!`,
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete registration due to an internal server error.',
      error: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate existing user with MongoDB credentials
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Query MongoDB for user by email
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No registered account found with this email address.'
      });
    }

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials and try again.'
      });
    }

    // Role check if user specifically picked Doctor / Patient toggle on login
    if (expectedRole && expectedRole !== user.role) {
      return res.status(400).json({
        success: false,
        message: `This account is registered as a ${user.role.toUpperCase()}. Please toggle to ${user.role === 'doctor' ? 'Doctor' : 'Patient'} mode to proceed.`
      });
    }

    // Update lastLogin
    user.lastLoginIso = new Date().toISOString();
    await user.save();

    const token = createAuthToken(user);
    const safeUser = sanitizeUser(user);

    console.log(`✅ [MongoDB] User logged in: ${user.email} (${user.role})`);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.fullName}!`,
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed due to server error.',
      error: error.message
    });
  }
});

/**
 * GET /api/auth/me
 * Fetch current authenticated user's profile from MongoDB
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile record not found.'
      });
    }

    const safeUser = sanitizeUser(user);
    return res.status(200).json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.',
      error: error.message
    });
  }
});

/**
 * PUT & POST /api/auth/profile
 * Update user profile details (Name, Contact, Alt/Emergency Mobile, Demographics, Allergies)
 */
const handleProfileUpdate = async (req, res) => {
  try {
    const uid = req.user.uid;
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    const role = user.role;

    const {
      fullName,
      phone,
      altPhone,
      // Patient specifics
      dob,
      gender,
      bloodGroup,
      emergencyContact,
      address,
      insurance,
      allergies,
      medicalConditions,
      // Doctor specifics
      specialization,
      licenseNumber,
      hospital
    } = req.body;

    if (fullName) user.fullName = fullName.trim();

    if (phone !== undefined && String(phone).trim() !== '') {
      const pVal = validate10DigitPhone(phone);
      if (!pVal.valid) {
        return res.status(400).json({ success: false, message: pVal.message });
      }
      user.phone = pVal.value;
    } else if (phone !== undefined) {
      user.phone = '';
    }

    if (altPhone !== undefined && String(altPhone).trim() !== '') {
      const aVal = validate10DigitPhone(altPhone);
      if (!aVal.valid) {
        return res.status(400).json({ success: false, message: aVal.message });
      }
      user.altPhone = aVal.value;
    } else if (altPhone !== undefined) {
      user.altPhone = '';
    }

    if (role === 'patient') {
      const currentPatientDetails = user.patientDetails || {};
      const updatedPatientDetails = {
        ...currentPatientDetails,
        dob: dob !== undefined ? dob : currentPatientDetails.dob,
        gender: gender !== undefined ? gender : currentPatientDetails.gender,
        bloodGroup: bloodGroup !== undefined ? bloodGroup : currentPatientDetails.bloodGroup,
        emergencyContact: emergencyContact !== undefined ? emergencyContact.trim() : currentPatientDetails.emergencyContact,
        altPhone: altPhone !== undefined ? formatPhoneNumber(altPhone) : currentPatientDetails.altPhone,
        address: address !== undefined ? address.trim() : currentPatientDetails.address,
        insurance: insurance !== undefined ? insurance.trim() : currentPatientDetails.insurance,
        allergies: allergies !== undefined ? allergies.trim() : currentPatientDetails.allergies,
        medicalConditions: medicalConditions !== undefined ? medicalConditions.trim() : currentPatientDetails.medicalConditions
      };
      user.patientDetails = updatedPatientDetails;

      // Synchronize with patient_records roster if exists
      await PatientRecord.findOneAndUpdate(
        { id: `pat-${uid}` },
        {
          $set: {
            fullName: (fullName || user.fullName).trim(),
            dob: updatedPatientDetails.dob,
            gender: updatedPatientDetails.gender,
            bloodGroup: updatedPatientDetails.bloodGroup,
            allergies: updatedPatientDetails.allergies,
            medicalConditions: updatedPatientDetails.medicalConditions,
            phone: user.phone,
            altPhone: user.altPhone,
            email: user.email || '',
            emergencyContact: updatedPatientDetails.emergencyContact,
            address: updatedPatientDetails.address,
            insurance: updatedPatientDetails.insurance
          }
        }
      ).catch(err => console.warn('Roster sync notice:', err.message));
    } else if (role === 'doctor') {
      const currentDoctorDetails = user.doctorDetails || {};
      const updatedDoctorDetails = {
        ...currentDoctorDetails,
        specialization: specialization !== undefined ? specialization.trim() : currentDoctorDetails.specialization,
        licenseNumber: licenseNumber !== undefined ? licenseNumber.trim() : currentDoctorDetails.licenseNumber,
        hospital: hospital !== undefined ? hospital.trim() : currentDoctorDetails.hospital
      };
      user.doctorDetails = updatedDoctorDetails;
    }

    user.markModified('patientDetails');
    user.markModified('doctorDetails');
    await user.save();

    const safeUser = sanitizeUser(user);

    return res.json({
      success: true,
      message: 'Profile and emergency contact details updated successfully!',
      user: safeUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, message: 'Could not update profile: ' + err.message });
  }
};

router.put('/profile', verifyToken, handleProfileUpdate);
router.post('/profile', verifyToken, handleProfileUpdate);

async function ensureDemoUsersSeeded() {
  try {
    const defaultDoctorEmail = 'doctor@immu-track.org';
    const defaultPatientEmail = 'patient@immu-track.org';

    const salt = await bcrypt.genSalt(10);
    const doctorPass = await bcrypt.hash('Doctor@123', salt);
    const patientPass = await bcrypt.hash('Patient@123', salt);

    const now = new Date().toISOString();

    // Check doctor
    let doc = await User.findOne({ email: defaultDoctorEmail });
    if (!doc) {
      await User.create({
        uid: 'demo-doctor-01',
        fullName: 'Dr. Sarah Jenkins, MD',
        email: defaultDoctorEmail,
        passwordHash: doctorPass,
        role: 'doctor',
        phone: '5552345678',
        doctorDetails: {
          specialization: 'Pediatric Immunization & Preventative Care',
          licenseNumber: 'LIC-MED-84920',
          hospital: 'Metro Children & Vaccine Center',
          experienceYears: '12',
          verified: true
        },
        patientDetails: null,
        status: 'active',
        createdAtIso: now,
        lastLoginIso: now
      });
      console.log('✅ [MongoDB] Demo Doctor created (doctor@immu-track.org).');
    } else if (doc.phone && doc.phone.includes('+1')) {
      doc.phone = doc.phone.replace(/\D/g, '').slice(-10);
      await doc.save();
    }

    // Check patient
    let pat = await User.findOne({ email: defaultPatientEmail });
    if (!pat) {
      await User.create({
        uid: 'demo-patient-01',
        fullName: 'Alex Vance',
        email: defaultPatientEmail,
        passwordHash: patientPass,
        role: 'patient',
        phone: '5558765432',
        doctorDetails: null,
        patientDetails: {
          dob: '2020-03-12',
          gender: 'Male',
          bloodGroup: 'B+',
          emergencyContact: 'Eli Vance (Parent) • 5553456789',
          allergies: 'Penicillin (mild sensitivity)'
        },
        status: 'active',
        createdAtIso: now,
        lastLoginIso: now
      });
      console.log('✅ [MongoDB] Demo Patient created (patient@immu-track.org).');
    } else {
      let changed = false;
      if (pat.phone && pat.phone.includes('+1')) {
        pat.phone = pat.phone.replace(/\D/g, '').slice(-10);
        changed = true;
      }
      if (pat.patientDetails && pat.patientDetails.emergencyContact && pat.patientDetails.emergencyContact.includes('+1')) {
        pat.patientDetails.emergencyContact = pat.patientDetails.emergencyContact
          .replace(/\+1\s*\(([0-9]{3})\)\s*([0-9]{3})-([0-9]{4})/g, '$1$2$3')
          .replace(/\+1\s*([0-9]{10})/g, '$1');
        pat.markModified('patientDetails');
        changed = true;
      }
      if (changed) await pat.save();
    }
  } catch (error) {
    console.error('Seed demo users error:', error.message);
  }
}

// Call on startup
ensureDemoUsersSeeded();

/**
 * POST /api/auth/seed-demo
 * Ensure sample Doctor and Patient exist in database for easy 1-click testing
 */
router.post('/seed-demo', async (req, res) => {
  try {
    await ensureDemoUsersSeeded();
    return res.json({
      success: true,
      message: 'Demo credentials ready for testing!',
      demoDoctor: { email: 'doctor@immu-track.org', password: 'Doctor@123', role: 'doctor' },
      demoPatient: { email: 'patient@immu-track.org', password: 'Patient@123', role: 'patient' }
    });
  } catch (error) {
    console.error('Seed demo route error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

