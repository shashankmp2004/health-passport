import mongoose, { Schema, Document } from 'mongoose'
import type { Doctor } from '@/types/doctor'

export interface IDoctor extends Omit<Doctor, '_id'>, Document {}

const DoctorPersonalInfoSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  licenseNumber: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^ML-[A-Z0-9]{7}$/
  },
  specialty: { type: String, required: true },
  hospitalAffiliation: { type: String, required: true }
}, { _id: false })

const DoctorCredentialsSchema = new Schema({
  verified: { type: Boolean, default: false },
  verificationDate: { type: Date },
  verifiedBy: { type: String },
  licenseExpiry: { type: Date }
}, { _id: false })

const DoctorSchema = new Schema({
  doctorId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  personalInfo: { type: DoctorPersonalInfoSchema, required: true },
  credentials: { type: DoctorCredentialsSchema, required: true },
  password: { type: String, required: true }, // Will be hashed
  role: { type: String, default: 'doctor', immutable: true }
}, {
  timestamps: true,
  collection: 'doctors'
})

// Indexes for better performance
DoctorSchema.index({ doctorId: 1 })
DoctorSchema.index({ 'personalInfo.email': 1 })
DoctorSchema.index({ 'personalInfo.licenseNumber': 1 })
DoctorSchema.index({ 'personalInfo.specialty': 1 })

export default mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema)
