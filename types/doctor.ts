export interface DoctorPersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  licenseNumber: string // ML-XXXXXXX
  specialty: string
  hospitalAffiliation: string
}

export interface DoctorCredentials {
  verified: boolean
  verificationDate?: Date
  verifiedBy?: string
  licenseExpiry?: Date
}

export interface Doctor {
  _id?: string
  doctorId: string
  personalInfo: DoctorPersonalInfo
  credentials: DoctorCredentials
  password: string // Will be hashed
  role: 'doctor'
  createdAt: Date
  updatedAt: Date
}
