import bcrypt from 'bcryptjs'

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a unique Health Passport ID
 * Format: HP-XXXXX-XXXXX
 */
export function generateHealthPassportId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'HP-'
  
  // First group of 5 characters
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  result += '-'
  
  // Second group of 5 characters
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Generate a unique Doctor ID
 * Format: DOC-XXXXXXXX
 */
export function generateDoctorId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'DOC-'
  
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Generate a unique Hospital ID
 * Format: HOS-YYYY-XXXXXX
 */
export function generateHospitalId(): string {
  const currentYear = new Date().getFullYear()
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = `HOS-${currentYear}-`
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Validate Health Passport ID format
 */
export function validateHealthPassportId(id: string): boolean {
  const regex = /^HP-[A-Z0-9]{5}-[A-Z0-9]{5}$/
  return regex.test(id)
}

/**
 * Validate Medical License Number format
 */
export function validateMedicalLicense(license: string): boolean {
  const regex = /^ML-[A-Z0-9]{7}$/
  return regex.test(license)
}

/**
 * Validate Aadhar Number (12 digits)
 */
export function validateAadharNumber(aadhar: string): boolean {
  const digitsOnly = aadhar.replace(/[^0-9]/g, '')
  return digitsOnly.length === 12
}

/**
 * Format Aadhar number with dashes
 */
export function formatAadharNumber(aadhar: string): string {
  const digitsOnly = aadhar.replace(/[^0-9]/g, '')
  if (digitsOnly.length !== 12) return aadhar
  
  return `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 8)}-${digitsOnly.slice(8, 12)}`
}
