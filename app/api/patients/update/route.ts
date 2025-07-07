import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import dbConnect from '@/lib/db/mongodb'
import Patient from '@/lib/models/Patient'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const { healthPassportId, updates } = await request.json()
    
    if (!healthPassportId) {
      return NextResponse.json({ error: 'Health Passport ID is required' }, { status: 400 })
    }

    // Find and update the patient
    const updatedPatient = await Patient.findOneAndUpdate(
      { healthPassportId },
      { 
        ...updates,
        lastUpdated: new Date(),
        updatedBy: session.user?.email || 'system'
      },
      { new: true, runValidators: true }
    )

    if (!updatedPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedPatient
    })
  } catch (error) {
    console.error('Error updating patient:', error)
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    )
  }
}
