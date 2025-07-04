import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Hospital from '@/lib/models/Hospital';
import Patient from '@/lib/models/Patient';
import Doctor from '@/lib/models/Doctor';

// GET - Get hospital's patient records
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'lastVisit'; // name, lastVisit, visits
    const department = searchParams.get('department'); // filter by doctor specialty

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

    // Get patients who have visits at this hospital
    let query: any = {
      'visits.hospitalId': session.user.id
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

    // Get affiliated doctors if department filter is needed
    let affiliatedDoctors: any[] = [];
    if (department) {
      affiliatedDoctors = await Doctor.find({
        hospitalAffiliation: hospital.facilityName,
        specialty: department
      }).select('_id');
    }

    // Process and enrich patient data
    const enrichedPatients = await Promise.all(
      patientsWithVisits.map(async patient => {
        // Get hospital visits
        const hospitalVisits = patient.visits?.filter((visit: any) => 
          visit.hospitalId.toString() === session.user.id
        ) || [];

        // Filter by department if specified
        let filteredVisits = hospitalVisits;
        if (department && affiliatedDoctors.length > 0) {
          const doctorIds = affiliatedDoctors.map(doc => doc._id.toString());
          filteredVisits = hospitalVisits.filter((visit: any) => 
            doctorIds.includes(visit.doctorId?.toString())
          );
        }

        if (filteredVisits.length === 0 && department) {
          return null; // Skip this patient if no visits in the specified department
        }

        const lastVisit = filteredVisits.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];

        // Get doctor details for the last visit
        let attendingDoctor = null;
        if (lastVisit?.doctorId) {
          const doctor = await Doctor.findById(lastVisit.doctorId).select('personalInfo specialty');
          if (doctor) {
            attendingDoctor = {
              id: doctor._id,
              name: `${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`,
              specialty: doctor.specialty,
            };
          }
        }

        // Get active conditions from hospital visits
        const hospitalConditions = patient.medicalHistory?.filter((condition: any) => {
          if (!condition.doctorId) return false;
          // Check if the condition was diagnosed by a doctor affiliated with this hospital
          return hospitalVisits.some((visit: any) => 
            visit.doctorId?.toString() === condition.doctorId.toString()
          );
        }) || [];

        // Get current medications from hospital doctors
        const hospitalMedications = patient.medications?.filter((med: any) => {
          if (!med.prescribedBy) return false;
          return hospitalVisits.some((visit: any) => 
            visit.doctorId?.toString() === med.prescribedBy.toString()
          ) && (!med.endDate || new Date(med.endDate) > new Date());
        }) || [];

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
            doctor: attendingDoctor,
          } : null,
          visitCount: filteredVisits.length,
          totalHospitalVisits: hospitalVisits.length,
          activeConditions: hospitalConditions.filter((condition: any) => 
            condition.status === 'active'
          ).map((condition: any) => ({
            condition: condition.condition,
            diagnosedDate: condition.diagnosedDate,
            status: condition.status,
          })),
          currentMedications: hospitalMedications.slice(0, 3).map((med: any) => ({
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
          riskLevel: calculateRiskLevel(hospitalConditions, hospitalMedications, recentVitals),
        };
      })
    );

    // Filter out null values (patients filtered by department)
    const validPatients = enrichedPatients.filter(patient => patient !== null);

    // Sort patients
    let sortedPatients = validPatients;
    switch (sortBy) {
      case 'name':
        sortedPatients = validPatients.sort((a: any, b: any) => a.name.localeCompare(b.name));
        break;
      case 'visits':
        sortedPatients = validPatients.sort((a: any, b: any) => b.visitCount - a.visitCount);
        break;
      case 'risk':
        sortedPatients = validPatients.sort((a: any, b: any) => {
          const riskOrder = { high: 3, medium: 2, low: 1 };
          return (riskOrder[b.riskLevel as keyof typeof riskOrder] || 0) - 
                 (riskOrder[a.riskLevel as keyof typeof riskOrder] || 0);
        });
        break;
      case 'lastVisit':
      default:
        sortedPatients = validPatients.sort((a: any, b: any) => {
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
          highRiskPatients: sortedPatients.filter((p: any) => p.riskLevel === 'high').length,
          mediumRiskPatients: sortedPatients.filter((p: any) => p.riskLevel === 'medium').length,
          lowRiskPatients: sortedPatients.filter((p: any) => p.riskLevel === 'low').length,
          averageVisitsPerPatient: Math.round(
            sortedPatients.reduce((sum: number, p: any) => sum + p.visitCount, 0) / sortedPatients.length || 0
          ),
        },
        filters: {
          availableDepartments: department ? [department] : [], // TODO: Get actual departments
        },
      },
    });

  } catch (error) {
    console.error('Hospital patients fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate patient risk level
function calculateRiskLevel(conditions: any[], medications: any[], vitals: any[]): 'low' | 'medium' | 'high' {
  let riskScore = 0;
  
  // Risk from active conditions
  const activeConditions = conditions.filter(c => c.status === 'active').length;
  riskScore += activeConditions * 2;
  
  // Risk from chronic conditions
  const chronicConditions = conditions.filter(c => c.status === 'chronic').length;
  riskScore += chronicConditions * 3;
  
  // Risk from multiple medications
  if (medications.length > 5) riskScore += 3;
  else if (medications.length > 3) riskScore += 2;
  else if (medications.length > 1) riskScore += 1;
  
  // Risk from missing recent vitals
  if (vitals.length === 0) riskScore += 2;
  
  // Determine risk level
  if (riskScore >= 8) return 'high';
  if (riskScore >= 4) return 'medium';
  return 'low';
}
