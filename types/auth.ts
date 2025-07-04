import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'patient' | 'doctor' | 'hospital'
      healthPassportId?: string
      doctorId?: string
      hospitalId?: string
      specialty?: string
      facilityType?: string
      verified?: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: 'patient' | 'doctor' | 'hospital'
    healthPassportId?: string
    doctorId?: string
    hospitalId?: string
    specialty?: string
    facilityType?: string
    verified?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'patient' | 'doctor' | 'hospital'
    userId: string
    healthPassportId?: string
    doctorId?: string
    hospitalId?: string
    specialty?: string
    facilityType?: string
    verified?: boolean
  }
}

export interface User {
  id: string
  email: string
  role: 'patient' | 'doctor' | 'hospital'
  name: string
}

export interface AuthSession {
  user: User
  expires: string
}

export interface LoginCredentials {
  email?: string
  healthPassportId?: string
  doctorId?: string
  hospitalId?: string
  password: string
}

export interface RegisterPatientData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  bloodType: string
  aadharNumber: string
  password: string
}

export interface RegisterDoctorData {
  firstName: string
  lastName: string
  email: string
  phone: string
  licenseNumber: string
  specialty: string
  hospitalAffiliation: string
  password: string
}

export interface RegisterHospitalData {
  facilityName: string
  facilityType: string
  adminFirstName: string
  adminLastName: string
  email: string
  phone: string
  address: string
  licenseNumber: string
  password: string
}
