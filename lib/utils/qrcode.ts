import crypto from 'crypto';
import CryptoJS from 'crypto-js';

// Encryption configuration
const ENCRYPTION_KEY = process.env.QR_ENCRYPTION_KEY || 'health-passport-qr-key-2025-secure';
const ALGORITHM = 'aes-256-gcm';

// QR Code data types
export enum QRCodeType {
  FULL = 'full',
  EMERGENCY = 'emergency',
  LIMITED = 'limited',
  TEMPORARY = 'temporary',
  HOSPITAL = 'hospital'
}

// QR Code permissions
export enum QRPermission {
  VIEW_BASIC_INFO = 'view_basic_info',
  VIEW_MEDICAL_HISTORY = 'view_medical_history',
  VIEW_MEDICATIONS = 'view_medications',
  VIEW_VITALS = 'view_vitals',
  VIEW_DOCUMENTS = 'view_documents',
  VIEW_EMERGENCY_INFO = 'view_emergency_info',
  VIEW_CONTACT_INFO = 'view_contact_info',
  EMERGENCY_ACCESS = 'emergency_access'
}

// QR Code data structure
export interface QRCodeData {
  version: string;
  type: QRCodeType;
  patientId: string;
  hospitalId?: string;
  doctorId?: string;
  permissions: QRPermission[];
  expiresAt?: Date;
  emergencyInfo?: {
    bloodType: string;
    allergies: string[];
    criticalConditions: string[];
    emergencyContacts: Array<{
      name: string;
      relationship: string;
      phone: string;
    }>;
    medicalAlerts: string[];
  };
  limitedData?: {
    appointmentId?: string;
    visitId?: string;
    specificPurpose?: string;
  };
  metadata: {
    generatedBy: string;
    generatedAt: Date;
    purpose: string;
    qrId: string;
  };
}

// Encrypt data for QR code
export function encryptQRData(data: QRCodeData): string {
  try {
    const jsonData = JSON.stringify(data);
    
    // Use AES encryption with CryptoJS
    const encrypted = CryptoJS.AES.encrypt(jsonData, ENCRYPTION_KEY).toString();
    
    // Add version prefix and base64 encode for QR compatibility
    const versionedData = `HPv2:${encrypted}`;
    return Buffer.from(versionedData).toString('base64');
  } catch (error) {
    console.error('QR data encryption error:', error);
    throw new Error('Failed to encrypt QR data');
  }
}

// Decrypt QR code data
export function decryptQRData(encryptedData: string): QRCodeData {
  try {
    // Decode from base64
    const versionedData = Buffer.from(encryptedData, 'base64').toString('utf-8');
    
    // Check version
    if (!versionedData.startsWith('HPv2:')) {
      throw new Error('Invalid QR code version');
    }
    
    // Extract encrypted data
    const encrypted = versionedData.substring(5);
    
    // Decrypt with CryptoJS
    const decryptedBytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedData) {
      throw new Error('Failed to decrypt QR data');
    }
    
    const data = JSON.parse(decryptedData) as QRCodeData;
    
    // Validate data structure
    if (!data.version || !data.type || !data.patientId) {
      throw new Error('Invalid QR data structure');
    }
    
    return data;
  } catch (error) {
    console.error('QR data decryption error:', error);
    throw new Error('Failed to decrypt QR data');
  }
}

// Generate QR ID
export function generateQRId(): string {
  return `qr_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

// Validate QR code data
export function validateQRCode(data: QRCodeData): {
  isValid: boolean;
  errors: string[];
  isExpired: boolean;
} {
  const errors: string[] = [];
  
  // Check required fields
  if (!data.version) errors.push('Missing version');
  if (!data.type) errors.push('Missing type');
  if (!data.patientId) errors.push('Missing patient ID');
  if (!data.metadata?.generatedBy) errors.push('Missing generator info');
  
  // Check expiration
  const isExpired = data.expiresAt ? new Date() > new Date(data.expiresAt) : false;
  if (isExpired) errors.push('QR code has expired');
  
  // Validate permissions
  if (!Array.isArray(data.permissions) || data.permissions.length === 0) {
    errors.push('Invalid permissions');
  }
  
  // Type-specific validation
  switch (data.type) {
    case QRCodeType.EMERGENCY:
      if (!data.emergencyInfo) {
        errors.push('Emergency QR requires emergency info');
      }
      break;
    case QRCodeType.LIMITED:
      if (!data.limitedData) {
        errors.push('Limited QR requires limited data specification');
      }
      break;
    case QRCodeType.TEMPORARY:
      if (!data.expiresAt) {
        errors.push('Temporary QR requires expiration date');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0 && !isExpired,
    errors,
    isExpired
  };
}

// Create different types of QR codes
export function createFullAccessQR(
  patientId: string,
  generatedBy: string,
  options: {
    hospitalId?: string;
    doctorId?: string;
    purpose?: string;
    expiresIn?: number; // hours
  } = {}
): QRCodeData {
  const qrId = generateQRId();
  const expiresAt = options.expiresIn 
    ? new Date(Date.now() + options.expiresIn * 60 * 60 * 1000)
    : undefined;
  
  return {
    version: '2.0',
    type: QRCodeType.FULL,
    patientId,
    hospitalId: options.hospitalId,
    doctorId: options.doctorId,
    permissions: [
      QRPermission.VIEW_BASIC_INFO,
      QRPermission.VIEW_MEDICAL_HISTORY,
      QRPermission.VIEW_MEDICATIONS,
      QRPermission.VIEW_VITALS,
      QRPermission.VIEW_DOCUMENTS,
      QRPermission.VIEW_CONTACT_INFO
    ],
    expiresAt,
    metadata: {
      generatedBy,
      generatedAt: new Date(),
      purpose: options.purpose || 'Full medical record access',
      qrId
    }
  };
}

export function createEmergencyQR(
  patientId: string,
  emergencyInfo: QRCodeData['emergencyInfo'],
  generatedBy: string,
  options: {
    purpose?: string;
  } = {}
): QRCodeData {
  const qrId = generateQRId();
  
  return {
    version: '2.0',
    type: QRCodeType.EMERGENCY,
    patientId,
    permissions: [
      QRPermission.VIEW_BASIC_INFO,
      QRPermission.VIEW_EMERGENCY_INFO,
      QRPermission.EMERGENCY_ACCESS
    ],
    emergencyInfo,
    metadata: {
      generatedBy,
      generatedAt: new Date(),
      purpose: options.purpose || 'Emergency medical information access',
      qrId
    }
  };
}

export function createLimitedQR(
  patientId: string,
  permissions: QRPermission[],
  generatedBy: string,
  options: {
    hospitalId?: string;
    doctorId?: string;
    appointmentId?: string;
    visitId?: string;
    specificPurpose?: string;
    expiresIn?: number; // hours
  } = {}
): QRCodeData {
  const qrId = generateQRId();
  const expiresAt = options.expiresIn 
    ? new Date(Date.now() + options.expiresIn * 60 * 60 * 1000)
    : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24 hours
  
  return {
    version: '2.0',
    type: QRCodeType.LIMITED,
    patientId,
    hospitalId: options.hospitalId,
    doctorId: options.doctorId,
    permissions,
    expiresAt,
    limitedData: {
      appointmentId: options.appointmentId,
      visitId: options.visitId,
      specificPurpose: options.specificPurpose
    },
    metadata: {
      generatedBy,
      generatedAt: new Date(),
      purpose: options.specificPurpose || 'Limited access QR code',
      qrId
    }
  };
}

export function createTemporaryQR(
  patientId: string,
  permissions: QRPermission[],
  generatedBy: string,
  expiresInHours: number,
  options: {
    hospitalId?: string;
    doctorId?: string;
    purpose?: string;
  } = {}
): QRCodeData {
  const qrId = generateQRId();
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  
  return {
    version: '2.0',
    type: QRCodeType.TEMPORARY,
    patientId,
    hospitalId: options.hospitalId,
    doctorId: options.doctorId,
    permissions,
    expiresAt,
    metadata: {
      generatedBy,
      generatedAt: new Date(),
      purpose: options.purpose || `Temporary access (${expiresInHours}h)`,
      qrId
    }
  };
}

// Filter data based on permissions
export function filterDataByPermissions(
  patientData: any,
  permissions: QRPermission[]
): any {
  const filteredData: any = {};
  
  if (permissions.includes(QRPermission.VIEW_BASIC_INFO)) {
    filteredData.basicInfo = {
      firstName: patientData.personalInfo?.firstName,
      lastName: patientData.personalInfo?.lastName,
      dateOfBirth: patientData.personalInfo?.dateOfBirth,
      bloodType: patientData.personalInfo?.bloodType,
      healthPassportId: patientData.healthPassportId
    };
  }
  
  if (permissions.includes(QRPermission.VIEW_MEDICAL_HISTORY)) {
    filteredData.medicalHistory = patientData.medicalHistory;
  }
  
  if (permissions.includes(QRPermission.VIEW_MEDICATIONS)) {
    filteredData.medications = patientData.medications;
  }
  
  if (permissions.includes(QRPermission.VIEW_VITALS)) {
    filteredData.vitals = patientData.vitals;
  }
  
  if (permissions.includes(QRPermission.VIEW_DOCUMENTS)) {
    filteredData.documents = patientData.documents;
  }
  
  if (permissions.includes(QRPermission.VIEW_CONTACT_INFO)) {
    filteredData.contactInfo = {
      email: patientData.personalInfo?.email,
      phone: patientData.personalInfo?.phone,
      address: patientData.personalInfo?.address
    };
  }
  
  if (permissions.includes(QRPermission.VIEW_EMERGENCY_INFO)) {
    filteredData.emergencyInfo = patientData.emergencyInfo || {
      bloodType: patientData.personalInfo?.bloodType,
      emergencyContacts: patientData.emergencyContacts,
      allergies: patientData.allergies,
      criticalConditions: patientData.criticalConditions
    };
  }
  
  return filteredData;
}

// Generate secure hash for QR data integrity
export function generateQRHash(data: QRCodeData): string {
  const dataString = JSON.stringify(data);
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

// Verify QR data integrity
export function verifyQRHash(data: QRCodeData, hash: string): boolean {
  const calculatedHash = generateQRHash(data);
  return calculatedHash === hash;
}
