import mongoose, { Schema, Document } from 'mongoose'
import type { Patient } from '@/types/patient'

export interface IPatient extends Omit<Patient, '_id'>, Document {}

const MedicalConditionSchema = new Schema({
  name: { type: String, required: true },
  diagnosedDate: { type: Date },
  severity: { 
    type: String, 
    enum: ['Mild', 'Moderate', 'Severe'], 
    default: 'Moderate' 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Resolved'], 
    default: 'Active' 
  },
  notes: { type: String }
}, { _id: true })

const AllergySchema = new Schema({
  name: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['Mild', 'Moderate', 'Severe'], 
    default: 'Moderate' 
  },
  reaction: { type: String },
  discoveredDate: { type: Date }
}, { _id: true })

const MedicationHistorySchema = new Schema({
  name: { type: String, required: true },
  dosage: { type: String },
  frequency: { type: String },
  prescribedBy: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Active', 'Discontinued'], 
    default: 'Active' 
  }
}, { _id: true })

const ImmunizationSchema = new Schema({
  name: { type: String, required: true },
  dateAdministered: { type: Date },
  manufacturer: { type: String },
  lotNumber: { type: String },
  administeredBy: { type: String },
  status: { type: String, default: 'Complete' }
}, { _id: true })

const ProcedureSchema = new Schema({
  name: { type: String, required: true },
  date: { type: Date },
  surgeon: { type: String },
  hospital: { type: String },
  description: { type: String },
  outcome: { type: String },
  status: { 
    type: String, 
    enum: ['Completed', 'Scheduled', 'Cancelled'], 
    default: 'Completed' 
  }
}, { _id: true })

const LabResultSchema = new Schema({
  testName: { type: String, required: true },
  date: { type: Date },
  orderedBy: { type: String },
  results: { type: String },
  referenceRange: { type: String },
  status: { 
    type: String, 
    enum: ['Normal', 'Abnormal', 'Critical'], 
    default: 'Normal' 
  },
  notes: { type: String },
  attachments: [{
    id: { type: String },
    name: { type: String },
    url: { type: String },
    public_id: { type: String },
    type: { type: String },
    size: { type: Number }
  }]
}, { _id: true })

const VitalSignHistorySchema = new Schema({
  date: { type: Date },
  bloodPressure: { type: String },
  heartRate: { type: String },
  temperature: { type: String },
  weight: { type: String },
  height: { type: String },
  recordedBy: { type: String }
}, { _id: true })

const MedicalHistorySchema = new Schema({
  conditions: [MedicalConditionSchema],
  allergies: [AllergySchema],
  medications: [MedicationHistorySchema],
  immunizations: [ImmunizationSchema],
  procedures: [ProcedureSchema],
  labResults: [LabResultSchema],
  vitalSigns: [VitalSignHistorySchema]
}, { _id: false })

const MedicationSchema = new Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  prescribedBy: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'discontinued'], 
    default: 'active' 
  }
}, { _id: true })

const VitalSignSchema = new Schema({
  type: { 
    type: String, 
    enum: ['blood_pressure', 'heart_rate', 'weight', 'height', 'temperature', 'oxygen_saturation'],
    required: true 
  },
  value: { type: String, required: true },
  unit: { type: String, required: true },
  recordedDate: { type: Date, required: true },
  recordedBy: { type: String, required: true }
}, { _id: true })

const VisitSchema = new Schema({
  hospitalId: { type: String, required: true },
  doctorId: { type: String, required: true },
  date: { type: Date, required: true },
  diagnosis: { type: String, required: true },
  treatment: { type: String, required: true },
  notes: { type: String },
  visitType: { 
    type: String, 
    enum: ['routine', 'emergency', 'follow_up', 'consultation'],
    default: 'routine'
  }
}, { _id: true })

const DocumentSchema = new Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['lab_report', 'prescription', 'scan', 'insurance', 'other'],
    required: true 
  },
  uploadedDate: { type: Date, required: true },
  uploadedBy: { type: String, required: true },
  description: { type: String }
}, { _id: true })

const PersonalInfoSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String },
  bloodType: { type: String },
  aadharNumber: { type: String }, // Will be encrypted
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String }
  }
}, { _id: false })

const PatientSchema = new Schema({
  healthPassportId: { 
    type: String, 
    required: true, 
    unique: true
  },
  personalInfo: { type: PersonalInfoSchema, required: true },
  medicalHistory: { type: MedicalHistorySchema, default: {} },
  medications: [MedicationSchema],
  vitals: [VitalSignSchema],
  visits: [VisitSchema],
  documents: [DocumentSchema],
  qrCode: { type: String },
  password: { type: String, required: true } // Will be hashed
}, {
  timestamps: true,
  collection: 'patients'
})

// Indexes for better performance
PatientSchema.index({ healthPassportId: 1 })
PatientSchema.index({ 'personalInfo.email': 1 })
PatientSchema.index({ 'personalInfo.aadharNumber': 1 })

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema)
