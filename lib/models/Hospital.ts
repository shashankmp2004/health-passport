import mongoose, { Schema, Document } from 'mongoose'
import type { Hospital } from '@/types/hospital'

export interface IHospital extends Omit<Hospital, '_id'>, Document {}

const HospitalFacilityInfoSchema = new Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['hospital', 'clinic', 'urgent-care', 'specialty', 'laboratory', 'pharmacy'],
    required: true 
  },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  licenseNumber: { type: String, required: true, unique: true }
}, { _id: false })

const HospitalAdminInfoSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true }
}, { _id: false })

const StaffMemberSchema = new Schema({
  doctorId: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['doctor', 'nurse', 'admin', 'technician'],
    required: true 
  },
  permissions: [{ type: String }],
  addedDate: { type: Date, default: Date.now }
}, { _id: true })

const HospitalSchema = new Schema({
  hospitalId: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^HOS-\d{4}-[A-Z0-9]{6}$/
  },
  facilityInfo: { type: HospitalFacilityInfoSchema, required: true },
  adminInfo: { type: HospitalAdminInfoSchema, required: true },
  staff: [StaffMemberSchema],
  verified: { type: Boolean, default: false },
  password: { type: String, required: true }, // Will be hashed
  role: { type: String, default: 'hospital', immutable: true }
}, {
  timestamps: true,
  collection: 'hospitals'
})

// Indexes for better performance
HospitalSchema.index({ hospitalId: 1 })
HospitalSchema.index({ 'facilityInfo.email': 1 })
HospitalSchema.index({ 'facilityInfo.licenseNumber': 1 })
HospitalSchema.index({ 'facilityInfo.type': 1 })

export default mongoose.models.Hospital || mongoose.model<IHospital>('Hospital', HospitalSchema)
