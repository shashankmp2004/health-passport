import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import PatientNotification from '@/lib/models/PatientNotification';
import Patient from '@/lib/models/Patient';

// GET - Get notifications for the current patient
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'patient') {
      return NextResponse.json(
        { error: 'Unauthorized - Patient access required' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get patient's health passport ID
    const patient = await Patient.findById(session.user.id).select('healthPassportId');
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query: any = { patientId: patient.healthPassportId };
    if (status) {
      query.status = status;
    }

    // Get notifications
    const notifications = await PatientNotification.find(query)
      .populate('hospitalId', 'facilityInfo adminInfo')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Transform notifications for frontend
    const transformedNotifications = notifications.map(notification => ({
      id: notification._id,
      type: notification.type,
      status: notification.status,
      message: notification.message,
      hospital: {
        id: notification.hospitalId._id,
        name: notification.hospitalName || notification.hospitalId?.facilityInfo?.name || 'Unknown Hospital',
        contactInfo: notification.hospitalId?.facilityInfo
      },
      requestedBy: notification.requestedBy,
      createdAt: notification.createdAt,
      respondedAt: notification.respondedAt,
      expiresAt: notification.expiresAt,
      metadata: notification.metadata,
      isExpired: new Date() > new Date(notification.expiresAt)
    }));

    // Get counts by status
    const statusCounts = await PatientNotification.aggregate([
      { $match: { patientId: patient.healthPassportId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        notifications: transformedNotifications,
        counts: {
          total: transformedNotifications.length,
          pending: counts.pending || 0,
          approved: counts.approved || 0,
          denied: counts.denied || 0,
          expired: counts.expired || 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching patient notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
