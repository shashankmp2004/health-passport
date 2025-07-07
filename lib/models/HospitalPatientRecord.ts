import mongoose, { Schema, Document } from 'mongoose'

export interface IHospitalPatientRecord extends Document {
  hospitalId: string
  hospitalName: string
  healthPassportId: string
  patientName: string
  patientAge: string | number
  bloodType?: string
  emergencyContact?: string
  riskLevel: 'Low' | 'Moderate' | 'High'
  conditions: string[]
  allergies: string[]
  addedDate: Date
  lastUpdated: Date
  status: 'active' | 'inactive' | 'transferred'
  notes?: string
  accessLevel: 'limited' | 'standard' | 'full'
  lastVisitDate?: Date
  totalVisits?: number
  metadata: {
    addedBy: string
    addedByName: string
    addMethod: 'qr_scan' | 'manual_entry' | 'hospital_search' | 'referral'
    originalData?: any
  }
}

const HospitalPatientRecordSchema = new Schema<IHospitalPatientRecord>({
  hospitalId: {
    type: String,
    required: true,
    index: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  healthPassportId: {
    type: String,
    required: true,
    index: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientAge: {
    type: Schema.Types.Mixed, // Can be string or number
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown'
  },
  emergencyContact: {
    type: String
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Moderate', 'High'],
    default: 'Low'
  },
  conditions: [{
    type: String
  }],
  allergies: [{
    type: String
  }],
  addedDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'transferred'],
    default: 'active'
  },
  notes: {
    type: String
  },
  accessLevel: {
    type: String,
    enum: ['limited', 'standard', 'full'],
    default: 'standard'
  },
  lastVisitDate: {
    type: Date
  },
  totalVisits: {
    type: Number,
    default: 0
  },
  metadata: {
    addedBy: {
      type: String,
      required: true
    },
    addedByName: {
      type: String,
      required: true
    },
    addMethod: {
      type: String,
      enum: ['qr_scan', 'manual_entry', 'hospital_search', 'referral'],
      required: true
    },
    originalData: {
      type: Schema.Types.Mixed
    }
  }
}, {
  timestamps: true
})

// Compound index for hospital-patient uniqueness
HospitalPatientRecordSchema.index({ hospitalId: 1, healthPassportId: 1 }, { unique: true })

// Index for searching patients within a hospital
HospitalPatientRecordSchema.index({ hospitalId: 1, patientName: 1 })
HospitalPatientRecordSchema.index({ hospitalId: 1, status: 1 })
HospitalPatientRecordSchema.index({ hospitalId: 1, riskLevel: 1 })

const HospitalPatientRecord = mongoose.models.HospitalPatientRecord || mongoose.model<IHospitalPatientRecord>('HospitalPatientRecord', HospitalPatientRecordSchema)

export default HospitalPatientRecord
