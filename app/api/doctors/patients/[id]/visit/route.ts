import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import Doctor from '@/lib/models/Doctor';

// POST - Record a new visit for a patient
export async function POST(
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

    // Parse and validate request body
    const body = await request.json();
    const { 
      diagnosis, 
      treatment, 
      notes, 
      followUpDate, 
      prescriptions,
      vitals,
      medicalConditions 
    } = body;

    // Basic validation
    if (!diagnosis || !treatment) {
      return NextResponse.json(
        { error: 'Diagnosis and treatment are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get doctor data to get hospital affiliation
    const doctor = await Doctor.findById(session.user.id);
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Get patient data
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Create new visit record
    const newVisit = {
      hospitalId: null, // TODO: Link to hospital based on doctor's affiliation
      doctorId: session.user.id,
      date: new Date(),
      diagnosis,
      treatment,
      notes: notes || '',
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      status: 'completed',
    };

    // Add visit to patient
    patient.visits = patient.visits || [];
    patient.visits.push(newVisit);

    // Add prescribed medications
    if (prescriptions && Array.isArray(prescriptions)) {
      patient.medications = patient.medications || [];
      
      prescriptions.forEach((prescription: any) => {
        const newMedication = {
          name: prescription.name,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          startDate: new Date(),
          endDate: prescription.endDate ? new Date(prescription.endDate) : undefined,
          prescribedBy: session.user.id,
          instructions: prescription.instructions || '',
        };
        patient.medications.push(newMedication);
      });
    }

    // Add medical conditions diagnosed
    if (medicalConditions && Array.isArray(medicalConditions)) {
      patient.medicalHistory = patient.medicalHistory || [];
      
      medicalConditions.forEach((condition: any) => {
        const newCondition = {
          condition: condition.condition,
          diagnosedDate: new Date(),
          status: condition.status || 'active',
          doctorId: session.user.id,
          notes: condition.notes || '',
        };
        patient.medicalHistory.push(newCondition);
      });
    }

    // Add vital signs recorded during visit
    if (vitals && Array.isArray(vitals)) {
      patient.vitals = patient.vitals || [];
      
      vitals.forEach((vital: any) => {
        const newVital = {
          type: vital.type,
          value: vital.value,
          unit: vital.unit,
          recordedDate: new Date(),
          recordedBy: session.user.id,
          notes: vital.notes || '',
        };
        patient.vitals.push(newVital);
      });
    }

    // Save patient with all updates
    await patient.save();

    // Get the created visit ID
    const createdVisit = patient.visits[patient.visits.length - 1];

    return NextResponse.json({
      success: true,
      message: 'Visit recorded successfully',
      data: {
        visit: {
          id: createdVisit._id,
          date: createdVisit.date,
          diagnosis: createdVisit.diagnosis,
          treatment: createdVisit.treatment,
          followUpDate: createdVisit.followUpDate,
        },
        prescriptions: prescriptions?.length || 0,
        conditions: medicalConditions?.length || 0,
        vitals: vitals?.length || 0,
      },
    });

  } catch (error) {
    console.error('Visit recording error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
