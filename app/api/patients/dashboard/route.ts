import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import { Patient as PatientType, Medication, VitalSign, Visit, MedicalHistory, Document } from '@/types/patient';
import { getMockPatient, isMockPatientById } from '@/lib/utils/mock-data';

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

    // Connect to database
    await dbConnect();

    // Get patient data - check for mock patient first
    let patient;
    if (isMockPatientById(session.user.id)) {
      console.log('Using mock patient data for dashboard...');
      console.log('Session user ID:', session.user.id);
      patient = getMockPatient();
      console.log('Mock patient data loaded:', {
        id: patient._id,
        healthPassportId: patient.healthPassportId,
        medicationsCount: patient.medications?.length || 0,
        vitalsCount: patient.vitals?.length || 0,
        visitsCount: patient.visits?.length || 0
      });
    } else {
      console.log('Using real database for patient ID:', session.user.id);
      patient = await Patient.findById(session.user.id).select('-password');
    }
    
    if (!patient) {
      console.log('Patient not found for ID:', session.user.id);
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Calculate dashboard statistics
    const totalVisits = patient.visits?.length || 0;
    
    // Handle medications for both mock and real data structures
    let medications = [];
    if (patient.medications) {
      medications = patient.medications;
    } else if (patient.medicalHistory?.medications) {
      medications = patient.medicalHistory.medications;
    }
    
    const activeMedications = medications.filter((med: any) => 
      !med.endDate || new Date(med.endDate) > new Date()
    ).length || 0;
    
    const totalDocuments = patient.documents?.length || 0;
    const recentVitals = patient.vitals?.slice(-5) || [];
    const recentVisits = patient.visits?.slice(-3) || [];
    const currentMedications = medications.filter((med: any) => 
      !med.endDate || new Date(med.endDate) > new Date()
    ).slice(0, 5) || [];

    // Get last vital readings
    const lastVitals = {
      bloodPressure: patient.vitals?.filter((v: any) => v.type === 'blood_pressure').slice(-1)[0]?.value || null,
      heartRate: patient.vitals?.filter((v: any) => v.type === 'heart_rate').slice(-1)[0]?.value || null,
      weight: patient.vitals?.filter((v: any) => v.type === 'weight').slice(-1)[0]?.value || null,
      temperature: patient.vitals?.filter((v: any) => v.type === 'temperature').slice(-1)[0]?.value || null,
    };

    // Calculate health score (simple algorithm)
    const calculateHealthScore = () => {
      let score = 85; // Base score
      
      // Get conditions from the appropriate structure
      let conditions = [];
      if (Array.isArray(patient.medicalHistory)) {
        conditions = patient.medicalHistory;
      } else if (patient.medicalHistory?.conditions) {
        conditions = patient.medicalHistory.conditions;
      }
      
      // Deduct for chronic conditions
      const chronicConditions = conditions.filter((condition: any) => 
        (condition.status || '').toLowerCase() === 'chronic' ||
        (condition.status || '').toLowerCase() === 'ongoing' ||
        (condition.status || '').toLowerCase() === 'active'
      ).length || 0;
      score -= chronicConditions * 5;
      
      // Deduct for multiple medications
      if (activeMedications > 3) score -= 10;
      else if (activeMedications > 1) score -= 5;
      
      // Add for recent vitals (shows active monitoring)
      if (recentVitals.length > 0) score += 5;
      
      return Math.max(50, Math.min(100, score));
    };

    const healthScore = calculateHealthScore();

    // Prepare dashboard data
    const dashboardData = {
      patient: {
        id: patient._id,
        name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
        email: patient.personalInfo.email,
        phone: patient.personalInfo.phone,
        bloodType: patient.personalInfo.bloodType,
        dateOfBirth: patient.personalInfo.dateOfBirth,
        profilePicture: patient.profilePicture || null,
      },
      statistics: {
        totalVisits,
        activeMedications,
        totalDocuments,
        healthScore,
      },
      lastVitals,
      recentVisits: recentVisits.map((visit: any) => ({
        id: visit._id,
        date: visit.date,
        hospitalId: visit.hospitalId,
        doctorId: visit.doctorId,
        diagnosis: visit.diagnosis,
        treatment: visit.treatment,
      })),
      currentMedications: currentMedications.map((med: any) => ({
        id: med._id,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        startDate: med.startDate,
        endDate: med.endDate,
      })),
      recentDocuments: patient.documents?.slice(-3).map((doc: any) => ({
        id: doc._id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        uploadDate: doc.uploadDate,
      })) || [],
      upcomingAppointments: [], // TODO: Implement appointments system
      healthAlerts: [], // TODO: Implement health alerts system
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });

  } catch (error) {
    console.error('Patient dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
