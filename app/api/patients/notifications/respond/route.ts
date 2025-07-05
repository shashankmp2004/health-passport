import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import PatientNotification from '@/lib/models/PatientNotification';
import HospitalPatientRecord from '@/lib/models/HospitalPatientRecord';
import Patient from '@/lib/models/Patient';

// POST - Respond to an access request (approve/deny)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'patient') {
      return NextResponse.json(
        { error: 'Unauthorized - Patient access required' },
        { status: 401 }
      );
    }

    const { notificationId, action, response } = await request.json();

    if (!notificationId || !action || !['approve', 'deny'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get patient's health passport ID
    const patient = await Patient.findById(session.user.id).select('healthPassportId personalInfo medicalHistory visits vitals');
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Find the notification
    const notification = await PatientNotification.findById(notificationId);
    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Verify the notification belongs to this patient
    if (notification.patientId !== patient.healthPassportId) {
      return NextResponse.json(
        { error: 'Unauthorized - This notification does not belong to you' },
        { status: 403 }
      );
    }

    // Check if notification is still pending
    if (notification.status !== 'pending') {
      return NextResponse.json(
        { error: 'This notification has already been responded to' },
        { status: 409 }
      );
    }

    // Check if notification has expired
    if (new Date() > new Date(notification.expiresAt)) {
      // Update notification status to expired
      await PatientNotification.findByIdAndUpdate(notificationId, {
        status: 'expired',
        respondedAt: new Date()
      });
      
      return NextResponse.json(
        { error: 'This access request has expired' },
        { status: 410 }
      );
    }

    const now = new Date();
    let updatedStatus = action === 'approve' ? 'approved' : 'denied';

    // Update notification
    const updatedNotification = await PatientNotification.findByIdAndUpdate(
      notificationId,
      {
        status: updatedStatus,
        respondedAt: now,
        response: response || `Patient ${action}d the access request`
      },
      { new: true }
    );

    // If approved, create hospital patient record
    if (action === 'approve') {
      try {
        // Check if record already exists
        const existingRecord = await HospitalPatientRecord.findOne({
          hospitalId: notification.hospitalId,
          healthPassportId: patient.healthPassportId,
          status: 'active'
        });

        if (!existingRecord) {
          // Create hospital patient record
          const hospitalRecord = new HospitalPatientRecord({
            hospitalId: notification.hospitalId,
            hospitalName: notification.hospitalName,
            healthPassportId: patient.healthPassportId,
            patientName: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
            patientAge: patient.personalInfo.age || 'Unknown',
            status: 'active',
            addedDate: now,
            lastUpdated: now,
            riskLevel: 'Low', // Default, can be calculated based on conditions
            conditions: patient.medicalHistory?.conditions?.map((c: any) => c.name) || [],
            allergies: patient.medicalHistory?.allergies?.map((a: any) => a.name) || [],
            metadata: {
              addedBy: 'patient_approval',
              addedByName: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
              addMethod: 'hospital_search',
              originalData: {
                notificationId: notificationId,
                requestReason: notification.metadata?.requestReason
              }
            }
          });

          const newRecord = await hospitalRecord.save();
          
          console.log('Hospital patient record created successfully:', {
            recordId: newRecord._id,
            hospitalId: notification.hospitalId,
            patientId: patient.healthPassportId,
            patientName: newRecord.patientName,
            addedDate: newRecord.addedDate,
            status: newRecord.status,
            savedAt: new Date().toISOString()
          });
          
          // Verify the record was actually saved
          const verificationRecord = await HospitalPatientRecord.findById(newRecord._id);
          console.log('Verification - Record exists in DB:', !!verificationRecord);
          
        } else {
          console.log('Hospital record already exists:', {
            existingRecordId: existingRecord._id,
            status: existingRecord.status,
            addedDate: existingRecord.addedDate
          });
          
          // Update the existing record to be active and refresh the date
          await HospitalPatientRecord.findByIdAndUpdate(existingRecord._id, {
            status: 'active',
            lastUpdated: now,
            addedDate: now // Refresh the added date for 24-hour access window
          });
          
          console.log('Updated existing hospital record to active with new addedDate');
        }

        // Create a confirmation notification
        const confirmationNotification = new PatientNotification({
          patientId: patient.healthPassportId,
          hospitalId: notification.hospitalId,
          hospitalName: notification.hospitalName,
          type: 'access_granted',
          status: 'approved',
          message: `You have successfully granted ${notification.hospitalName} access to your medical records. This access will expire in 24 hours.`,
          requestedBy: notification.requestedBy,
          metadata: {
            ...notification.metadata,
            originalRequestId: notificationId
          }
        });

        await confirmationNotification.save();

      } catch (recordError) {
        console.error('Error creating hospital record:', recordError);
        // Still return success for the notification response, but log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: `Access request ${action}d successfully`,
      data: {
        notificationId: updatedNotification._id,
        status: updatedNotification.status,
        respondedAt: updatedNotification.respondedAt,
        action: action
      }
    });

  } catch (error) {
    console.error('Error responding to access request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
