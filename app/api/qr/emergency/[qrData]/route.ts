import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { decryptQRData, validateQRCode } from '@/lib/utils/qrcode';

export async function GET(
  request: NextRequest,
  { params }: { params: { qrData: string } }
) {
  try {
    await connectDB();

    const { qrData } = params;

    // Validate input
    if (!qrData) {
      return NextResponse.json(
        { error: 'QR data is required' },
        { status: 400 }
      );
    }

    try {
      // Decrypt and validate QR data
      const decryptedData = decryptQRData(qrData);
      const validationResult = validateQRCode(decryptedData);

      if (!validationResult.isValid) {
        return NextResponse.json(
          { error: `Invalid QR code: ${validationResult.errors.join(', ')}` },
          { status: 400 }
        );
      }

      // Check if this is an emergency QR code
      if (decryptedData.type !== 'emergency') {
        return NextResponse.json(
          { error: 'This endpoint only supports emergency QR codes' },
          { status: 400 }
        );
      }

      // For emergency access, we don't require authentication
      // but we still log the access for audit purposes
      console.log('Emergency QR access:', {
        patientId: decryptedData.patientId,
        accessTime: new Date(),
        accessType: 'emergency',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });

      // Return emergency information
      const emergencyData = {
        patient: {
          id: decryptedData.patientId,
          healthPassportId: decryptedData.patientId,
          emergencyInfo: decryptedData.emergencyInfo
        },
        accessType: 'emergency',
        accessTime: new Date(),
        permissions: decryptedData.permissions,
        expiresAt: decryptedData.expiresAt
      };

      return NextResponse.json({
        success: true,
        data: emergencyData,
        message: 'Emergency information retrieved successfully'
      });

    } catch (decryptError) {
      console.error('QR decryption error:', decryptError);
      return NextResponse.json(
        { error: 'Invalid or corrupted QR code' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Emergency QR access error:', error);

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to access emergency information'
      },
      { status: 500 }
    );
  }
}

// Optional: Add rate limiting for emergency access
export async function POST(
  request: NextRequest,
  { params }: { params: { qrData: string } }
) {
  try {
    const { qrData } = params;
    const { emergencyContext } = await request.json();

    // This could be used for more detailed emergency access logging
    // where additional context is provided about the emergency situation

    console.log('Emergency QR access with context:', {
      qrData: qrData.substring(0, 10) + '...',
      emergencyContext,
      accessTime: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    // Delegate to GET handler
    return GET(request, { params });

  } catch (error) {
    console.error('Emergency QR POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
