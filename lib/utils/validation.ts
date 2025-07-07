import { z } from 'zod'

// Patient Registration Validation
export const patientRegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    return age >= 0 && age <= 150
  }, 'Invalid date of birth'),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  aadharNumber: z.string().refine((aadhar) => {
    const digitsOnly = aadhar.replace(/[^0-9]/g, '')
    return digitsOnly.length === 12
  }, 'Invalid Aadhar number'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

// Doctor Registration Validation
export const doctorRegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  licenseNumber: z.string().regex(/^ML-[A-Z0-9]{7}$/, 'Invalid medical license format'),
  specialty: z.string().min(2, 'Specialty is required'),
  hospitalAffiliation: z.string().min(2, 'Hospital affiliation is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

// Hospital Registration Validation
export const hospitalRegistrationSchema = z.object({
  facilityName: z.string().min(2, 'Facility name must be at least 2 characters'),
  facilityType: z.enum(['hospital', 'clinic', 'urgent-care', 'specialty', 'laboratory', 'pharmacy']),
  adminFirstName: z.string().min(2, 'Admin first name must be at least 2 characters'),
  adminLastName: z.string().min(2, 'Admin last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  licenseNumber: z.string().min(5, 'License number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

// Login Validation
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or ID is required'),
  password: z.string().min(1, 'Password is required')
})

// Medical Record Validation
export const medicalRecordSchema = z.object({
  condition: z.string().min(2, 'Condition must be specified'),
  diagnosedDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  status: z.enum(['active', 'resolved', 'chronic']),
  notes: z.string().optional()
})

// Medication Validation
export const medicationSchema = z.object({
  name: z.string().min(2, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  endDate: z.string().optional().refine((date) => {
    if (!date) return true
    return !isNaN(Date.parse(date))
  }, 'Invalid end date')
})

// Vital Signs Validation
export const vitalSignSchema = z.object({
  type: z.enum(['blood_pressure', 'heart_rate', 'weight', 'height', 'temperature', 'oxygen_saturation']),
  value: z.string().min(1, 'Value is required'),
  unit: z.string().min(1, 'Unit is required'),
  recordedDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date')
})
