import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import { medicationSchema } from '@/lib/utils/validation';
import { getMockPatient, isMockPatientById, updateMockPatient } from '@/lib/utils/mock-data';

// GET - Fetch patient's medications
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'completed', 'all'

    // Connect to database
    await dbConnect();

    // Get patient data - check for mock patient first
    let patient;
    if (isMockPatientById(session.user.id)) {
      console.log('Using mock patient data for medications...');
      patient = getMockPatient();
    } else {
      patient = await Patient.findById(session.user.id).select('medications');
    }
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    const medications = patient.medications || patient.medicalHistory?.medications || [];
    const currentDate = new Date();

    // Filter medications based on status
    let filteredMedications = medications;
    if (status === 'active') {
      filteredMedications = medications.filter((med: any) => 
        !med.endDate || new Date(med.endDate) > currentDate
      );
    } else if (status === 'completed') {
      filteredMedications = medications.filter((med: any) => 
        med.endDate && new Date(med.endDate) <= currentDate
      );
    }

    // Sort by start date (most recent first)
    const sortedMedications = filteredMedications.sort((a: any, b: any) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    // Calculate statistics
    const activeMedications = medications.filter((med: any) => 
      !med.endDate || new Date(med.endDate) > currentDate
    );
    const completedMedications = medications.filter((med: any) => 
      med.endDate && new Date(med.endDate) <= currentDate
    );

    return NextResponse.json({
      success: true,
      data: {
        medications: sortedMedications.map((med: any) => ({
          id: med._id || med.id || `med_${Math.random()}`,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          startDate: med.startDate,
          endDate: med.endDate,
          prescribedBy: med.prescribedBy,
          instructions: med.instructions,
          status: med.status,
          isActive: !med.endDate || new Date(med.endDate) > currentDate,
        })),
        statistics: {
          total: medications.length,
          active: activeMedications.length,
          completed: completedMedications.length,
        },
      },
    });

  } catch (error) {
    console.error('Medications fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new medication
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'patient') {
      return NextResponse.json(
        { error: 'Unauthorized - Patient access required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = medicationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const { name, dosage, frequency, startDate, endDate } = validationResult.data;

    // Connect to database
    await dbConnect();

    // Find patient and add medication
    const patient = await Patient.findById(session.user.id);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Create new medication record
    const newMedication = {
      name,
      dosage,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      prescribedBy: session.user.id, // For now, patient can add their own medications
      addedDate: new Date(),
      instructions: body.instructions || '',
    };

    // Add to patient's medications
    patient.medications = patient.medications || [];
    patient.medications.push(newMedication);

    // Save patient
    await patient.save();

    return NextResponse.json({
      success: true,
      message: 'Medication added successfully',
      data: {
        medication: {
          id: patient.medications[patient.medications.length - 1]._id,
          name,
          dosage,
          frequency,
          startDate,
          endDate,
        }
      },
    });

  } catch (error) {
    console.error('Medication creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
