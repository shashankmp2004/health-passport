import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Sample patient data store (in a real app, this would be a database)
let patients: any[] = [
  {
    _id: "patient_123",
    healthPassportId: "HP12345",
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1985-06-15",
      gender: "Male",
      phone: "+1-555-123-4567",
      email: "john.doe@email.com",
      address: "123 Main St, New York, NY 10001",
      emergencyContact: {
        name: "Jane Doe",
        phone: "+1-555-987-6543",
        relationship: "Spouse"
      },
      age: 39
    },
    medicalHistory: {
      conditions: [
        {
          name: "Hypertension",
          diagnosedDate: "2020-03-15",
          severity: "Moderate",
          status: "Active",
          notes: "Well controlled with medication"
        }
      ],
      allergies: [
        {
          name: "Penicillin",
          severity: "Severe",
          reaction: "Anaphylaxis",
          discoveredDate: "2010-05-20"
        }
      ],
      medications: [
        {
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          prescribedBy: "Dr. Smith",
          startDate: "2020-03-15",
          status: "Active"
        }
      ],
      immunizations: [
        {
          name: "COVID-19 Vaccine",
          dateAdministered: "2021-04-15",
          manufacturer: "Pfizer",
          lotNumber: "ABC123",
          administeredBy: "Dr. Johnson",
          status: "Complete"
        }
      ],
      procedures: [],
      labResults: [],
      vitalSigns: []
    },
    medications: [],
    vitals: [],
    visits: [],
    documents: [],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    lastUpdated: "2024-01-15T10:30:00Z",
    updatedBy: "hospital@example.com"
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Skip auth check for now - implement based on your auth setup
    // const session = await getServerSession()
    
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const patient = patients.find(p => p.healthPassportId === params.id)
    
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      patient 
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
    // Skip auth check for now - implement based on your auth setup
    // const session = await getServerSession()
    
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { personalInfo, medicalHistory } = body

    // Validate required fields
    if (!personalInfo?.firstName || !personalInfo?.lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      )
    }

    // Find and update patient
    const patientIndex = patients.findIndex(p => p.healthPassportId === params.id)
    
    if (patientIndex === -1) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Update patient data
    patients[patientIndex] = {
      ...patients[patientIndex],
      personalInfo: {
        ...patients[patientIndex].personalInfo,
        ...personalInfo
      },
      medicalHistory: {
        ...patients[patientIndex].medicalHistory,
        ...medicalHistory
      },
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      updatedBy: 'hospital@example.com' // session.user?.email || 'Unknown'
    }

    console.log('Patient updated successfully:', JSON.stringify(patients[patientIndex], null, 2))

    return NextResponse.json({
      success: true,
      message: 'Patient updated successfully',
      patient: patients[patientIndex]
    })
  } catch (error) {
    console.error('Error updating patient:', error)
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
    // Skip auth check for now - implement based on your auth setup
    // const session = await getServerSession()
    
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const patientIndex = patients.findIndex(p => p.healthPassportId === params.id)
    
    if (patientIndex === -1) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Remove patient (in a real app, you might just mark as deleted)
    patients.splice(patientIndex, 1)

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
