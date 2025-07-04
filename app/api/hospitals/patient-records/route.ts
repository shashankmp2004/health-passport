import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import Doctor from '@/lib/models/Doctor';
import Hospital from '@/lib/models/Hospital';

// GET - Fetch hospital's patient records and recent activity
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'hospital' && session.user.role !== 'doctor')) {
      return NextResponse.json(
        { error: 'Unauthorized - Hospital or Doctor access required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const riskLevel = searchParams.get('riskLevel');

    // Connect to database
    await dbConnect();

    // For hospital users, get patients from their hospital
    // For doctor users, get patients they've treated
    let query: any = {};
    
    if (session.user.role === 'hospital') {
      // Get all patients who have visited this hospital
      query = { 'visits.hospitalId': session.user.id };
    } else if (session.user.role === 'doctor') {
      // Get all patients this doctor has treated
      query = { 'visits.doctorId': session.user.id };
    }

    // Get patients with their visit information
    const patients = await Patient.find(query)
      .select('personalInfo visits medicalHistory')
      .limit(limit)
      .lean();

    // Transform patient data for the UI
    const patientRecords = await Promise.all(
      patients.map(async (patient: any) => {
        const visits = patient.visits || [];
        const lastVisit = visits.length > 0 ? visits[visits.length - 1] : null;
        
        // Get doctor info for last visit
        let doctorInfo = null;
        if (lastVisit?.doctorId) {
          const doctor = await Doctor.findById(lastVisit.doctorId).select('personalInfo specialty');
          if (doctor) {
            doctorInfo = {
              name: `${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`,
              specialty: doctor.specialty
            };
          }
        }

        // Calculate basic statistics
        const recordsCount = visits.length + (patient.medicalHistory?.documents?.length || 0);
        const recentVisits = visits.filter((visit: any) => {
          const visitDate = new Date(visit.date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return visitDate >= thirtyDaysAgo;
        });

        // Determine status based on recent activity
        const isActive = recentVisits.length > 0;
        
        // Determine risk level based on conditions and recent visits
        const conditions = patient.medicalHistory?.conditions || [];
        let riskLevel = 'Low';
        
        const highRiskConditions = ['Heart Disease', 'Diabetes', 'Hypertension', 'Cancer', 'Stroke'];
        const hasHighRiskCondition = conditions.some((condition: any) => 
          highRiskConditions.some(risk => condition.name?.toLowerCase().includes(risk.toLowerCase()))
        );
        
        if (hasHighRiskCondition && conditions.length > 2) {
          riskLevel = 'High';
        } else if (hasHighRiskCondition || conditions.length > 1) {
          riskLevel = 'Moderate';
        }

        return {
          id: patient._id,
          name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
          age: patient.personalInfo.dateOfBirth ? 
            new Date().getFullYear() - new Date(patient.personalInfo.dateOfBirth).getFullYear() : 
            null,
          lastVisit: lastVisit?.date || null,
          recordsCount,
          status: isActive ? 'Active' : 'Inactive',
          riskLevel,
          conditions: conditions.map((c: any) => c.name).slice(0, 3), // Show max 3 conditions
          lastUpdate: lastVisit?.date || patient.updatedAt,
          doctor: doctorInfo
        };
      })
    );

    // Filter results based on query parameters
    let filteredRecords = patientRecords;
    
    if (status) {
      filteredRecords = filteredRecords.filter(record => 
        record.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    if (riskLevel) {
      filteredRecords = filteredRecords.filter(record => 
        record.riskLevel.toLowerCase() === riskLevel.toLowerCase()
      );
    }

    // Get recent activity (last 50 activities)
    const recentActivity = [];
    for (const patient of patients.slice(0, 10)) { // Limit to avoid performance issues
      const visits = patient.visits || [];
      const recentVisits = visits
        .filter((visit: any) => {
          const visitDate = new Date(visit.date);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return visitDate >= sevenDaysAgo;
        })
        .slice(0, 5);

      for (const visit of recentVisits) {
        recentActivity.push({
          patientId: patient._id,
          patientName: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
          action: visit.diagnosis ? `Diagnosed with ${visit.diagnosis}` : 'Visit completed',
          timestamp: visit.date,
          type: 'visit'
        });
      }
    }

    // Sort recent activity by timestamp (most recent first)
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      data: {
        patientRecords: filteredRecords,
        recentActivity: recentActivity.slice(0, 20), // Limit to 20 most recent
        statistics: {
          total: filteredRecords.length,
          active: filteredRecords.filter(r => r.status === 'Active').length,
          highRisk: filteredRecords.filter(r => r.riskLevel === 'High').length,
          recentUpdates: recentActivity.length
        }
      }
    });

  } catch (error) {
    console.error('Patient records fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
