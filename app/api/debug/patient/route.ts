import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import HospitalPatientRecord from '@/lib/models/HospitalPatientRecord';
import PatientNotification from '@/lib/models/PatientNotification';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId') || 'HP-RT4W5-1IXYS';

    await dbConnect();

    console.log(`\n=== DEBUG PATIENT ${patientId} ===`);

    // 1. Check if patient exists
    const patient = await Patient.findOne({ healthPassportId: patientId }).lean();
    console.log('1. Patient exists:', !!patient);
    if (patient) {
      console.log('   Patient details:', {
        id: patient._id,
        healthPassportId: patient.healthPassportId,
        name: `${patient.personalInfo?.firstName} ${patient.personalInfo?.lastName}`,
        email: patient.personalInfo?.email
      });
    }

    // 2. Check notifications for this patient
    const notifications = await PatientNotification.find({ 
      patientId: patientId 
    }).sort({ createdAt: -1 }).lean();
    
    console.log('2. Notifications found:', notifications.length);
    notifications.forEach((notif, index) => {
      console.log(`   Notification ${index + 1}:`, {
        id: notif._id,
        type: notif.type,
        status: notif.status,
        hospitalId: notif.hospitalId,
        hospitalName: notif.hospitalName,
        createdAt: notif.createdAt,
        respondedAt: notif.respondedAt
      });
    });

    // 3. Check hospital records for this patient
    const hospitalRecords = await HospitalPatientRecord.find({ 
      healthPassportId: patientId 
    }).sort({ addedDate: -1 }).lean();
    
    console.log('3. Hospital records found:', hospitalRecords.length);
    hospitalRecords.forEach((record, index) => {
      const hoursAgo = Math.round((new Date().getTime() - new Date(record.addedDate).getTime()) / (1000 * 60 * 60));
      console.log(`   Hospital record ${index + 1}:`, {
        id: record._id,
        hospitalId: record.hospitalId,
        hospitalName: record.hospitalName,
        status: record.status,
        addedDate: record.addedDate,
        hoursAgo: hoursAgo,
        within24Hours: hoursAgo <= 24
      });
    });

    // 4. Check what the hospital patient records API would return
    if (session.user.role === 'hospital') {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const activeRecordsForHospital = await HospitalPatientRecord.find({
        hospitalId: session.user.id,
        status: 'active'
      }).lean();
      
      const recentRecordsForHospital = activeRecordsForHospital.filter(record => 
        new Date(record.addedDate) >= twentyFourHoursAgo
      );
      
      console.log('4. For current hospital user:');
      console.log(`   Active records: ${activeRecordsForHospital.length}`);
      console.log(`   Within 24h: ${recentRecordsForHospital.length}`);
      
      const thisPatientRecord = activeRecordsForHospital.find(r => r.healthPassportId === patientId);
      if (thisPatientRecord) {
        const hoursAgo = Math.round((new Date().getTime() - new Date(thisPatientRecord.addedDate).getTime()) / (1000 * 60 * 60));
        console.log(`   This patient record: Found! Added ${hoursAgo} hours ago, within 24h: ${hoursAgo <= 24}`);
      } else {
        console.log(`   This patient record: NOT FOUND for hospital ${session.user.id}`);
      }
    }

    // 5. Check approved notifications that should have created records
    const approvedNotifications = notifications.filter(n => n.status === 'approved');
    console.log('5. Approved notifications:', approvedNotifications.length);
    
    for (const notif of approvedNotifications) {
      const correspondingRecord = hospitalRecords.find(r => 
        r.hospitalId === notif.hospitalId && 
        r.status === 'active'
      );
      console.log(`   Approved notif -> hospital record exists: ${!!correspondingRecord}`);
      if (!correspondingRecord) {
        console.log(`   ⚠️  MISSING: Approved notification ${notif._id} for hospital ${notif.hospitalId} has no corresponding active hospital record!`);
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        patientId,
        currentUser: {
          id: session.user.id,
          role: session.user.role
        },
        patient: !!patient,
        notifications: notifications.length,
        hospitalRecords: hospitalRecords.length,
        approvedNotifications: approvedNotifications.length,
        details: {
          patient: patient ? {
            id: patient._id,
            healthPassportId: patient.healthPassportId,
            name: `${patient.personalInfo?.firstName} ${patient.personalInfo?.lastName}`
          } : null,
          notifications: notifications.map(n => ({
            id: n._id,
            type: n.type,
            status: n.status,
            hospitalId: n.hospitalId,
            hospitalName: n.hospitalName,
            createdAt: n.createdAt,
            respondedAt: n.respondedAt
          })),
          hospitalRecords: hospitalRecords.map(r => ({
            id: r._id,
            hospitalId: r.hospitalId,
            hospitalName: r.hospitalName,
            status: r.status,
            addedDate: r.addedDate,
            hoursAgo: Math.round((new Date().getTime() - new Date(r.addedDate).getTime()) / (1000 * 60 * 60))
          }))
        }
      }
    });

  } catch (error) {
    console.error('Debug patient error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
