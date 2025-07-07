import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Patient from '@/lib/models/Patient'

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()

    // Get search parameters
    const { searchParams } = new URL(request.url)
    const healthPassportId = searchParams.get('healthPassportId')

    if (!healthPassportId) {
      return NextResponse.json(
        { error: 'healthPassportId parameter required' },
        { status: 400 }
      )
    }

    // Find patient without authentication for testing
    const patient = await Patient.findOne({ healthPassportId }).select('-password')

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found', searchedFor: healthPassportId },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      patient: {
        healthPassportId: patient.healthPassportId,
        personalInfo: patient.personalInfo,
        medicalHistory: patient.medicalHistory || [],
        medications: patient.medications || [],
        vitals: patient.vitals || [],
        visits: patient.visits || [],
        documents: patient.documents || []
      }
    })

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
