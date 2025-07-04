import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';

// GET - Get specific patient details for doctor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Unauthorized - Doctor access required' },
        { status: 401 }
      );
    }

    const patientId = params.id;

    // Connect to database
    await dbConnect();

    // Get patient data
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Check if doctor has treated this patient
    const hasVisits = patient.visits?.some((visit: any) => 
      visit.doctorId.toString() === session.user.id
    );

    if (!hasVisits) {
      return NextResponse.json(
        { error: 'Access denied - No treatment history with this patient' },
        { status: 403 }
      );
    }

    // Get doctor's visits with this patient
    const doctorVisits = patient.visits?.filter((visit: any) => 
      visit.doctorId.toString() === session.user.id
    ) || [];

    // Get conditions diagnosed by this doctor
    const doctorConditions = patient.medicalHistory?.filter((condition: any) => 
      condition.doctorId?.toString() === session.user.id
    ) || [];

    // Get medications prescribed by this doctor
    const doctorMedications = patient.medications?.filter((med: any) => 
      med.prescribedBy?.toString() === session.user.id
    ) || [];

    // Sort visits by date (most recent first)
    const sortedVisits = doctorVisits.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Get recent vitals (last 10)
    const recentVitals = patient.vitals?.slice(-10) || [];

    // Prepare detailed patient data
    const patientDetails = {
      id: patient._id,
      healthPassportId: patient.healthPassportId,
      personalInfo: {
        firstName: patient.personalInfo.firstName,
        lastName: patient.personalInfo.lastName,
        email: patient.personalInfo.email,
        phone: patient.personalInfo.phone,
        dateOfBirth: patient.personalInfo.dateOfBirth,
        bloodType: patient.personalInfo.bloodType,
        // Don't expose sensitive info like Aadhar
      },
      visitHistory: sortedVisits.map((visit: any) => ({
        id: visit._id,
        date: visit.date,
        diagnosis: visit.diagnosis,
        treatment: visit.treatment,
        notes: visit.notes,
        followUpDate: visit.followUpDate,
        status: visit.status,
      })),
      medicalHistory: {
        diagnosedByDoctor: doctorConditions.map((condition: any) => ({
          id: condition._id,
          condition: condition.condition,
          diagnosedDate: condition.diagnosedDate,
          status: condition.status,
          notes: condition.notes,
        })),
        allConditions: patient.medicalHistory?.map((condition: any) => ({
          id: condition._id,
          condition: condition.condition,
          diagnosedDate: condition.diagnosedDate,
          status: condition.status,
          isDoctorDiagnosed: condition.doctorId?.toString() === session.user.id,
        })) || [],
      },
      medications: {
        prescribedByDoctor: doctorMedications.map((med: any) => ({
          id: med._id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          startDate: med.startDate,
          endDate: med.endDate,
          instructions: med.instructions,
          isActive: !med.endDate || new Date(med.endDate) > new Date(),
        })),
        allMedications: patient.medications?.map((med: any) => ({
          id: med._id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          startDate: med.startDate,
          endDate: med.endDate,
          isPrescribedByDoctor: med.prescribedBy?.toString() === session.user.id,
          isActive: !med.endDate || new Date(med.endDate) > new Date(),
        })) || [],
      },
      vitals: recentVitals.map((vital: any) => ({
        id: vital._id,
        type: vital.type,
        value: vital.value,
        unit: vital.unit,
        recordedDate: vital.recordedDate,
        recordedBy: vital.recordedBy,
      })),
      documents: patient.documents?.map((doc: any) => ({
        id: doc._id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        category: doc.category,
        uploadDate: doc.uploadDate,
        description: doc.description,
        isPublic: doc.isPublic,
      })) || [],
      statistics: {
        totalVisits: doctorVisits.length,
        conditionsDiagnosed: doctorConditions.length,
        medicationsPrescribed: doctorMedications.length,
        lastVisit: sortedVisits[0]?.date || null,
        nextFollowUp: sortedVisits.find((visit: any) => 
          visit.followUpDate && new Date(visit.followUpDate) > new Date()
        )?.followUpDate || null,
      },
    };

    return NextResponse.json({
      success: true,
      data: patientDetails,
    });

  } catch (error) {
    console.error('Patient details fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
