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

    console.log('Session details:', {
      userId: session.user.id,
      userRole: session.user.role,
      userName: session.user.name,
      userEmail: session.user.email
    });

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const riskLevel = searchParams.get('riskLevel');

    // Connect to database
    await dbConnect();
    console.log('Database connected successfully');

    // For hospital users, get patients from their hospital
    // For doctor users, get patients they've treated
    let patients: any[] = [];
    let hospitalRecords: any[] = [];
    
    if (session.user.role === 'hospital') {
      // Get hospital patient records that are active (temporarily removing 24-hour restriction for debugging)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      console.log('Querying hospital records with:', {
        hospitalId: session.user.id,
        status: 'active'
      });
      
      // First, get ALL active records for debugging
      hospitalRecords = await HospitalPatientRecord.find({ 
        hospitalId: session.user.id,
        status: 'active'
        // 24-hour restriction completely removed for debugging
      }).lean();
      
      console.log(`Found ${hospitalRecords.length} active hospital records for hospital ${session.user.id}`);
      console.log('Hospital records:', hospitalRecords.map(r => ({
        id: r._id,
        healthPassportId: r.healthPassportId,
        patientName: r.patientName,
        status: r.status,
        addedDate: r.addedDate,
        hoursAgo: Math.round((new Date().getTime() - new Date(r.addedDate).getTime()) / (1000 * 60 * 60))
      })));
      
      // Show which records would be filtered by 24-hour rule
      const recentRecords = hospitalRecords.filter(record => 
        new Date(record.addedDate) >= twentyFourHoursAgo
      );
      
      console.log(`${recentRecords.length} of ${hospitalRecords.length} records are within 24 hours`);
      console.log('24 hours ago timestamp:', twentyFourHoursAgo.toISOString());
      
      // Use ALL active records (ignoring 24-hour restriction for now)
      // hospitalRecords = recentRecords;
      
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
      
      console.log('Combined query:', JSON.stringify(combinedQuery, null, 2));
      
      patients = await Patient.find(combinedQuery)
        .select('personalInfo visits medicalHistory healthPassportId')
        .limit(limit)
        .lean();
        
      console.log(`Found ${patients.length} patients matching query`);
        
    } else if (session.user.role === 'doctor') {
      // Get all patients this doctor has treated
      const query = { 'visits.doctorId': session.user.id };
      patients = await Patient.find(query)
        .select('personalInfo visits medicalHistory healthPassportId')
        .limit(limit)
        .lean();
    }

    // Transform patient data for the UI
    const patientRecords = [];
    
    // Process patients found in the database
    for (const patient of patients) {
      const visits = patient.visits || [];
      const lastVisit = visits.length > 0 ? visits[visits.length - 1] : null;
      
      // Get hospital record if it exists (find from the already fetched records for efficiency)
      let hospitalRecord: any = null;
      if (session.user.role === 'hospital') {
        hospitalRecord = hospitalRecords.find(record => 
          record.healthPassportId === patient.healthPassportId
        );
      }
      
      console.log(`Patient ${patient.healthPassportId}: hospitalRecord found = ${!!hospitalRecord}`);
      
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

      patientRecords.push({
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
      });
    }
    
    // For hospital users, also add patients that exist only in hospital records but not in Patient collection
    if (session.user.role === 'hospital') {
      const existingPatientIds = patients.map(p => p.healthPassportId);
      const orphanedRecords = hospitalRecords.filter(record => 
        !existingPatientIds.includes(record.healthPassportId)
      );
      
      console.log(`Found ${orphanedRecords.length} orphaned hospital records`);
      
      for (const record of orphanedRecords) {
        patientRecords.push({
          id: record._id,
          healthPassportId: record.healthPassportId,
          name: record.patientName,
          age: record.patientAge,
          lastVisit: record.addedDate,
          recordsCount: 0,
          status: record.status === 'active' ? 'Active' : 'Inactive',
          riskLevel: record.riskLevel || 'Low',
          conditions: record.conditions || [],
          lastUpdate: record.lastUpdated,
          doctor: null,
          addedToHospital: true,
          hospitalRecordId: record._id,
          isOrphaned: true // Flag to indicate this patient data comes only from hospital records
        });
      }
    }

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
    
    // Add visit activities
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
    
    // Add hospital record activities for hospital users
    if (session.user.role === 'hospital') {
      const recentHospitalRecords = hospitalRecords
        .filter(record => {
          const addedDate = new Date(record.addedDate);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return addedDate >= sevenDaysAgo;
        })
        .slice(0, 10);
        
      for (const record of recentHospitalRecords) {
        recentActivity.push({
          patientId: record._id,
          patientName: record.patientName,
          action: 'Added to hospital records',
          timestamp: record.addedDate,
          type: 'hospital_record'
        });
      }
    }

    // Sort recent activity by timestamp (most recent first)
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    console.log(`Final results: ${patientRecords.length} patient records, ${recentActivity.length} recent activities`);

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
        },
        debug: {
          hospitalRecordsCount: hospitalRecords.length,
          patientsFoundInDb: patients.length,
          totalRecordsReturned: filteredRecords.length
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
