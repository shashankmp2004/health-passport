import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import { 
  decryptQRData, 
  validateQRCode, 
  filterDataByPermissions,
  QRCodeType,
  QRPermission 
} from '@/lib/utils/qrcode';
import { FileAuditLogger, FileActivityType } from '@/lib/models/FileAuditLog';

// POST - Scan and decode QR code
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

    const { qrData, purpose } = await request.json();

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
    try {
      // Decrypt and decode QR data
      decodedData = decryptQRData(qrData);
    } catch (decryptError) {
      // Log failed scan attempt
      await FileAuditLogger.logActivity({
        fileId: 'unknown_qr',
        fileName: 'QR Code Scan',
        fileType: 'qr_code',
        activity: FileActivityType.ACCESS_DENIED,
        description: `QR scan failed - invalid or corrupted data`,
        userId: session.user.id,
        userRole: session.user.role,
        userName: session.user.name || session.user.email || 'Unknown user',
        ipAddress,
        userAgent,
        accessGranted: false,
        accessReason: 'Invalid QR data format',
        securityFlags: ['invalid_qr_data'],
      });

      return NextResponse.json(
        { error: 'Invalid QR code format or corrupted data' },
        { status: 400 }
      );
    }

    // Validate QR code
    const validation = validateQRCode(decodedData);
    if (!validation.isValid) {
      // Log invalid QR attempt
      await FileAuditLogger.logActivity({
        fileId: decodedData.metadata?.qrId || 'invalid_qr',
        fileName: `QR Code - ${decodedData.type || 'unknown'}`,
        fileType: 'qr_code',
        activity: FileActivityType.ACCESS_DENIED,
        description: `QR scan failed - validation errors: ${validation.errors.join(', ')}`,
        userId: session.user.id,
        userRole: session.user.role,
        userName: session.user.name || session.user.email || 'Unknown user',
        ipAddress,
        userAgent,
        patientId: decodedData.patientId,
        accessGranted: false,
        accessReason: validation.errors.join(', '),
        securityFlags: validation.isExpired ? ['expired_qr_code'] : ['invalid_qr_code'],
      });

      return NextResponse.json(
        { 
          error: 'Invalid QR code', 
          details: validation.errors,
          isExpired: validation.isExpired 
        },
        { status: 400 }
      );
    }

    // Verify access permissions
    const accessCheck = await verifyQRAccessPermissions(
      session.user.id,
      session.user.role,
      decodedData
    );

    if (!accessCheck.allowed) {
      // Log unauthorized access attempt
      await FileAuditLogger.logActivity({
        fileId: decodedData.metadata.qrId,
        fileName: `QR Code - ${decodedData.type}`,
        fileType: 'qr_code',
        activity: FileActivityType.ACCESS_DENIED,
        description: `QR scan denied - insufficient permissions: ${accessCheck.reason}`,
        userId: session.user.id,
        userRole: session.user.role,
        userName: session.user.name || session.user.email || 'Unknown user',
        ipAddress,
        userAgent,
        patientId: decodedData.patientId,
        accessGranted: false,
        accessReason: accessCheck.reason,
        securityFlags: ['unauthorized_qr_access'],
      });

      return NextResponse.json(
        { error: accessCheck.reason },
        { status: 403 }
      );
    }

    // Get patient data
    const patient = await Patient.findById(decodedData.patientId);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Filter patient data based on QR permissions
    const filteredData = filterDataByPermissions(patient.toObject(), decodedData.permissions);

    // For emergency QR codes, include the embedded emergency info
    if (decodedData.type === QRCodeType.EMERGENCY && decodedData.emergencyInfo) {
      filteredData.emergencyInfo = decodedData.emergencyInfo;
    }

    // Log successful QR scan
    await FileAuditLogger.logActivity({
      fileId: decodedData.metadata.qrId,
      fileName: `QR Code - ${decodedData.type}`,
      fileType: 'qr_code',
      activity: FileActivityType.VIEW,
      description: `QR code scanned successfully: ${decodedData.type} - ${purpose || decodedData.metadata.purpose}`,
      userId: session.user.id,
      userRole: session.user.role,
      userName: session.user.name || session.user.email || 'Unknown user',
      ipAddress,
      userAgent,
      patientId: decodedData.patientId,
      hospitalId: decodedData.hospitalId,
      doctorId: decodedData.doctorId,
      metadata: {
        qrType: decodedData.type,
        permissions: decodedData.permissions,
        purpose: purpose || decodedData.metadata.purpose,
        generatedBy: decodedData.metadata.generatedBy,
        generatedAt: decodedData.metadata.generatedAt
      },
      accessGranted: true,
    });

    // Prepare response
    const response = {
      success: true,
      data: {
        qr: {
          id: decodedData.metadata.qrId,
          type: decodedData.type,
          purpose: decodedData.metadata.purpose,
          generatedAt: decodedData.metadata.generatedAt,
          generatedBy: decodedData.metadata.generatedBy,
          expiresAt: decodedData.expiresAt,
          permissions: decodedData.permissions
        },
        patient: {
          id: patient._id,
          healthPassportId: patient.healthPassportId,
          data: filteredData
        },
        scanner: {
          id: session.user.id,
          role: session.user.role,
          name: session.user.name || session.user.email,
          scannedAt: new Date()
        }
      }
    };

    // Add limited data context if applicable
    if (decodedData.type === QRCodeType.LIMITED && decodedData.limitedData) {
      (response.data.qr as any).limitedContext = decodedData.limitedData;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('QR scanning error:', error);
    return NextResponse.json(
      { error: 'Internal server error during QR scanning' },
      { status: 500 }
    );
  }
}

// Helper function to verify QR access permissions
async function verifyQRAccessPermissions(
  userId: string,
  userRole: string,
  qrData: any
): Promise<{ allowed: boolean; reason?: string }> {
  
  // Emergency QR codes can be accessed by anyone in emergency situations
  if (qrData.type === QRCodeType.EMERGENCY) {
    return { allowed: true };
  }

  // Patient can always access their own QR codes
  if (userRole === 'patient' && userId === qrData.patientId) {
    return { allowed: true };
  }

  // Hospital-specific QR codes
  if (qrData.hospitalId && userRole === 'hospital') {
    if (userId === qrData.hospitalId) {
      return { allowed: true };
    } else {
      return { 
        allowed: false, 
        reason: 'QR code is restricted to a specific hospital' 
      };
    }
  }

  // Doctor-specific QR codes
  if (qrData.doctorId && userRole === 'doctor') {
    if (userId === qrData.doctorId) {
      return { allowed: true };
    } else {
      return { 
        allowed: false, 
        reason: 'QR code is restricted to a specific doctor' 
      };
    }
  }

  // Healthcare providers can access general QR codes
  if (userRole === 'doctor' || userRole === 'hospital') {
    // In a real implementation, you might check if they have access to this patient
    return { allowed: true };
  }

  return { 
    allowed: false, 
    reason: 'Insufficient permissions to access this QR code' 
  };
}
