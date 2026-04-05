import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Hospital from '@/lib/models/Hospital';
import Patient from '@/lib/models/Patient';
import Doctor from '@/lib/models/Doctor';

// GET - Hospital dashboard data
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'hospital' && session.user.role !== 'doctor' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Hospital, Doctor, or Admin access required' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    let hospital: any;
    let patientsWithVisits: any[];
    let affiliatedDoctors: any[];

    // Handle admin users separately - they get access to all hospitals/data
    if (session.user.role === 'admin') {
      // For admin: get all hospitals, patients, and doctors
      hospital = {
        _id: 'admin-system',
        facilityName: 'System Admin View',
        facilityType: 'Administrative Portal',
        email: session.user.email || 'admin@system.local',
        phone: '+1-000-0000',
        address: 'Global Network',
        licenseNumber: 'ADMIN-001',
        isVerified: true,
        adminFirstName: 'System',
        adminLastName: 'Administrator'
      };

      patientsWithVisits = await Patient.find({}).select('personalInfo visits medicalHistory medications vitals').limit(100);
      affiliatedDoctors = await Doctor.find({}).select('personalInfo specialty isVerified').limit(100);
    } else if (session.user.role === 'doctor') {
      // Doctor dashboard flow
      const doctor = await Doctor.findById(session.user.id).select('personalInfo specialty isVerified hospitalAffiliation');
      if (!doctor) {
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        );
      }

      hospital = {
        _id: `doctor-${doctor._id}`,
        facilityName: doctor.hospitalAffiliation || `Dr. ${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`,
        facilityType: 'Doctor Portal',
        email: doctor.personalInfo.email,
        phone: doctor.personalInfo.phone || '',
        address: 'N/A',
        licenseNumber: doctor.doctorId || 'N/A',
        isVerified: doctor.isVerified,
        adminFirstName: doctor.personalInfo.firstName,
        adminLastName: doctor.personalInfo.lastName,
      };

      patientsWithVisits = await Patient.find({
        'visits.doctorId': session.user.id,
      }).select('personalInfo visits medicalHistory medications vitals').limit(100);

      affiliatedDoctors = [doctor];
    } else {
      // Regular hospital flow
      hospital = await Hospital.findById(session.user.id).select('-password');
      if (!hospital) {
        return NextResponse.json(
          { error: 'Hospital not found' },
          { status: 404 }
        );
      }

      // Get patients who have visits at this hospital
      patientsWithVisits = await Patient.find({
        'visits.hospitalId': session.user.id
      }).select('personalInfo visits medicalHistory medications vitals');

      // Get doctors affiliated with this hospital
      affiliatedDoctors = await Doctor.find({
        hospitalAffiliation: hospital.facilityName
      }).select('personalInfo specialty isVerified');
    }

    // Calculate date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Calculate statistics
    const totalPatients = patientsWithVisits.length;
    let todayVisits = 0;
    let monthlyVisits = 0;
    const departmentStats: { [key: string]: number } = {};

    const isAdmin = session.user.role === 'admin';
    const isDoctor = session.user.role === 'doctor';

    patientsWithVisits.forEach(patient => {
      patient.visits?.forEach((visit: any) => {
        // Admin sees all visits, doctor sees their own visits, hospital sees only hospital visits
        if (isAdmin || (isDoctor && visit.doctorId?.toString() === session.user.id) || (!isDoctor && visit.hospitalId?.toString() === session.user.id)) {
          const visitDate = new Date(visit.date);
          
          if (visitDate >= today && visitDate < tomorrow) {
            todayVisits++;
          }
          
          if (visitDate >= thirtyDaysAgo) {
            monthlyVisits++;
          }
        }
      });
    });

    // Count doctors by specialty
    affiliatedDoctors.forEach(doctor => {
      const specialty = doctor.specialty || 'General';
      departmentStats[specialty] = (departmentStats[specialty] || 0) + 1;
    });

    // Get recent patients (last 10 with visits)
    const recentPatients = patientsWithVisits
      .map(patient => {
        const hospitalVisits = patient.visits?.filter((visit: any) => 
          isAdmin || (isDoctor && visit.doctorId?.toString() === session.user.id) || (!isDoctor && visit.hospitalId?.toString() === session.user.id)
        ) || [];
        
        const lastVisit = hospitalVisits.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];

        return {
          id: patient._id,
          name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
          lastVisit: lastVisit?.date || null,
          diagnosis: lastVisit?.diagnosis || '',
          visits: hospitalVisits.length,
        };
      })
      .sort((a, b) => {
        if (!a.lastVisit) return 1;
        if (!b.lastVisit) return -1;
        return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
      })
      .slice(0, 10);

    // Mock data for additional metrics
    const systemHealth = {
      uptime: '99.9%',
      responseTime: '250ms',
      activeUsers: totalPatients + affiliatedDoctors.length,
      dataSync: 'Up to date',
    };

    // Prepare dashboard data
    const dashboardData = {
      hospital: {
        id: hospital._id,
        name: hospital.facilityName,
        type: hospital.facilityType,
        email: hospital.email,
        phone: hospital.phone,
        address: hospital.address,
        licenseNumber: hospital.licenseNumber,
        isVerified: hospital.isVerified,
        admin: {
          name: `${hospital.adminFirstName} ${hospital.adminLastName}`,
        },
      },
      statistics: {
        totalPatients,
        todayVisits,
        monthlyVisits,
        totalDoctors: affiliatedDoctors.length,
        verifiedDoctors: affiliatedDoctors.filter(doc => doc.isVerified).length,
      },
      departmentStats: Object.entries(departmentStats)
        .sort(([,a], [,b]) => b - a)
        .map(([specialty, count]) => ({ specialty, count })),
      recentPatients,
      affiliatedDoctors: affiliatedDoctors.slice(0, 10).map(doctor => ({
        id: doctor._id,
        name: `${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`,
        specialty: doctor.specialty,
        isVerified: doctor.isVerified,
      })),
      systemHealth,
      performanceMetrics: {
        patientSatisfaction: 4.3, // Mock data
        averageWaitTime: '15 mins', // Mock data
        bedOccupancy: '75%', // Mock data
        staffEfficiency: '88%', // Mock data
      },
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });

  } catch (error) {
    console.error('Hospital dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
