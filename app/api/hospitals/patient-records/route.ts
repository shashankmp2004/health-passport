import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import Doctor from '@/lib/models/Doctor';
import Hospital from '@/lib/models/Hospital';
import HospitalPatientRecord from '@/lib/models/HospitalPatientRecord';

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
    let patients: any[] = [];
    
    if (session.user.role === 'hospital') {
      // Get patients from hospital records (added via "Add Patient" feature)
      const hospitalRecords = await HospitalPatientRecord.find({ 
        hospitalId: session.user.id,
        status: 'active'
      }).select('healthPassportId').lean();
      
      const hospitalPatientIds = hospitalRecords.map(record => record.healthPassportId);
      
      // Get patients who have visited this hospital
      const visitQuery = { 'visits.hospitalId': session.user.id };
      
      // Combine both queries - patients from hospital records OR patients with visits
      const combinedQuery = hospitalPatientIds.length > 0 
        ? { $or: [
            { healthPassportId: { $in: hospitalPatientIds } },
            visitQuery
          ]}
        : visitQuery;
      
      patients = await Patient.find(combinedQuery)
        .select('personalInfo visits medicalHistory healthPassportId')
        .limit(limit)
        .lean();
        
    } else if (session.user.role === 'doctor') {
      // Get all patients this doctor has treated
      const query = { 'visits.doctorId': session.user.id };
      patients = await Patient.find(query)
        .select('personalInfo visits medicalHistory healthPassportId')
        .limit(limit)
        .lean();
    }

    // Transform patient data for the UI
    const patientRecords = await Promise.all(
      patients.map(async (patient: any) => {
        const visits = patient.visits || [];
        const lastVisit = visits.length > 0 ? visits[visits.length - 1] : null;
        
        // Get hospital record if it exists
        let hospitalRecord: any = null;
        if (session.user.role === 'hospital') {
          hospitalRecord = await HospitalPatientRecord.findOne({
            hospitalId: session.user.id,
            healthPassportId: patient.healthPassportId
          }).lean();
        }
        
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

        // Determine status based on recent activity or hospital record
        let isActive = recentVisits.length > 0;
        if (hospitalRecord) {
          isActive = hospitalRecord.status === 'active';
        }
        
        // Determine risk level based on conditions and recent visits
        const conditions = patient.medicalHistory?.conditions || [];
        let riskLevel = 'Low';
        
        // Use hospital record risk level if available, otherwise calculate
        if (hospitalRecord && hospitalRecord.riskLevel) {
          riskLevel = hospitalRecord.riskLevel;
        } else {
          const highRiskConditions = ['Heart Disease', 'Diabetes', 'Hypertension', 'Cancer', 'Stroke'];
          const hasHighRiskCondition = conditions.some((condition: any) => 
            highRiskConditions.some(risk => condition.name?.toLowerCase().includes(risk.toLowerCase()))
          );
          
          if (hasHighRiskCondition && conditions.length > 2) {
            riskLevel = 'High';
          } else if (hasHighRiskCondition || conditions.length > 1) {
            riskLevel = 'Moderate';
          }
        }

        // Use hospital record data when available, fallback to patient data
        const patientName = hospitalRecord?.patientName || `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`;
        const patientAge = hospitalRecord?.patientAge || (patient.personalInfo.dateOfBirth ? 
          new Date().getFullYear() - new Date(patient.personalInfo.dateOfBirth).getFullYear() : 
          null);

        return {
          id: patient._id,
          healthPassportId: patient.healthPassportId,
          name: patientName,
          age: patientAge,
          lastVisit: lastVisit?.date || hospitalRecord?.addedDate || null,
          recordsCount,
          status: isActive ? 'Active' : 'Inactive',
          riskLevel,
          conditions: (hospitalRecord?.conditions || conditions.map((c: any) => c.name)).slice(0, 3), // Show max 3 conditions
          lastUpdate: lastVisit?.date || hospitalRecord?.lastUpdated || patient.updatedAt,
          doctor: doctorInfo,
          addedToHospital: !!hospitalRecord,
          hospitalRecordId: hospitalRecord?._id
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
