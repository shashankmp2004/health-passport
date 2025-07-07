import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import PatientNotification from '@/lib/models/PatientNotification';

// GET - Get access request status for hospital
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'hospital') {
      return NextResponse.json(
        { error: 'Unauthorized - Hospital access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Connect to database
    await dbConnect();

    // Build query for hospital's requests
    const query: any = { hospitalId: session.user.id };
    if (status) {
      query.status = status;
    }

    // Get access requests made by this hospital
    const requests = await PatientNotification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Transform requests for frontend
    const transformedRequests = requests.map(request => ({
      id: request._id,
      patientId: request.patientId,
      patientName: request.metadata?.patientName || 'Unknown Patient',
      type: request.type,
      status: request.status,
      message: request.message,
      requestReason: request.metadata?.requestReason,
      createdAt: request.createdAt,
      respondedAt: request.respondedAt,
      expiresAt: request.expiresAt,
      isExpired: new Date() > new Date(request.expiresAt),
      accessDuration: request.metadata?.accessDuration || 24
    }));

    // Get counts by status
    const statusCounts = await PatientNotification.aggregate([
      { $match: { hospitalId: session.user.id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts: Record<string, number> = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total from all status counts
    const totalCount = statusCounts.reduce((sum, item) => sum + item.count, 0);

    console.log('Access requests debug:', {
      hospitalId: session.user.id,
      statusCounts,
      calculatedCounts: counts,
      totalCount,
      transformedRequestsLength: transformedRequests.length
    });

    return NextResponse.json({
      success: true,
      data: {
        requests: transformedRequests,
        counts: {
          total: totalCount, // Use actual total from database
          pending: counts['pending'] || 0,
          approved: counts['approved'] || 0,
          denied: counts['denied'] || 0,
          expired: counts['expired'] || 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching access requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
