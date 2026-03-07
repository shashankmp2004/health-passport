import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import { medicalRecordSchema } from '@/lib/utils/validation';
import { getMockPatient, isMockPatientById } from '@/lib/utils/mock-data';

// GET - Fetch patient's medical history
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
      console.log('Using mock patient data for medical history...');
      console.log('Session user ID:', session.user.id);
      patient = getMockPatient();
      console.log('Mock patient medical history:', JSON.stringify(patient.medicalHistory, null, 2));
    } else {
      console.log('Using real database for patient ID:', session.user.id);
      patient = await Patient.findById(session.user.id).select('medicalHistory');
    }
    
    if (!patient) {
      console.log('Patient not found for ID:', session.user.id);
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    const medicalHistory = patient.medicalHistory || [];

    // Handle different data structures (mock vs real database)
    let conditions = [];
    if (Array.isArray(medicalHistory)) {
      // Real database structure - flat array
      conditions = medicalHistory;
    } else if (medicalHistory.conditions) {
      // Mock data structure - nested object with conditions array
      conditions = medicalHistory.conditions || [];
    }

    // Sort by diagnosed date (most recent first)
    const sortedHistory = conditions.sort((a: any, b: any) => {
      const dateA = new Date(a.diagnosedDate || 0).getTime();
      const dateB = new Date(b.diagnosedDate || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      data: {
        medicalHistory: sortedHistory.map((record: any) => ({
          id: record._id || record.id || `condition_${Math.random()}`,
          condition: record.condition || record.name,
          diagnosedDate: record.diagnosedDate,
          status: record.status,
          doctorId: record.doctorId || record.doctor,
          notes: record.notes,
          severity: record.severity
        })),
        totalRecords: sortedHistory.length,
        activeConditions: sortedHistory.filter((record: any) => 
          (record.status || '').toLowerCase() === 'active'
        ).length,
        chronicConditions: sortedHistory.filter((record: any) => 
          (record.status || '').toLowerCase() === 'chronic'
        ).length,
      },
    });

  } catch (error) {
    console.error('Medical history fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new medical record
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
    const validationResult = medicalRecordSchema.safeParse(body);
    
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

    const { condition, diagnosedDate, status, notes } = validationResult.data;

    // Connect to database
    await dbConnect();

    // Find patient and add medical record
    const patient = await Patient.findById(session.user.id);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Create new medical record
    const newRecord = {
      condition,
      diagnosedDate: new Date(diagnosedDate),
      status,
      notes,
      doctorId: session.user.id, // For now, patient can add their own records
      addedDate: new Date(),
    };

    // Add to patient's medical history
    patient.medicalHistory = patient.medicalHistory || [];
    patient.medicalHistory.push(newRecord);

    // Save patient
    await patient.save();

    return NextResponse.json({
      success: true,
      message: 'Medical record added successfully',
      data: {
        record: {
          id: patient.medicalHistory[patient.medicalHistory.length - 1]._id,
          condition,
          diagnosedDate,
          status,
          notes,
        }
      },
    });

  } catch (error) {
    console.error('Medical record creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
