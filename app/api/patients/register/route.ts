import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Patient from '@/lib/models/Patient'
import { patientRegistrationSchema } from '@/lib/utils/validation'
import { hashPassword, generateHealthPassportId, formatAadharNumber } from '@/lib/utils/helpers'
import { generatePatientQRCode } from '@/lib/utils/qrcode'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    
    // Validate input data
    const validationResult = patientRegistrationSchema.safeParse(body)
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
      dateOfBirth, 
      bloodType, 
      aadharNumber, 
      password 
    } = validationResult.data
    
    // Check if email already exists
    const existingPatient = await Patient.findOne({ 'personalInfo.email': email })
    if (existingPatient) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }
    
    // Check if Aadhar number already exists
    const formattedAadhar = formatAadharNumber(aadharNumber)
    const existingAadhar = await Patient.findOne({ 'personalInfo.aadharNumber': formattedAadhar })
    if (existingAadhar) {
      return NextResponse.json(
        { error: 'Aadhar number already registered' },
        { status: 409 }
      )
    }
    
    // Generate unique Health Passport ID
    let healthPassportId: string
    let isUnique = false
    
    while (!isUnique) {
      healthPassportId = generateHealthPassportId()
      const existing = await Patient.findOne({ healthPassportId })
      if (!existing) {
        isUnique = true
      }
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password)
    
    // Create new patient
    const newPatient = new Patient({
      healthPassportId: healthPassportId!,
      personalInfo: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        bloodType,
        aadharNumber: formattedAadhar, // TODO: Encrypt this in production
        phone,
        email
      },
      medicalHistory: [],
      medications: [],
      vitals: [],
      visits: [],
      documents: [],
      password: hashedPassword
    })
    
    await newPatient.save()

    // Generate QR code for the patient
    let qrCodeData = null;
    try {
      const qrResult = await generatePatientQRCode({
        healthPassportId: healthPassportId!,
        firstName,
        lastName,
        dateOfBirth,
        bloodType,
        patientId: newPatient._id.toString()
      });

      qrCodeData = {
        qrImageUrl: qrResult.qrImageUrl,
        qrId: qrResult.qrData.metadata.qrId
      };

      console.log('QR code generated successfully for patient:', newPatient.healthPassportId);
    } catch (qrError) {
      console.error('QR code generation failed:', qrError);
      // Don't fail the registration if QR generation fails
    }
    
    // Return success response (don't include password)
    const { password: _, ...patientData } = newPatient.toObject()
    
    return NextResponse.json(
      { 
        message: 'Patient registered successfully',
        patient: {
          healthPassportId: patientData.healthPassportId,
          personalInfo: patientData.personalInfo,
          createdAt: patientData.createdAt
        },
        qrCode: qrCodeData
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Patient registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
