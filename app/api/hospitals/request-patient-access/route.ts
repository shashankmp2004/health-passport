import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import PatientNotification from '@/lib/models/PatientNotification';
import Patient from '@/lib/models/Patient';
import Hospital from '@/lib/models/Hospital';

// POST - Request access to a patient's records
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'hospital') {
      return NextResponse.json(
        { error: 'Unauthorized - Hospital access required' },
        { status: 401 }
      );
    }

    const { healthPassportId, requestReason = 'Medical consultation and record access' } = await request.json();

    if (!healthPassportId) {
      return NextResponse.json(
        { error: 'Health Passport ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check if patient exists
    const patient = await Patient.findOne({ healthPassportId }).select('personalInfo healthPassportId');
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Get hospital information
    const hospital = await Hospital.findById(session.user.id).select('facilityInfo adminInfo');
    if (!hospital) {
      return NextResponse.json(
        { error: 'Hospital not found' },
        { status: 404 }
      );
    }

    console.log('Hospital details:', {
      id: hospital._id,
      facilityName: hospital.facilityInfo?.name,
      adminEmail: hospital.adminInfo?.email
    });

    // Ensure hospital name is available
    const hospitalName = hospital.facilityInfo?.name || session.user.name || 'Unknown Hospital';

    // Check if there's already a pending request for this patient from this hospital
    const existingRequest = await PatientNotification.findOne({
      patientId: healthPassportId,
      hospitalId: session.user.id,
      status: 'pending'
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'A pending access request already exists for this patient' },
        { status: 409 }
      );
    }

    // Create notification for the patient
    const notificationData = {
      patientId: healthPassportId,
      hospitalId: session.user.id,
      hospitalName: hospitalName,
      type: 'access_request',
      status: 'pending',
      message: `${hospitalName} is requesting access to your medical records for ${requestReason}.`,
      requestedBy: {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      },
      metadata: {
        patientName: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
        requestReason
      }
    };

    console.log('Creating notification with data:', notificationData);

    const notification = new PatientNotification(notificationData);

    await notification.save();

    console.log('Access request created:', {
      notificationId: notification._id,
      patientId: healthPassportId,
      hospitalId: session.user.id,
      hospitalName: hospital.name
    });

    return NextResponse.json({
      success: true,
      message: 'Access request sent to patient successfully',
      data: {
        requestId: notification._id,
        patientName: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
        requestStatus: 'pending',
        expiresAt: notification.expiresAt
      }
    });

  } catch (error) {
    console.error('Error creating access request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
