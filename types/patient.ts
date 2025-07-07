export interface PatientPersonalInfo {
  firstName: string
  lastName: string
  dateOfBirth: Date
  bloodType: string
  aadharNumber: string // Will be encrypted
  phone: string
  email: string
}

export interface MedicalHistory {
  condition: string
  diagnosedDate: Date
  status: 'active' | 'resolved' | 'chronic'
  doctorId: string
  notes?: string
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  prescribedBy: string
  startDate: Date
  endDate?: Date
  status: 'active' | 'discontinued'
}

export interface VitalSign {
  type: 'blood_pressure' | 'heart_rate' | 'weight' | 'height' | 'temperature' | 'oxygen_saturation'
  value: string
  unit: string
  recordedDate: Date
  recordedBy: string
}

export interface Visit {
  hospitalId: string
  doctorId: string
  date: Date
  diagnosis: string
  treatment: string
  notes?: string
  visitType: 'routine' | 'emergency' | 'follow_up' | 'consultation'
}

export interface Document {
  fileName: string
  fileUrl: string
  type: 'lab_report' | 'prescription' | 'scan' | 'insurance' | 'other'
  uploadedDate: Date
  uploadedBy: string
  description?: string
}

export interface Patient {
  _id?: string
  healthPassportId: string // HP-XXXXX-XXXXX
  personalInfo: PatientPersonalInfo
  medicalHistory: MedicalHistory[]
  medications: Medication[]
  vitals: VitalSign[]
  visits: Visit[]
  documents: Document[]
  qrCode?: string
  createdAt: Date
  updatedAt: Date
}
