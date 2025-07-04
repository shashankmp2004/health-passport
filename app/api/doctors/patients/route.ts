import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Doctor from '@/lib/models/Doctor';
import Patient from '@/lib/models/Patient';

// GET - Get doctor's patients
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'lastVisit'; // name, lastVisit, visits

    // Connect to database
    await dbConnect();

    // Get patients who have visits with this doctor
    let query: any = {
      'visits.doctorId': session.user.id
    };

    // Add search functionality
    if (search) {
      query = {
        ...query,
        $or: [
          { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
          { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
          { 'personalInfo.email': { $regex: search, $options: 'i' } },
          { healthPassportId: { $regex: search, $options: 'i' } },
        ]
      };
    }

    const patientsWithVisits = await Patient.find(query)
      .select('personalInfo visits medicalHistory medications vitals documents healthPassportId');

    // Process and enrich patient data
    const enrichedPatients = patientsWithVisits.map(patient => {
      const doctorVisits = patient.visits?.filter((visit: any) => 
        visit.doctorId.toString() === session.user.id
      ) || [];
      
      const lastVisit = doctorVisits.sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      // Get active conditions diagnosed by this doctor
      const activeConditions = patient.medicalHistory?.filter((condition: any) => 
        condition.doctorId?.toString() === session.user.id && condition.status === 'active'
      ) || [];

      // Get current medications prescribed by this doctor
      const currentMedications = patient.medications?.filter((med: any) => 
        med.prescribedBy?.toString() === session.user.id && 
        (!med.endDate || new Date(med.endDate) > new Date())
      ) || [];

      // Get recent vitals
      const recentVitals = patient.vitals?.slice(-3) || [];

      return {
        id: patient._id,
        healthPassportId: patient.healthPassportId,
        name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
        email: patient.personalInfo.email,
        phone: patient.personalInfo.phone,
        dateOfBirth: patient.personalInfo.dateOfBirth,
        bloodType: patient.personalInfo.bloodType,
        lastVisit: lastVisit ? {
          date: lastVisit.date,
          diagnosis: lastVisit.diagnosis,
          treatment: lastVisit.treatment,
        } : null,
        visitCount: doctorVisits.length,
        activeConditions: activeConditions.map((condition: any) => ({
          condition: condition.condition,
          diagnosedDate: condition.diagnosedDate,
          status: condition.status,
        })),
        currentMedications: currentMedications.map((med: any) => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
        })),
        recentVitals: recentVitals.map((vital: any) => ({
          type: vital.type,
          value: vital.value,
          unit: vital.unit,
          date: vital.recordedDate,
        })),
        totalDocuments: patient.documents?.length || 0,
      };
    });

    // Sort patients
    let sortedPatients = enrichedPatients;
    switch (sortBy) {
      case 'name':
        sortedPatients = enrichedPatients.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'visits':
        sortedPatients = enrichedPatients.sort((a, b) => b.visitCount - a.visitCount);
        break;
      case 'lastVisit':
      default:
        sortedPatients = enrichedPatients.sort((a, b) => {
          if (!a.lastVisit) return 1;
          if (!b.lastVisit) return -1;
          return new Date(b.lastVisit.date).getTime() - new Date(a.lastVisit.date).getTime();
        });
        break;
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPatients = sortedPatients.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        patients: paginatedPatients,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(sortedPatients.length / limit),
          totalPatients: sortedPatients.length,
          hasNext: endIndex < sortedPatients.length,
          hasPrev: page > 1,
        },
        statistics: {
          totalPatients: sortedPatients.length,
          patientsWithActiveConditions: sortedPatients.filter(p => p.activeConditions.length > 0).length,
          patientsOnMedications: sortedPatients.filter(p => p.currentMedications.length > 0).length,
          averageVisitsPerPatient: Math.round(
            sortedPatients.reduce((sum, p) => sum + p.visitCount, 0) / sortedPatients.length || 0
          ),
        },
      },
    });

  } catch (error) {
    console.error('Doctor patients fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
