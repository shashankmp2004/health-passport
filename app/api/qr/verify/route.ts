import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import { 
  decryptQRData, 
  validateQRCode, 
  generateQRHash,
  verifyQRHash 
} from '@/lib/utils/qrcode';
import { FileAuditLogger, FileActivityType } from '@/lib/models/FileAuditLog';

// POST - Verify QR code authenticity and validity
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const { qrData, verifyIntegrity, expectedHash } = await request.json();

    if (!qrData) {
      return NextResponse.json(
        { error: 'QR data is required' },
        { status: 400 }
      );
    }

    // Extract client information for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Connect to database
    await dbConnect();

    let decodedData;
    let verificationResult = {
      isValid: false,
      isExpired: false,
      isAuthentic: false,
      integrityCheck: false,
      errors: [] as string[],
      warnings: [] as string[]
    };

    // Step 1: Decrypt QR data
    try {
      decodedData = decryptQRData(qrData);
      verificationResult.isAuthentic = true;
    } catch (decryptError) {
      verificationResult.errors.push('Invalid QR format or decryption failed');
      verificationResult.isAuthentic = false;
    }

    if (decodedData) {
      // Step 2: Validate QR structure and content
      const validation = validateQRCode(decodedData);
      verificationResult.isValid = validation.isValid;
      verificationResult.isExpired = validation.isExpired;
      verificationResult.errors.push(...validation.errors);

      // Step 3: Verify data integrity if hash provided
      if (verifyIntegrity && expectedHash) {
        verificationResult.integrityCheck = verifyQRHash(decodedData, expectedHash);
        if (!verificationResult.integrityCheck) {
          verificationResult.errors.push('Data integrity check failed');
        }
      }

      // Step 4: Additional security checks
      const securityChecks = performSecurityChecks(decodedData);
      verificationResult.warnings.push(...securityChecks.warnings);
      if (securityChecks.critical.length > 0) {
        verificationResult.errors.push(...securityChecks.critical);
        verificationResult.isValid = false;
      }
    }

    // Log verification attempt
    await FileAuditLogger.logActivity({
      fileId: decodedData?.metadata?.qrId || 'unknown_qr',
      fileName: `QR Verification - ${decodedData?.type || 'unknown'}`,
      fileType: 'qr_code',
      activity: FileActivityType.VIEW,
      description: `QR verification: ${verificationResult.isValid ? 'VALID' : 'INVALID'} - ${verificationResult.errors.join(', ') || 'No errors'}`,
      userId: session.user.id,
      userRole: session.user.role,
      userName: session.user.name || session.user.email || 'Unknown user',
      ipAddress,
      userAgent,
      patientId: decodedData?.patientId,
      metadata: {
        verificationResult,
        qrType: decodedData?.type,
        permissions: decodedData?.permissions,
        integrityChecked: verifyIntegrity
      },
      accessGranted: verificationResult.isValid,
      accessReason: verificationResult.isValid ? 'Valid QR code' : verificationResult.errors.join(', '),
      securityFlags: verificationResult.isValid ? [] : ['invalid_qr_verification'],
    });

    // Prepare response
    const response: any = {
      success: true,
      data: {
        verification: verificationResult,
        timestamp: new Date(),
        verifiedBy: {
          id: session.user.id,
          role: session.user.role,
          name: session.user.name || session.user.email
        }
      }
    };

    // Include QR details if valid and user has permission
    if (verificationResult.isValid && decodedData) {
      const canViewDetails = await canViewQRDetails(session.user.id, session.user.role, decodedData);
      
      if (canViewDetails) {
        response.data.qr = {
          id: decodedData.metadata.qrId,
          type: decodedData.type,
          purpose: decodedData.metadata.purpose,
          generatedAt: decodedData.metadata.generatedAt,
          generatedBy: decodedData.metadata.generatedBy,
          expiresAt: decodedData.expiresAt,
          permissions: decodedData.permissions,
          patientId: decodedData.patientId,
          hospitalId: decodedData.hospitalId,
          doctorId: decodedData.doctorId
        };

        // Generate current hash for integrity verification
        if (verifyIntegrity) {
          response.data.integrity = {
            currentHash: generateQRHash(decodedData),
            providedHash: expectedHash,
            matches: verificationResult.integrityCheck
          };
        }
      } else {
        response.data.qr = {
          type: decodedData.type,
          isValid: verificationResult.isValid,
          isExpired: verificationResult.isExpired
        };
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('QR verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error during QR verification' },
      { status: 500 }
    );
  }
}

// Perform additional security checks on QR data
function performSecurityChecks(qrData: any): {
  warnings: string[];
  critical: string[];
} {
  const warnings: string[] = [];
  const critical: string[] = [];

  // Check QR age
  const generatedAt = new Date(qrData.metadata.generatedAt);
  const ageInHours = (Date.now() - generatedAt.getTime()) / (1000 * 60 * 60);
  
  if (ageInHours > 168) { // 1 week
    warnings.push('QR code is older than 1 week');
  }
  
  if (ageInHours > 720) { // 30 days
    critical.push('QR code is older than 30 days and may be compromised');
  }

  // Check for suspicious patterns
  if (qrData.permissions && qrData.permissions.length > 6) {
    warnings.push('QR code has unusually broad permissions');
  }

  // Validate QR version
  if (!qrData.version || qrData.version < '2.0') {
    warnings.push('QR code uses an older format version');
  }

  // Check expiration buffer
  if (qrData.expiresAt) {
    const expiresAt = new Date(qrData.expiresAt);
    const timeToExpiry = expiresAt.getTime() - Date.now();
    const hoursToExpiry = timeToExpiry / (1000 * 60 * 60);
    
    if (hoursToExpiry < 1 && hoursToExpiry > 0) {
      warnings.push('QR code expires within 1 hour');
    }
  }

  return { warnings, critical };
}

// Check if user can view detailed QR information
async function canViewQRDetails(
  userId: string,
  userRole: string,
  qrData: any
): Promise<boolean> {
  
  // Patient can view their own QR details
  if (userRole === 'patient' && userId === qrData.patientId) {
    return true;
  }

  // QR generator can view details
  if (userId === qrData.metadata.generatedBy) {
    return true;
  }

  // Hospital/Doctor specified in QR can view details
  if (userRole === 'hospital' && userId === qrData.hospitalId) {
    return true;
  }

  if (userRole === 'doctor' && userId === qrData.doctorId) {
    return true;
  }

  // For verification purposes, basic validation info is sufficient
  return false;
}
