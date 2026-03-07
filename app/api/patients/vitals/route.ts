import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import { vitalSignSchema } from '@/lib/utils/validation';
import { getMockPatient, isMockPatientById, updateMockPatient } from '@/lib/utils/mock-data';

// GET - Fetch patient's vital signs
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
    const type = searchParams.get('type'); // specific vital type
    const limit = parseInt(searchParams.get('limit') || '50');
    const days = parseInt(searchParams.get('days') || '30'); // last N days

    // Connect to database
    await dbConnect();

    // Get patient data - check for mock patient first
    let patient;
    if (isMockPatientById(session.user.id)) {
      console.log('Using mock patient data for vitals...');
      patient = getMockPatient();
    } else {
      patient = await Patient.findById(session.user.id).select('vitals');
    }
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    const vitals = patient.vitals || [];
    
    // Filter by date range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    let filteredVitals = vitals.filter((vital: any) => 
      new Date(vital.recordedDate) >= cutoffDate
    );

    // Filter by type if specified
    if (type) {
      filteredVitals = filteredVitals.filter((vital: any) => vital.type === type);
    }

    // Sort by recorded date (most recent first)
    const sortedVitals = filteredVitals
      .sort((a: any, b: any) => 
        new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime()
      )
      .slice(0, limit);

    // Calculate statistics for each vital type
    const vitalTypes = ['blood_pressure', 'heart_rate', 'weight', 'height', 'temperature', 'oxygen_saturation'];
    const statistics = vitalTypes.reduce((stats: any, vitalType) => {
      const typeVitals = vitals.filter((vital: any) => vital.type === vitalType);
      const recent = typeVitals.slice(0, 5); // Last 5 readings
      
      stats[vitalType] = {
        total: typeVitals.length,
        latest: typeVitals[0] || null,
        trend: recent.length > 1 ? calculateTrend(recent) : null,
      };
      
      return stats;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        vitals: sortedVitals.map((vital: any) => ({
          id: vital._id,
          type: vital.type,
          value: vital.value,
          unit: vital.unit,
          recordedDate: vital.recordedDate,
          recordedBy: vital.recordedBy,
          notes: vital.notes,
        })),
        statistics,
        totalRecords: filteredVitals.length,
        dateRange: {
          from: cutoffDate,
          to: new Date(),
        },
      },
    });

  } catch (error) {
    console.error('Vitals fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Record new vital signs
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
    const validationResult = vitalSignSchema.safeParse(body);
    
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

    const { type, value, unit, recordedDate } = validationResult.data;

    // Connect to database
    await dbConnect();

    // Find patient and add vital signs
    const patient = await Patient.findById(session.user.id);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Create new vital sign record
    const newVital = {
      type,
      value,
      unit,
      recordedDate: new Date(recordedDate),
      recordedBy: session.user.id,
      notes: body.notes || '',
      deviceInfo: body.deviceInfo || '',
    };

    // Add to patient's vitals
    patient.vitals = patient.vitals || [];
    patient.vitals.push(newVital);

    // Save patient
    await patient.save();

    return NextResponse.json({
      success: true,
      message: 'Vital signs recorded successfully',
      data: {
        vital: {
          id: patient.vitals[patient.vitals.length - 1]._id,
          type,
          value,
          unit,
          recordedDate,
        }
      },
    });

  } catch (error) {
    console.error('Vital signs recording error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate trend
function calculateTrend(vitals: any[]): 'increasing' | 'decreasing' | 'stable' {
  if (vitals.length < 2) return 'stable';
  
  const values = vitals.map(v => parseFloat(v.value)).filter(v => !isNaN(v));
  if (values.length < 2) return 'stable';
  
  const latest = values[0];
  const previous = values[1];
  const difference = latest - previous;
  const threshold = previous * 0.05; // 5% threshold
  
  if (Math.abs(difference) < threshold) return 'stable';
  return difference > 0 ? 'increasing' : 'decreasing';
}
