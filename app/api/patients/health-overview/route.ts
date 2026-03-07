import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getMockPatient, isMockPatientById } from '@/lib/utils/mock-data'
import dbConnect from '@/lib/db/mongodb'
import Patient from '@/lib/models/Patient'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'patient') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    // Connect to database and get patient data
    await dbConnect();
    
    let patient;
    if (isMockPatientById(session.user.id)) {
      console.log('Using mock patient data for health overview...');
      patient = getMockPatient();
    } else {
      patient = await Patient.findById(session.user.id).select('vitals medicalHistory');
    }

    // Extract latest vitals from patient data
    const latestVitals = patient?.vitals || [];
    const getLatestVital = (type: string) => {
      const vital = latestVitals
        .filter((v: any) => v.type === type)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      return vital || null;
    };

    const bloodPressureVital = getLatestVital('blood_pressure');
    const heartRateVital = getLatestVital('heart_rate');
    const bloodSugarVital = getLatestVital('blood_sugar');
    const weightVital = getLatestVital('weight');
    const heightVital = getLatestVital('height');

    // Calculate BMI if we have height and weight
    let bmi = null;
    if (weightVital && heightVital) {
      const weightKg = parseFloat(weightVital.value);
      const heightM = parseFloat(heightVital.value) / 100; // assuming height is in cm
      bmi = (weightKg / (heightM * heightM)).toFixed(1);
    }

    // In a real implementation, this would fetch from your database
    // For now, return a structure that matches what the frontend expects
    const healthOverviewData = {
      vitals: {
        bloodSugar: bloodSugarVital ? {
          value: bloodSugarVital.value,
          unit: bloodSugarVital.unit || 'mg/dL',
          recordedAt: bloodSugarVital.date,
          trend: null // TODO: Calculate trend
        } : {
          value: null,
          unit: 'mg/dL',
          recordedAt: null,
          trend: null
        },
        heartRate: heartRateVital ? {
          value: heartRateVital.value,
          unit: heartRateVital.unit || 'bpm',
          recordedAt: heartRateVital.date,
          trend: null // TODO: Calculate trend
        } : {
          value: null,
          unit: 'bpm',
          recordedAt: null,
          trend: null
        },
        bloodPressure: bloodPressureVital ? {
          systolic: bloodPressureVital.value?.split('/')[0] || null,
          diastolic: bloodPressureVital.value?.split('/')[1] || null,
          unit: bloodPressureVital.unit || 'mmHg',
          recordedAt: bloodPressureVital.date,
          trend: null // TODO: Calculate trend
        } : {
          systolic: null,
          diastolic: null,
          unit: 'mmHg',
          recordedAt: null,
          trend: null
        }
      },
      bodyMeasurements: {
        height: heightVital?.value || null,
        weight: weightVital?.value || null,
        chest: null, // TODO: Add chest measurement tracking
        waist: null, // TODO: Add waist measurement tracking
        hip: null,   // TODO: Add hip measurement tracking
        bmi: bmi,
        bodyShape: null, // TODO: Calculate based on measurements
        lastUpdated: weightVital?.date || heightVital?.date || null
      },
      activityData: {
        hasData: false,
        activities: [],
        chartData: null
      }
    }

    // TODO: Replace with actual database queries
    // Example of how real data might look:
    /*
    const vitals = await db.vitals.findMany({
      where: {
        patientId: session.user.id,
        recordedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: { recordedAt: 'desc' }
    })

    const bodyMeasurements = await db.bodyMeasurements.findFirst({
      where: { patientId: session.user.id },
      orderBy: { recordedAt: 'desc' }
    })

    const activities = await db.activities.findMany({
      where: {
        patientId: session.user.id,
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    })
    */

    return NextResponse.json({
      success: true,
      data: healthOverviewData
    })

  } catch (error) {
    console.error('Health overview API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
