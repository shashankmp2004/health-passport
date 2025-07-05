import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import HospitalPatientRecord from '@/lib/models/HospitalPatientRecord';

// GET - Debug endpoint to see all hospital patient records
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

    // Get all records for this hospital (both within and outside 24 hours)
    const allRecords = await HospitalPatientRecord.find({
      hospitalId: session.user.id
    }).lean();

    // Get records within 24 hours (active records)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const activeRecords = await HospitalPatientRecord.find({
      hospitalId: session.user.id,
      status: 'active',
      addedDate: { $gte: twentyFourHoursAgo }
    }).lean();

    // Get all records in the entire collection (for debugging)
    const allRecordsInDb = await HospitalPatientRecord.find({}).lean();

    return NextResponse.json({
      success: true,
      data: {
        hospitalId: session.user.id,
        hospitalName: session.user.name,
        twentyFourHoursAgo: twentyFourHoursAgo.toISOString(),
        totalRecordsForThisHospital: allRecords.length,
        activeRecordsWithin24Hours: activeRecords.length,
        expiredRecords: allRecords.length - activeRecords.length,
        totalRecordsInDb: allRecordsInDb.length,
        allRecords: allRecords.map(record => ({
          id: record._id,
          healthPassportId: record.healthPassportId,
          patientName: record.patientName,
          status: record.status,
          addedDate: record.addedDate,
          lastUpdated: record.lastUpdated,
          hospitalId: record.hospitalId,
          hospitalName: record.hospitalName,
          hoursAgo: Math.round((new Date().getTime() - new Date(record.addedDate).getTime()) / (1000 * 60 * 60)),
          isExpired: new Date(record.addedDate) < twentyFourHoursAgo,
          isActive: record.status === 'active' && new Date(record.addedDate) >= twentyFourHoursAgo
        })),
        activeRecords: activeRecords.map(record => ({
          id: record._id,
          healthPassportId: record.healthPassportId,
          patientName: record.patientName,
          hoursAgo: Math.round((new Date().getTime() - new Date(record.addedDate).getTime()) / (1000 * 60 * 60))
        })),
        allHospitals: [...new Set(allRecordsInDb.map(r => `${r.hospitalId} (${r.hospitalName})`))],
        currentTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Debug hospital records error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
