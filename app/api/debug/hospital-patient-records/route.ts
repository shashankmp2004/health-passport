import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import HospitalPatientRecord from '@/lib/models/HospitalPatientRecord';

// GET - Debug endpoint to check all hospital records
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

    // Connect to database
    await dbConnect();

    // Get ALL hospital records for this hospital
    const allRecords = await HospitalPatientRecord.find({ 
      hospitalId: session.user.id 
    }).lean();

    // Get records within 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const recentRecords = await HospitalPatientRecord.find({ 
      hospitalId: session.user.id,
      status: 'active',
      addedDate: { $gte: twentyFourHoursAgo }
    }).lean();

    return NextResponse.json({
      success: true,
      data: {
        hospitalId: session.user.id,
        totalRecords: allRecords.length,
        recentRecords: recentRecords.length,
        twentyFourHoursAgo: twentyFourHoursAgo.toISOString(),
        allRecords: allRecords.map(r => ({
          id: r._id,
          healthPassportId: r.healthPassportId,
          patientName: r.patientName,
          status: r.status,
          addedDate: r.addedDate,
          lastUpdated: r.lastUpdated,
          hoursAgo: Math.round((new Date().getTime() - new Date(r.addedDate).getTime()) / (1000 * 60 * 60))
        })),
        recentRecordsDetails: recentRecords.map(r => ({
          id: r._id,
          healthPassportId: r.healthPassportId,
          patientName: r.patientName,
          status: r.status,
          addedDate: r.addedDate,
          lastUpdated: r.lastUpdated,
          hoursAgo: Math.round((new Date().getTime() - new Date(r.addedDate).getTime()) / (1000 * 60 * 60))
        }))
      }
    });

  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
