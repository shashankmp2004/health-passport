import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Doctor from '@/lib/models/Doctor';
import Patient from '@/lib/models/Patient';

// GET - Doctor dashboard data
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Unauthorized - Doctor access required' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get doctor data
    const doctor = await Doctor.findById(session.user.id).select('-password');
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Get patients who have visits with this doctor
    const patientsWithVisits = await Patient.find({
      'visits.doctorId': session.user.id
    }).select('personalInfo visits medicalHistory medications');

    // Calculate statistics
    const totalPatients = patientsWithVisits.length;
    
    // Get recent visits (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let recentVisits = 0;
    let todayVisits = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    patientsWithVisits.forEach(patient => {
      patient.visits?.forEach((visit: any) => {
        if (visit.doctorId.toString() === session.user.id) {
          const visitDate = new Date(visit.date);
          if (visitDate >= thirtyDaysAgo) {
            recentVisits++;
          }
          if (visitDate >= today && visitDate < tomorrow) {
            todayVisits++;
          }
        }
      });
    });

    // Get upcoming appointments (mock data for now)
    const upcomingAppointments: any[] = []; // TODO: Implement appointments system

    // Get recent patients (last 10 patients with visits)
    const recentPatients = patientsWithVisits
      .map(patient => {
        const doctorVisits = patient.visits?.filter((visit: any) => 
          visit.doctorId.toString() === session.user.id
        ) || [];
        
        const lastVisit = doctorVisits.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];

        return {
          id: patient._id,
          name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
          lastVisit: lastVisit?.date || null,
          diagnosis: lastVisit?.diagnosis || '',
          visits: doctorVisits.length,
        };
      })
      .sort((a, b) => {
        if (!a.lastVisit) return 1;
        if (!b.lastVisit) return -1;
        return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
      })
      .slice(0, 10);

    // Calculate speciality statistics
    const patientsByCondition: { [key: string]: number } = {};
    patientsWithVisits.forEach(patient => {
      patient.medicalHistory?.forEach((condition: any) => {
        if (condition.doctorId?.toString() === session.user.id) {
          patientsByCondition[condition.condition] = (patientsByCondition[condition.condition] || 0) + 1;
        }
      });
    });

    // Prepare dashboard data
    const dashboardData = {
      doctor: {
        id: doctor._id,
        name: `${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`,
        email: doctor.personalInfo.email,
        phone: doctor.personalInfo.phone,
        specialty: doctor.specialty,
        licenseNumber: doctor.licenseNumber,
        hospitalAffiliation: doctor.hospitalAffiliation,
        isVerified: doctor.isVerified,
      },
      statistics: {
        totalPatients,
        recentVisits,
        todayVisits,
        upcomingAppointments: upcomingAppointments.length,
      },
      recentPatients,
      upcomingAppointments, // TODO: Implement proper appointments
      commonConditions: Object.entries(patientsByCondition)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([condition, count]) => ({ condition, count })),
      performanceMetrics: {
        averageVisitsPerMonth: Math.round(recentVisits / 1), // Simplified calculation
        patientSatisfaction: 4.5, // Mock data
        responseTime: '2 hours', // Mock data
      },
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });

  } catch (error) {
    console.error('Doctor dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
