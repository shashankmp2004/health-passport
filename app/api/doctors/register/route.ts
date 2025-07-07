import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Doctor from '@/lib/models/Doctor'
import { doctorRegistrationSchema } from '@/lib/utils/validation'
import { hashPassword, generateDoctorId } from '@/lib/utils/helpers'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    
    // Validate input data
    const validationResult = doctorRegistrationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      licenseNumber, 
      specialty, 
      hospitalAffiliation, 
      password 
    } = validationResult.data
    
    // Check if email already exists
    const existingEmail = await Doctor.findOne({ 'personalInfo.email': email })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }
    
    // Check if license number already exists
    const existingLicense = await Doctor.findOne({ 'personalInfo.licenseNumber': licenseNumber })
    if (existingLicense) {
      return NextResponse.json(
        { error: 'Medical license number already registered' },
        { status: 409 }
      )
    }
    
    // Generate unique Doctor ID
    let doctorId: string
    let isUnique = false
    
    while (!isUnique) {
      doctorId = generateDoctorId()
      const existing = await Doctor.findOne({ doctorId })
      if (!existing) {
        isUnique = true
      }
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password)
    
    // Create new doctor
    const newDoctor = new Doctor({
      doctorId: doctorId!,
      personalInfo: {
        firstName,
        lastName,
        email,
        phone,
        licenseNumber,
        specialty,
        hospitalAffiliation
      },
      credentials: {
        verified: false // Will be verified by admin later
      },
      password: hashedPassword
    })
    
    await newDoctor.save()
    
    // Return success response (don't include password)
    const { password: _, ...doctorData } = newDoctor.toObject()
    
    return NextResponse.json(
      { 
        message: 'Doctor registered successfully',
        doctor: {
          doctorId: doctorData.doctorId,
          personalInfo: doctorData.personalInfo,
          credentials: doctorData.credentials,
          createdAt: doctorData.createdAt
        }
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Doctor registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
