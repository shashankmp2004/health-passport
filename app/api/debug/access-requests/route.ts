import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import PatientNotification from '@/lib/models/PatientNotification';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'hospital') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get ALL notifications for this hospital
    const allNotifications = await PatientNotification.find({ 
      hospitalId: session.user.id 
    }).sort({ createdAt: -1 }).lean();

    // Get counts by status using aggregation
    const statusCounts = await PatientNotification.aggregate([
      { $match: { hospitalId: session.user.id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Manual count verification
    const manualCounts = {
      total: allNotifications.length,
      pending: allNotifications.filter(n => n.status === 'pending').length,
      approved: allNotifications.filter(n => n.status === 'approved').length,
      denied: allNotifications.filter(n => n.status === 'denied').length,
      expired: allNotifications.filter(n => n.status === 'expired').length,
    };

    // Transform aggregation result
    const aggregatedCounts = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const totalFromAggregation = statusCounts.reduce((sum, item) => sum + item.count, 0);

    return NextResponse.json({
      success: true,
      debug: {
        hospitalId: session.user.id,
        manualCounts,
        aggregatedCounts,
        totalFromAggregation,
        statusCounts,
        notifications: allNotifications.map(n => ({
          id: n._id,
          patientId: n.patientId,
          status: n.status,
          type: n.type,
          createdAt: n.createdAt,
          respondedAt: n.respondedAt
        }))
      }
    });

  } catch (error) {
    console.error('Debug access requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
