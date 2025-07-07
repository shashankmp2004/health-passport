import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Hospital from '@/lib/models/Hospital'
import { hospitalRegistrationSchema } from '@/lib/utils/validation'
import { hashPassword, generateHospitalId } from '@/lib/utils/helpers'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    
    // Validate input data
    const validationResult = hospitalRegistrationSchema.safeParse(body)
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
      facilityName,
      facilityType,
      adminFirstName,
      adminLastName,
      email,
      phone,
      address,
      licenseNumber,
      password 
    } = validationResult.data
    
    // Check if email already exists
    const existingEmail = await Hospital.findOne({ 'facilityInfo.email': email })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }
    
    // Check if license number already exists
    const existingLicense = await Hospital.findOne({ 'facilityInfo.licenseNumber': licenseNumber })
    if (existingLicense) {
      return NextResponse.json(
        { error: 'License number already registered' },
        { status: 409 }
      )
    }
    
    // Generate unique Hospital ID
    let hospitalId: string
    let isUnique = false
    
    while (!isUnique) {
      hospitalId = generateHospitalId()
      const existing = await Hospital.findOne({ hospitalId })
      if (!existing) {
        isUnique = true
      }
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password)
    
    // Create new hospital
    const newHospital = new Hospital({
      hospitalId: hospitalId!,
      facilityInfo: {
        name: facilityName,
        type: facilityType,
        address,
        phone,
        email,
        licenseNumber
      },
      adminInfo: {
        firstName: adminFirstName,
        lastName: adminLastName,
        email
      },
      staff: [],
      verified: false, // Will be verified by system admin later
      password: hashedPassword
    })
    
    await newHospital.save()
    
    // Return success response (don't include password)
    const { password: _, ...hospitalData } = newHospital.toObject()
    
    return NextResponse.json(
      { 
        message: 'Hospital registered successfully',
        hospital: {
          hospitalId: hospitalData.hospitalId,
          facilityInfo: hospitalData.facilityInfo,
          adminInfo: hospitalData.adminInfo,
          verified: hospitalData.verified,
          createdAt: hospitalData.createdAt
        }
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Hospital registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
