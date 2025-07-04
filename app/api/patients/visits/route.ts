import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import Doctor from '@/lib/models/Doctor';
import Hospital from '@/lib/models/Hospital';

// GET - Fetch patient's visit history
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const hospitalId = searchParams.get('hospitalId');
    const doctorId = searchParams.get('doctorId');

    // Connect to database
    await dbConnect();

    // Get patient data
    const patient = await Patient.findById(session.user.id).select('visits');
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    let visits = patient.visits || [];

    // Filter by hospital if specified
    if (hospitalId) {
      visits = visits.filter((visit: any) => visit.hospitalId.toString() === hospitalId);
    }

    // Filter by doctor if specified
    if (doctorId) {
      visits = visits.filter((visit: any) => visit.doctorId.toString() === doctorId);
    }

    // Sort by date (most recent first)
    const sortedVisits = visits
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    // Get doctor and hospital details for each visit
    const enrichedVisits = await Promise.all(
      sortedVisits.map(async (visit: any) => {
        const doctor = visit.doctorId ? await Doctor.findById(visit.doctorId).select('personalInfo specialty') : null;
        const hospital = visit.hospitalId ? await Hospital.findById(visit.hospitalId).select('facilityName facilityType') : null;

        return {
          id: visit._id,
          date: visit.date,
          diagnosis: visit.diagnosis,
          treatment: visit.treatment,
          notes: visit.notes,
          followUpDate: visit.followUpDate,
          status: visit.status,
          doctor: doctor ? {
            id: doctor._id,
            name: `${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`,
            specialty: doctor.specialty,
          } : null,
          hospital: hospital ? {
            id: hospital._id,
            name: hospital.facilityName,
            type: hospital.facilityType,
          } : null,
        };
      })
    );

    // Calculate statistics
    const totalVisits = visits.length;
    const recentVisits = visits.filter((visit: any) => {
      const visitDate = new Date(visit.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return visitDate >= thirtyDaysAgo;
    }).length;

    const uniqueHospitals = [...new Set(visits.map((visit: any) => visit.hospitalId?.toString()))].filter(Boolean).length;
    const uniqueDoctors = [...new Set(visits.map((visit: any) => visit.doctorId?.toString()))].filter(Boolean).length;

    return NextResponse.json({
      success: true,
      data: {
        visits: enrichedVisits,
        statistics: {
          total: totalVisits,
          recentVisits,
          uniqueHospitals,
          uniqueDoctors,
        },
        pagination: {
          limit,
          total: visits.length,
          hasMore: visits.length > limit,
        },
      },
    });

  } catch (error) {
    console.error('Visits fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
