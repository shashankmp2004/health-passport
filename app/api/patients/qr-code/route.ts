import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db/mongodb"
import Patient from "@/lib/models/Patient"
import { generatePatientQRCode } from "@/lib/utils/qrcode"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'patient') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    await dbConnect()

    // Get patient data
    const patient = await Patient.findById(session.user.id)
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Generate or regenerate QR code
    try {
      const qrResult = await generatePatientQRCode({
        healthPassportId: patient.healthPassportId,
        firstName: patient.personalInfo.firstName,
        lastName: patient.personalInfo.lastName,
        dateOfBirth: patient.personalInfo.dateOfBirth.toISOString().split('T')[0],
        bloodType: patient.personalInfo.bloodType,
        patientId: patient._id.toString()
      });

      return NextResponse.json({
        success: true,
        qrCode: {
          qrImageUrl: qrResult.qrImageUrl,
          qrId: qrResult.qrData.metadata.qrId,
          generatedAt: qrResult.qrData.metadata.generatedAt,
          encryptedData: qrResult.encryptedData
        },
        patientInfo: {
          healthPassportId: patient.healthPassportId,
          name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
          dateOfBirth: patient.personalInfo.dateOfBirth,
          bloodType: patient.personalInfo.bloodType
        }
      })

    } catch (qrError) {
      console.error('QR code generation error:', qrError)
      return NextResponse.json(
        { error: 'Failed to generate QR code' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('QR code API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'patient') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const { size } = await request.json()
    const qrSize = size && size >= 100 && size <= 1000 ? size : 300

    await dbConnect()

    // Get patient data
    const patient = await Patient.findById(session.user.id)
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Generate QR code with custom size
    try {
      const qrResult = await generatePatientQRCode({
        healthPassportId: patient.healthPassportId,
        firstName: patient.personalInfo.firstName,
        lastName: patient.personalInfo.lastName,
        dateOfBirth: patient.personalInfo.dateOfBirth.toISOString().split('T')[0],
        bloodType: patient.personalInfo.bloodType,
        patientId: patient._id.toString()
      }, qrSize);

      return NextResponse.json({
        success: true,
        qrCode: {
          qrImageUrl: qrResult.qrImageUrl,
          qrId: qrResult.qrData.metadata.qrId,
          size: qrSize,
          generatedAt: qrResult.qrData.metadata.generatedAt,
          encryptedData: qrResult.encryptedData
        }
      })

    } catch (qrError) {
      console.error('QR code generation error:', qrError)
      return NextResponse.json(
        { error: 'Failed to generate QR code' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('QR code API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
