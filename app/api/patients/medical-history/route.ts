import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import { medicalRecordSchema } from '@/lib/utils/validation';

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

    // Get patient data
    const patient = await Patient.findById(session.user.id).select('medicalHistory');
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    const medicalHistory = patient.medicalHistory || [];

    // Sort by diagnosed date (most recent first)
    const sortedHistory = medicalHistory.sort((a: any, b: any) => 
      new Date(b.diagnosedDate).getTime() - new Date(a.diagnosedDate).getTime()
    );

    return NextResponse.json({
      success: true,
      data: {
        medicalHistory: sortedHistory.map((record: any) => ({
          id: record._id,
          condition: record.condition,
          diagnosedDate: record.diagnosedDate,
          status: record.status,
          doctorId: record.doctorId,
          notes: record.notes,
        })),
        totalRecords: sortedHistory.length,
        activeConditions: sortedHistory.filter((record: any) => record.status === 'active').length,
        chronicConditions: sortedHistory.filter((record: any) => record.status === 'chronic').length,
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
