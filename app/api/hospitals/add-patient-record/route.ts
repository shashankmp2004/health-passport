import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import dbConnect from '@/lib/db/mongodb'
import HospitalPatientRecord from '@/lib/models/HospitalPatientRecord'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'hospital' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Hospital access required' },
        { status: 401 }
      )
    }

    // Connect to database
    await dbConnect()

    const { healthPassportId, patientData } = await request.json()

    if (!healthPassportId || !patientData) {
      return NextResponse.json(
        { error: 'Health Passport ID and patient data are required' },
        { status: 400 }
      )
    }

    const hospitalId = session.user.role === 'admin' ? 'system-admin' : session.user.id;
    const hospitalName = session.user.role === 'admin' ? 'System Administrator' : (session.user.name || 'Unknown Hospital');

    // Check if patient is already in hospital records (skip for admins adding globally)
    if (session.user.role !== 'admin') {
      const existingRecord = await HospitalPatientRecord.findOne({
        hospitalId: hospitalId,
        healthPassportId: healthPassportId
      })

      if (existingRecord) {
        return NextResponse.json(
          { error: 'Patient is already in your hospital records' },
          { status: 409 }
        )
      }
    }

    // Create new hospital patient record
    const newRecord = new HospitalPatientRecord({
      hospitalId: hospitalId,
      hospitalName: hospitalName,
      healthPassportId: healthPassportId,
      patientName: patientData.name,
      patientAge: patientData.age,
      bloodType: patientData.bloodType,
      emergencyContact: patientData.emergencyContact,
      riskLevel: patientData.riskLevel,
      conditions: patientData.conditions || [],
      allergies: patientData.allergies || [],
      addedDate: new Date(),
      lastUpdated: new Date(),
      status: 'active',
      notes: `Patient added via QR scan/search on ${new Date().toLocaleDateString()}`,
      accessLevel: 'full', // Hospital has full access
      metadata: {
        addedBy: session.user.id,
        addedByName: session.user.name || session.user.email,
        addMethod: 'hospital_search',
        originalData: patientData
      }
    })

    await newRecord.save()

    return NextResponse.json({
      success: true,
      message: 'Patient added to hospital records successfully',
      recordId: newRecord._id,
      patient: {
        healthPassportId: newRecord.healthPassportId,
        name: newRecord.patientName,
        addedDate: newRecord.addedDate
      }
    })

  } catch (error) {
    console.error('Error adding patient to records:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
