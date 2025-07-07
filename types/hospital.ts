export interface HospitalFacilityInfo {
  name: string
  type: 'hospital' | 'clinic' | 'urgent-care' | 'specialty' | 'laboratory' | 'pharmacy'
  address: string
  phone: string
  email: string
  licenseNumber: string
}

export interface HospitalAdminInfo {
  firstName: string
  lastName: string
  email: string
}

export interface StaffMember {
  doctorId: string
  role: 'doctor' | 'nurse' | 'admin' | 'technician'
  permissions: string[]
  addedDate: Date
}

export interface Hospital {
  _id?: string
  hospitalId: string // HOS-YYYY-XXXXXX
  facilityInfo: HospitalFacilityInfo
  adminInfo: HospitalAdminInfo
  staff: StaffMember[]
  verified: boolean
  password: string // Will be hashed
  role: 'hospital'
  createdAt: Date
  updatedAt: Date
}
