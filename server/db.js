const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vaccinescheduler';

if (!process.env.MONGODB_URI) {
  console.warn('⚠️ [MongoDB Atlas] MONGODB_URI environment variable not detected. Falling back to default URI.');
  console.warn('ℹ️ To connect to your cloud database, set MONGODB_URI in your .env file (see .env.example) or hosting environment variables.');
}

/**
 * Connect to MongoDB Atlas
 */
async function connectDB(retries = 5, delayMs = 2000) {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set('strictQuery', false);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000
      });

      console.log(`✅ [MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
      console.log(`📡 [MongoDB Database]: ${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ [MongoDB Attempt ${attempt}/${retries}]: ${err.message}`);
      if (attempt >= retries) {
        console.error('❌ [MongoDB Connection Error]: All retry attempts failed.');
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ [MongoDB Atlas] Connection disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 [MongoDB Atlas] Reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ [MongoDB Atlas Error]:', err.message);
});

/**
 * User Schema
 * Represents both Doctors and Patients in the VaccineScheduler system
 */
const UserSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['doctor', 'patient'],
    required: true,
    index: true
  },
  phone: {
    type: String,
    default: ''
  },
  altPhone: {
    type: String,
    default: ''
  },
  doctorDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  patientDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  upcomingDoses: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  completedHistory: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  notifications: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  status: {
    type: String,
    default: 'active'
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  createdAtIso: {
    type: String,
    default: () => new Date().toISOString()
  },
  lastLoginIso: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  timestamps: true,
  minimize: false
});

/**
 * PatientRecord Schema
 * Represents clinical patients managed by clinicians in the EHR roster
 */
const PatientRecordSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  doctorId: {
    type: String,
    default: null,
    index: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  mrn: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    default: ''
  },
  bloodGroup: {
    type: String,
    default: ''
  },
  dob: {
    type: String,
    default: null
  },
  ageDisplay: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  emergencyContact: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  insurance: {
    type: String,
    default: ''
  },
  gestationalAge: {
    type: String,
    default: ''
  },
  allergies: {
    type: String,
    default: ''
  },
  riskFactors: {
    type: String,
    default: ''
  },
  protocol: {
    type: String,
    default: 'CDC'
  },
  compliancePercent: {
    type: Number,
    default: 100
  },
  dosesCount: {
    type: String,
    default: '0/0'
  },
  vaccineName: {
    type: String,
    default: ''
  },
  vaccineDescription: {
    type: String,
    default: ''
  },
  doseNumber: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'Upcoming'
  },
  scheduledTimestamp: {
    type: String,
    default: ''
  },
  scheduledDateDisplay: {
    type: String,
    default: ''
  },
  doctorAssigned: {
    type: String,
    default: ''
  },
  clinicAssigned: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  administeredVaccines: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  pendingVaccines: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  clinicalAlerts: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  complianceMilestones: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  lastAdministeredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  minimize: false
});

/**
 * AppointmentRequest Schema
 * Represents incoming appointment booking requests from patients assigned to a specific doctor.
 * The doctor can review, accept, or decline each request.
 * Upon acceptance, patient is automatically enrolled into the doctor's roster.
 */
const AppointmentRequestSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  patientUid: {
    type: String,
    required: true,
    index: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    default: ''
  },
  patientPhone: {
    type: String,
    default: ''
  },
  patientDob: {
    type: String,
    default: null
  },
  patientGender: {
    type: String,
    default: ''
  },
  patientBloodGroup: {
    type: String,
    default: ''
  },
  patientAllergies: {
    type: String,
    default: 'None'
  },
  doctorId: {
    type: String,
    required: true,
    index: true
  },
  doctorName: {
    type: String,
    required: true
  },
  doctorEmail: {
    type: String,
    default: ''
  },
  doctorHospital: {
    type: String,
    default: ''
  },
  doctorSpecialization: {
    type: String,
    default: ''
  },
  vaccineName: {
    type: String,
    required: true
  },
  doseNumber: {
    type: String,
    default: 'Dose 1'
  },
  vaccineDescription: {
    type: String,
    default: ''
  },
  scheduledDate: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: String,
    default: '10:00'
  },
  scheduledDisplay: {
    type: String,
    default: ''
  },
  clinic: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    index: true
  },
  doctorNotes: {
    type: String,
    default: ''
  },
  doseId: {
    type: String,
    default: ''
  },
  createdAtIso: {
    type: String,
    default: () => new Date().toISOString()
  },
  respondedAtIso: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  minimize: false
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const PatientRecord = mongoose.models.PatientRecord || mongoose.model('PatientRecord', PatientRecordSchema);
const AppointmentRequest = mongoose.models.AppointmentRequest || mongoose.model('AppointmentRequest', AppointmentRequestSchema);

module.exports = {
  mongoose,
  connectDB,
  User,
  PatientRecord,
  AppointmentRequest
};
