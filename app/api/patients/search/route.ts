import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import dbConnect from '@/lib/db/mongodb'
import Patient from '@/lib/models/Patient'

export async function GET(request: NextRequest) {
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

    // Get search parameters
    const { searchParams } = new URL(request.url)
    const healthPassportId = searchParams.get('healthPassportId')
    const name = searchParams.get('name')
    const phone = searchParams.get('phone')
    const email = searchParams.get('email')

    if (!healthPassportId && !name && !phone && !email) {
      return NextResponse.json(
        { error: 'Search parameter required (healthPassportId, name, phone, or email)' },
        { status: 400 }
      )
    }

    let query: any = {}

    if (healthPassportId) {
      query.healthPassportId = healthPassportId
    } else if (name) {
      // Search by name (case insensitive)
      const nameParts = name.split(' ')
      if (nameParts.length === 1) {
        query.$or = [
          { 'personalInfo.firstName': { $regex: name, $options: 'i' } },
          { 'personalInfo.lastName': { $regex: name, $options: 'i' } }
        ]
      } else {
        query.$and = [
          { 'personalInfo.firstName': { $regex: nameParts[0], $options: 'i' } },
          { 'personalInfo.lastName': { $regex: nameParts[1], $options: 'i' } }
        ]
      }
    } else if (phone) {
      query['personalInfo.phone'] = { $regex: phone }
    } else if (email) {
      query['personalInfo.email'] = { $regex: email, $options: 'i' }
    }

    // Find patient
    const patient = await Patient.findOne(query).select('-password')

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
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
      medicalHistory: patient.medicalHistory || [],
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
    console.error('Patient search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
