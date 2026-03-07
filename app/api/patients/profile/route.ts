import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import { getMockPatient, isMockPatientById, updateMockPatient } from '@/lib/utils/mock-data';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'patient') {
      return NextResponse.json(
        { error: 'Unauthorized - Patient access required' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get patient data - check for mock patient first
    let patient;
    if (isMockPatientById(session.user.id)) {
      console.log('Using mock patient data for profile...');
      patient = getMockPatient();
    } else {
      patient = await Patient.findById(session.user.id).select('-password');
    }
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        patient,
      },
    });

  } catch (error) {
    console.error('Patient profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'patient') {
      return NextResponse.json(
        { error: 'Unauthorized - Patient access required' },
        { status: 401 }
      );
    }

    const profileData = await request.json();

    // Connect to database
    await dbConnect();

    // Update patient profile
    const updateData = {
      'personalInfo.firstName': profileData.firstName,
      'personalInfo.lastName': profileData.lastName,
      'personalInfo.email': profileData.email,
      'personalInfo.phone': profileData.phone,
      'personalInfo.dateOfBirth': profileData.dateOfBirth,
      'personalInfo.gender': profileData.gender,
      'personalInfo.address': profileData.address,
      'personalInfo.city': profileData.city,
      'personalInfo.state': profileData.state,
      'personalInfo.zipCode': profileData.zipCode,
      'personalInfo.emergencyContact': profileData.emergencyContact,
      'personalInfo.emergencyPhone': profileData.emergencyPhone,
      'personalInfo.emergencyRelation': profileData.emergencyRelation,
      'personalInfo.bloodType': profileData.bloodType,
      'insurance.provider': profileData.insuranceProvider,
      'insurance.policyNumber': profileData.insuranceId,
      'primaryPhysician.name': profileData.primaryPhysician,
      'primaryPhysician.phone': profileData.physicianPhone,
    };

    const updatedPatient = await Patient.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        patient: updatedPatient,
      },
    });

  } catch (error) {
    console.error('Patient profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
