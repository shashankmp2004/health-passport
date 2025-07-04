import mongoose, { Schema, Document } from 'mongoose'
import type { Patient } from '@/types/patient'

export interface IPatient extends Omit<Patient, '_id'>, Document {}

const MedicalHistorySchema = new Schema({
  condition: { type: String, required: true },
  diagnosedDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['active', 'resolved', 'chronic'], 
    default: 'active' 
  },
  doctorId: { type: String, required: true },
  notes: { type: String }
}, { _id: true })

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
  dateOfBirth: { type: Date, required: true },
  bloodType: { type: String, required: true },
  aadharNumber: { type: String, required: true }, // Will be encrypted
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true }
}, { _id: false })

const PatientSchema = new Schema({
  healthPassportId: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^HP-[A-Z0-9]{5}-[A-Z0-9]{5}$/
  },
  personalInfo: { type: PersonalInfoSchema, required: true },
  medicalHistory: [MedicalHistorySchema],
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
