import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import Doctor from '@/lib/models/Doctor';
import { medicationSchema } from '@/lib/utils/validation';

// POST - Add prescription for a patient
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Unauthorized - Doctor access required' },
        { status: 401 }
      );
    }

    const patientId = params.id;

    // Parse and validate request body
    const body = await request.json();
    const { medications } = body;

    // Validate that medications array is provided
    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      return NextResponse.json(
        { error: 'At least one medication is required' },
        { status: 400 }
      );
    }

    // Validate each medication
    const validationErrors: any[] = [];
    medications.forEach((med: any, index: number) => {
      const validationResult = medicationSchema.safeParse(med);
      if (!validationResult.success) {
        validationErrors.push({
          medicationIndex: index,
          errors: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Medication validation failed',
          details: validationErrors
        },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Verify doctor exists
    const doctor = await Doctor.findById(session.user.id);
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Get patient data
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Check if doctor has treated this patient (optional security check)
    const hasVisits = patient.visits?.some((visit: any) => 
      visit.doctorId.toString() === session.user.id
    );

    if (!hasVisits) {
      // Allow prescription anyway, but log for audit
      console.log(`Doctor ${session.user.id} prescribing to new patient ${patientId}`);
    }

    // Add medications to patient
    patient.medications = patient.medications || [];
    
    const addedMedications: any[] = [];
    
    medications.forEach((medication: any) => {
      const newMedication = {
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        startDate: new Date(medication.startDate),
        endDate: medication.endDate ? new Date(medication.endDate) : undefined,
        prescribedBy: session.user.id,
        prescribedDate: new Date(),
        instructions: medication.instructions || '',
        refills: medication.refills || 0,
        isActive: true,
      };
      
      patient.medications.push(newMedication);
      
      addedMedications.push({
        id: patient.medications[patient.medications.length - 1]._id,
        name: newMedication.name,
        dosage: newMedication.dosage,
        frequency: newMedication.frequency,
        startDate: newMedication.startDate,
        endDate: newMedication.endDate,
      });
    });

    // Save patient
    await patient.save();

    // Create a visit record for this prescription if no recent visit exists
    const recentVisit = patient.visits?.find((visit: any) => {
      const visitDate = new Date(visit.date);
      const today = new Date();
      const daysDiff = Math.abs(today.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24);
      return visit.doctorId.toString() === session.user.id && daysDiff < 1;
    });

    if (!recentVisit) {
      const prescriptionVisit = {
        hospitalId: null, // TODO: Link to hospital
        doctorId: session.user.id,
        date: new Date(),
        diagnosis: 'Prescription consultation',
        treatment: `Prescribed ${medications.length} medication(s)`,
        notes: `Medications: ${medications.map((m: any) => m.name).join(', ')}`,
        status: 'completed',
        visitType: 'prescription',
      };
      
      patient.visits = patient.visits || [];
      patient.visits.push(prescriptionVisit);
      await patient.save();
    }

    return NextResponse.json({
      success: true,
      message: `${medications.length} medication(s) prescribed successfully`,
      data: {
        prescriptions: addedMedications,
        patient: {
          id: patient._id,
          name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
          healthPassportId: patient.healthPassportId,
        },
        doctor: {
          id: doctor._id,
          name: `${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`,
          specialty: doctor.specialty,
          licenseNumber: doctor.licenseNumber,
        },
        prescriptionDate: new Date(),
      },
    });

  } catch (error) {
    console.error('Prescription creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
