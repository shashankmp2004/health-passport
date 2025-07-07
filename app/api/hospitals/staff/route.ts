import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Hospital from '@/lib/models/Hospital';
import Doctor from '@/lib/models/Doctor';
import Patient from '@/lib/models/Patient';

// GET - Get hospital staff
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const specialty = searchParams.get('specialty');
    const status = searchParams.get('status'); // verified, pending, all
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    // Connect to database
    await dbConnect();

    // Get hospital data
    const hospital = await Hospital.findById(session.user.id);
    if (!hospital) {
      return NextResponse.json(
        { error: 'Hospital not found' },
        { status: 404 }
      );
    }

    // Build query for affiliated doctors
    let query: any = {
      hospitalAffiliation: hospital.facilityName
    };

    // Add search functionality
    if (search) {
      query = {
        ...query,
        $or: [
          { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
          { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
          { 'personalInfo.email': { $regex: search, $options: 'i' } },
          { licenseNumber: { $regex: search, $options: 'i' } },
        ]
      };
    }

    // Filter by specialty
    if (specialty) {
      query.specialty = specialty;
    }

    // Filter by verification status
    if (status === 'verified') {
      query.isVerified = true;
    } else if (status === 'pending') {
      query.isVerified = false;
    }

    // Get doctors
    const doctors = await Doctor.find(query)
      .select('-password')
      .sort({ 'personalInfo.firstName': 1 });

    // Enrich doctor data with statistics
    const enrichedDoctors = await Promise.all(
      doctors.map(async (doctor) => {
        // Get patients treated by this doctor
        const patientsTreated = await Patient.find({
          'visits.doctorId': doctor._id
        }).select('visits');

        // Calculate statistics
        const totalPatients = patientsTreated.length;
        
        let totalVisits = 0;
        let recentVisits = 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        patientsTreated.forEach(patient => {
          const doctorVisits = patient.visits?.filter((visit: any) => 
            visit.doctorId.toString() === doctor._id.toString()
          ) || [];
          
          totalVisits += doctorVisits.length;
          
          recentVisits += doctorVisits.filter((visit: any) => 
            new Date(visit.date) >= thirtyDaysAgo
          ).length;
        });

        const lastVisit = patientsTreated
          .flatMap(patient => patient.visits || [])
          .filter((visit: any) => visit.doctorId.toString() === doctor._id.toString())
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        return {
          id: doctor._id,
          name: `${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`,
          email: doctor.personalInfo.email,
          phone: doctor.personalInfo.phone,
          licenseNumber: doctor.licenseNumber,
          specialty: doctor.specialty,
          isVerified: doctor.isVerified,
          joinDate: doctor.createdAt,
          lastActive: lastVisit?.date || null,
          statistics: {
            totalPatients,
            totalVisits,
            recentVisits,
            averageVisitsPerPatient: totalPatients > 0 ? Math.round(totalVisits / totalPatients) : 0,
          },
          performance: {
            rating: calculateDoctorRating(totalVisits, recentVisits, totalPatients), // Mock calculation
            efficiency: calculateEfficiency(totalVisits, recentVisits), // Mock calculation
          },
        };
      })
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDoctors = enrichedDoctors.slice(startIndex, endIndex);

    // Get unique specialties for filtering
    const allSpecialties = [...new Set(doctors.map(doc => doc.specialty).filter(Boolean))];

    return NextResponse.json({
      success: true,
      data: {
        staff: paginatedDoctors,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(enrichedDoctors.length / limit),
          totalStaff: enrichedDoctors.length,
          hasNext: endIndex < enrichedDoctors.length,
          hasPrev: page > 1,
        },
        statistics: {
          totalDoctors: enrichedDoctors.length,
          verifiedDoctors: enrichedDoctors.filter(doc => doc.isVerified).length,
          pendingVerification: enrichedDoctors.filter(doc => !doc.isVerified).length,
          specialties: allSpecialties.length,
          averageRating: calculateAverageRating(enrichedDoctors),
        },
        filters: {
          availableSpecialties: allSpecialties.sort(),
          statusOptions: ['all', 'verified', 'pending'],
        },
      },
    });

  } catch (error) {
    console.error('Hospital staff fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new staff member (invite doctor)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'hospital') {
      return NextResponse.json(
        { error: 'Unauthorized - Hospital access required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { doctorId, specialty, notes } = body;

    // Basic validation
    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get hospital data
    const hospital = await Hospital.findById(session.user.id);
    if (!hospital) {
      return NextResponse.json(
        { error: 'Hospital not found' },
        { status: 404 }
      );
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check if doctor is already affiliated
    if (doctor.hospitalAffiliation === hospital.facilityName) {
      return NextResponse.json(
        { error: 'Doctor is already affiliated with this hospital' },
        { status: 400 }
      );
    }

    // Update doctor's hospital affiliation
    doctor.hospitalAffiliation = hospital.facilityName;
    if (specialty) {
      doctor.specialty = specialty;
    }
    
    await doctor.save();

    // TODO: Send invitation email/notification to doctor

    return NextResponse.json({
      success: true,
      message: 'Doctor successfully added to hospital staff',
      data: {
        doctor: {
          id: doctor._id,
          name: `${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`,
          email: doctor.personalInfo.email,
          specialty: doctor.specialty,
          isVerified: doctor.isVerified,
        }
      },
    });

  } catch (error) {
    console.error('Staff addition error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateDoctorRating(totalVisits: number, recentVisits: number, totalPatients: number): number {
  // Mock rating calculation based on activity
  let rating = 3.0; // Base rating
  
  if (totalVisits > 100) rating += 1.0;
  else if (totalVisits > 50) rating += 0.5;
  
  if (recentVisits > 10) rating += 0.5;
  else if (recentVisits > 5) rating += 0.3;
  
  if (totalPatients > 50) rating += 0.3;
  
  return Math.min(5.0, Math.round(rating * 10) / 10);
}

function calculateEfficiency(totalVisits: number, recentVisits: number): string {
  const recentActivity = recentVisits / Math.max(1, totalVisits);
  
  if (recentActivity > 0.3) return 'High';
  if (recentActivity > 0.15) return 'Medium';
  return 'Low';
}

function calculateAverageRating(doctors: any[]): number {
  if (doctors.length === 0) return 0;
  
  const totalRating = doctors.reduce((sum, doc) => sum + doc.performance.rating, 0);
  return Math.round((totalRating / doctors.length) * 10) / 10;
}
