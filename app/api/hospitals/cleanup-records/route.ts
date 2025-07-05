import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { cleanupExpiredRecords, getExpirationStats } from '@/lib/utils/recordCleanup';

// GET - Get expiration statistics
export async function GET(request: NextRequest) {
  try {
    // Check authentication - only hospitals can access this
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'hospital') {
      return NextResponse.json(
        { error: 'Unauthorized - Hospital access required' },
        { status: 401 }
      );
    }

    const stats = await getExpirationStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting expiration stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Manually trigger cleanup of expired records
export async function POST(request: NextRequest) {
  try {
    // Check authentication - only hospitals can trigger this
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'hospital') {
      return NextResponse.json(
        { error: 'Unauthorized - Hospital access required' },
        { status: 401 }
      );
    }

    const result = await cleanupExpiredRecords();
    
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error during manual cleanup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
