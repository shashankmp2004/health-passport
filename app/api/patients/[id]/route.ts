import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import dbConnect from '@/lib/db/mongodb'
import Patient from '@/lib/models/Patient'

// Mock patient data for testing (in memory)
let mockPatient = {
  _id: 'mock_patient_1',
  healthPassportId: 'HP12345',
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1985-06-15',
    gender: 'Male',
    phone: '+1-555-123-4567',
    email: 'john.doe@email.com',
    address: '123 Main St, New York, NY 10001',
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+1-555-987-6543',
      relationship: 'Spouse'
    },
    age: 39
  },
  medicalHistory: {
    conditions: [],
    allergies: [],
    medications: [],
    immunizations: [],
    procedures: [],
    labResults: [],
    vitalSigns: []
  },
  medications: [],
  vitals: [],
  visits: [],
  documents: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'hospital' && session.user.role !== 'doctor')) {
      return NextResponse.json(
        { error: 'Unauthorized - Hospital or Doctor access required' },
        { status: 401 }
      )
    }

    // Connect to database
    await dbConnect()

    // Find patient by healthPassportId
    let patient = await Patient.findOne({ healthPassportId: params.id }).select('-password')
    
    if (!patient) {
      // Return mock data for testing if in development mode and searching for HP12345
      if (process.env.NODE_ENV === 'development' && params.id === 'HP12345') {
        console.log('Returning mock patient data for GET request...');
        return NextResponse.json({
          success: true,
          patient: mockPatient
        });
      }
      
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Calculate age from date of birth
    const age = patient.personalInfo.dateOfBirth ? 
      Math.floor((Date.now() - new Date(patient.personalInfo.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) :
      null

    // Prepare patient data for response
    const patientData = {
      _id: patient._id,
      healthPassportId: patient.healthPassportId,
      personalInfo: {
        ...patient.personalInfo.toObject(),
        age
      },
      medicalHistory: patient.medicalHistory || {
        conditions: [],
        allergies: [],
        medications: [],
        immunizations: [],
        procedures: [],
        labResults: [],
        vitalSigns: []
      },
      medications: patient.medications || [],
      vitals: patient.vitals || [],
      visits: patient.visits || [],
      documents: patient.documents || [],
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt
    }

    return NextResponse.json({ 
      success: true, 
      patient: patientData
    })
  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PUT request received for patient:', params.id);
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'hospital' && session.user.role !== 'doctor')) {
      return NextResponse.json(
        { error: 'Unauthorized - Hospital or Doctor access required' },
        { status: 401 }
      )
    }

    console.log('Authentication successful, user role:', session.user.role);

    const body = await request.json()
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    const { personalInfo, medicalHistory } = body

    // Validate required fields
    if (!personalInfo?.firstName || !personalInfo?.lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      )
    }

    console.log('Validation passed, connecting to database...');

    // Connect to database
    await dbConnect()

    // Find and update patient
    let patient = await Patient.findOne({ healthPassportId: params.id })
    
    if (!patient) {
      // Handle mock data for testing if in development mode and searching for HP12345
      if (process.env.NODE_ENV === 'development' && params.id === 'HP12345') {
        console.log('Updating mock patient data...');
        console.log('Received personalInfo:', personalInfo);
        console.log('Received medicalHistory:', medicalHistory);
        
        try {
          // Update mock patient data safely
          if (personalInfo) {
            mockPatient.personalInfo = { ...mockPatient.personalInfo, ...personalInfo }
          }
          
          if (medicalHistory) {
            // Handle medicalHistory updates more carefully
            mockPatient.medicalHistory = {
              conditions: medicalHistory.conditions || mockPatient.medicalHistory.conditions || [],
              allergies: medicalHistory.allergies || mockPatient.medicalHistory.allergies || [],
              medications: medicalHistory.medications || mockPatient.medicalHistory.medications || [],
              immunizations: medicalHistory.immunizations || mockPatient.medicalHistory.immunizations || [],
              procedures: medicalHistory.procedures || mockPatient.medicalHistory.procedures || [],
              labResults: medicalHistory.labResults || mockPatient.medicalHistory.labResults || [],
              vitalSigns: medicalHistory.vitalSigns || mockPatient.medicalHistory.vitalSigns || []
            }
          }
          
          mockPatient.updatedAt = new Date().toISOString()
          
          console.log('Mock patient updated successfully');
          
          return NextResponse.json({
            success: true,
            message: 'Patient updated successfully',
            patient: mockPatient
          })
        } catch (mockError) {
          console.error('Error updating mock patient:', mockError);
          return NextResponse.json(
            { error: 'Error updating mock patient data' },
            { status: 500 }
          )
        }
      }
      
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Update patient data
    if (personalInfo) {
      patient.personalInfo = { ...patient.personalInfo.toObject(), ...personalInfo }
    }
    
    if (medicalHistory) {
      patient.medicalHistory = { ...patient.medicalHistory?.toObject() || {}, ...medicalHistory }
    }

    patient.updatedAt = new Date()
    await patient.save()

    // Calculate age for response
    const age = patient.personalInfo.dateOfBirth ? 
      Math.floor((Date.now() - new Date(patient.personalInfo.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) :
      null

    // Prepare updated patient data for response
    const updatedPatientData = {
      _id: patient._id,
      healthPassportId: patient.healthPassportId,
      personalInfo: {
        ...patient.personalInfo.toObject(),
        age
      },
      medicalHistory: patient.medicalHistory || {
        conditions: [],
        allergies: [],
        medications: [],
        immunizations: [],
        procedures: [],
        labResults: [],
        vitalSigns: []
      },
      medications: patient.medications || [],
      vitals: patient.vitals || [],
      visits: patient.visits || [],
      documents: patient.documents || [],
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt
    }

    console.log('Patient updated successfully:', JSON.stringify(updatedPatientData, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Patient updated successfully',
      patient: updatedPatientData
    })
  } catch (error) {
    console.error('Error updating patient:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      params: params.id,
      session: session?.user?.role
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'hospital' && session.user.role !== 'doctor')) {
      return NextResponse.json(
        { error: 'Unauthorized - Hospital or Doctor access required' },
        { status: 401 }
      )
    }

    // Connect to database
    await dbConnect()

    const patient = await Patient.findOne({ healthPassportId: params.id })
    
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // In a real application, you might want to soft delete instead
    await Patient.deleteOne({ healthPassportId: params.id })

    return NextResponse.json({
      success: true,
      message: 'Patient deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting patient:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
