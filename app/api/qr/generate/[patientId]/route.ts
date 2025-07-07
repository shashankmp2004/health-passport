import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import QRCode from 'qrcode';
import { 
  encryptQRData, 
  createFullAccessQR, 
  createEmergencyQR, 
  createLimitedQR, 
  createTemporaryQR,
  QRCodeType,
  QRPermission 
} from '@/lib/utils/qrcode';
import { FileAuditLogger, FileActivityType } from '@/lib/models/FileAuditLog';

// GET - Generate QR code for patient
export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const patientId = params.patientId;
    const { searchParams } = new URL(request.url);
    const qrType = searchParams.get('type') as QRCodeType || QRCodeType.FULL;
    const purpose = searchParams.get('purpose') || 'Medical record access';
    const expiresIn = searchParams.get('expiresIn') ? parseInt(searchParams.get('expiresIn')!) : undefined;
    const format = searchParams.get('format') || 'png'; // png, svg, data_url
    const size = parseInt(searchParams.get('size') || '256');

    // Extract client information for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Connect to database
    await dbConnect();

    // Verify access permissions
    const canGenerateQR = await verifyQRGenerationPermissions(
      session.user.id, 
      session.user.role, 
      patientId, 
      qrType
    );

    if (!canGenerateQR.allowed) {
      // Log unauthorized attempt
      await FileAuditLogger.logActivity({
        fileId: `qr_${patientId}`,
        fileName: `QR Code - ${qrType}`,
        fileType: 'qr_code',
        activity: FileActivityType.ACCESS_DENIED,
        description: `QR generation denied: ${canGenerateQR.reason}`,
        userId: session.user.id,
        userRole: session.user.role,
        userName: session.user.name || session.user.email || 'Unknown user',
        ipAddress,
        userAgent,
        patientId: patientId,
        accessGranted: false,
        accessReason: canGenerateQR.reason,
        securityFlags: ['unauthorized_qr_generation'],
      });

      return NextResponse.json(
        { error: canGenerateQR.reason },
        { status: 403 }
      );
    }

    // Get patient data
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Generate QR data based on type
    let qrData;
    const generatedBy = session.user.id;

    switch (qrType) {
      case QRCodeType.FULL:
        qrData = createFullAccessQR(patientId, generatedBy, {
          hospitalId: session.user.role === 'hospital' ? session.user.id : undefined,
          doctorId: session.user.role === 'doctor' ? session.user.id : undefined,
          purpose,
          expiresIn
        });
        break;

      case QRCodeType.EMERGENCY:
        const emergencyInfo = {
          bloodType: patient.personalInfo.bloodType || 'Unknown',
          allergies: patient.allergies || [],
          criticalConditions: patient.medicalHistory?.filter((h: any) => h.severity === 'critical').map((h: any) => h.condition) || [],
          emergencyContacts: patient.emergencyContacts || [],
          medicalAlerts: patient.medicalAlerts || []
        };
        qrData = createEmergencyQR(patientId, emergencyInfo, generatedBy, { purpose });
        break;

      case QRCodeType.LIMITED:
        const permissions = parsePermissions(searchParams.get('permissions'));
        qrData = createLimitedQR(patientId, permissions, generatedBy, {
          hospitalId: session.user.role === 'hospital' ? session.user.id : undefined,
          doctorId: session.user.role === 'doctor' ? session.user.id : undefined,
          appointmentId: searchParams.get('appointmentId') || undefined,
          visitId: searchParams.get('visitId') || undefined,
          specificPurpose: purpose,
          expiresIn
        });
        break;

      case QRCodeType.TEMPORARY:
        const tempPermissions = parsePermissions(searchParams.get('permissions'));
        const tempExpiresIn = expiresIn || 24; // Default 24 hours
        qrData = createTemporaryQR(patientId, tempPermissions, generatedBy, tempExpiresIn, {
          hospitalId: session.user.role === 'hospital' ? session.user.id : undefined,
          doctorId: session.user.role === 'doctor' ? session.user.id : undefined,
          purpose
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid QR code type' },
          { status: 400 }
        );
    }

    // Encrypt QR data
    const encryptedData = encryptQRData(qrData);

    // Generate QR code image
    let qrCodeResult;
    const qrOptions = {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M' as const
    };

    switch (format) {
      case 'svg':
        qrCodeResult = await QRCode.toString(encryptedData, { 
          ...qrOptions, 
          type: 'svg' 
        });
        break;
      case 'data_url':
        qrCodeResult = await QRCode.toDataURL(encryptedData, qrOptions);
        break;
      case 'text':
        qrCodeResult = encryptedData; // Return the raw encrypted data
        break;
      case 'png':
      default:
        const buffer = await QRCode.toBuffer(encryptedData, qrOptions);
        qrCodeResult = buffer.toString('base64');
        break;
    }

    // Log QR generation
    await FileAuditLogger.logActivity({
      fileId: qrData.metadata.qrId,
      fileName: `QR Code - ${qrType} - ${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
      fileType: 'qr_code',
      activity: FileActivityType.UPLOAD, // Using upload as "generation"
      description: `QR code generated: ${qrType} for ${purpose}`,
      userId: session.user.id,
      userRole: session.user.role,
      userName: session.user.name || session.user.email || 'Unknown user',
      ipAddress,
      userAgent,
      patientId: patientId,
      hospitalId: qrData.hospitalId,
      doctorId: qrData.doctorId,
      metadata: {
        qrType,
        purpose,
        expiresAt: qrData.expiresAt,
        permissions: qrData.permissions,
        format,
        size
      },
      accessGranted: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        qrCode: qrCodeResult,
        qrData: {
          id: qrData.metadata.qrId,
          type: qrData.type,
          purpose: qrData.metadata.purpose,
          generatedAt: qrData.metadata.generatedAt,
          expiresAt: qrData.expiresAt,
          permissions: qrData.permissions
        },
        patient: {
          id: patient._id,
          name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
          healthPassportId: patient.healthPassportId
        },
        format,
        size
      }
    });

  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during QR generation' },
      { status: 500 }
    );
  }
}

// Helper function to verify QR generation permissions
async function verifyQRGenerationPermissions(
  userId: string, 
  userRole: string, 
  patientId: string, 
  qrType: QRCodeType
): Promise<{ allowed: boolean; reason?: string }> {
  
  // Patients can always generate their own QR codes
  if (userRole === 'patient' && userId === patientId) {
    return { allowed: true };
  }

  // Emergency QR codes can be generated by any authenticated user in emergency situations
  if (qrType === QRCodeType.EMERGENCY) {
    return { allowed: true };
  }

  // Doctors and hospitals can generate QR codes for their patients
  if (userRole === 'doctor' || userRole === 'hospital') {
    // In a real implementation, you'd check if the doctor/hospital has access to this patient
    // For now, we'll allow it
    return { allowed: true };
  }

  return { 
    allowed: false, 
    reason: `${userRole} users cannot generate QR codes for other patients` 
  };
}

// Helper function to parse permissions from query string
function parsePermissions(permissionsStr: string | null): QRPermission[] {
  if (!permissionsStr) {
    return [QRPermission.VIEW_BASIC_INFO];
  }

  const permissions = permissionsStr.split(',').map(p => p.trim() as QRPermission);
  
  // Validate permissions
  const validPermissions = permissions.filter(p => 
    Object.values(QRPermission).includes(p)
  );

  return validPermissions.length > 0 ? validPermissions : [QRPermission.VIEW_BASIC_INFO];
}
