import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Hospital from '@/lib/models/Hospital';
import Patient from '@/lib/models/Patient';
import Doctor from '@/lib/models/Doctor';

// GET - Get system health status for hospital
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'hospital') {
      return NextResponse.json(
        { error: 'Unauthorized - Hospital access required' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get hospital data
    const hospital = await Hospital.findById(session.user.id);
    if (!hospital) {
      return NextResponse.json(
        { error: 'Hospital not found' },
        { status: 404 }
      );
    }

    // Start health checks
    const healthChecks: any = {};
    const startTime = Date.now();

    try {
      // Database connectivity check
      const dbStart = Date.now();
      await Patient.countDocuments({ 'visits.hospitalId': session.user.id });
      healthChecks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStart,
        lastChecked: new Date(),
      };
    } catch (error) {
      healthChecks.database = {
        status: 'unhealthy',
        error: 'Database connection failed',
        lastChecked: new Date(),
      };
    }

    try {
      // Staff system check
      const staffStart = Date.now();
      const affiliatedDoctors = await Doctor.countDocuments({
        hospitalAffiliation: hospital.facilityName
      });
      
      healthChecks.staffSystem = {
        status: 'healthy',
        responseTime: Date.now() - staffStart,
        totalStaff: affiliatedDoctors,
        lastChecked: new Date(),
      };
    } catch (error) {
      healthChecks.staffSystem = {
        status: 'unhealthy',
        error: 'Staff system error',
        lastChecked: new Date(),
      };
    }

    try {
      // Patient records system check
      const patientsStart = Date.now();
      const totalPatients = await Patient.countDocuments({
        'visits.hospitalId': session.user.id
      });
      
      healthChecks.patientRecords = {
        status: 'healthy',
        responseTime: Date.now() - patientsStart,
        totalRecords: totalPatients,
        lastChecked: new Date(),
      };
    } catch (error) {
      healthChecks.patientRecords = {
        status: 'unhealthy',
        error: 'Patient records system error',
        lastChecked: new Date(),
      };
    }

    // API performance check
    const apiResponseTime = Date.now() - startTime;
    healthChecks.apiPerformance = {
      status: apiResponseTime < 1000 ? 'healthy' : apiResponseTime < 3000 ? 'degraded' : 'unhealthy',
      responseTime: apiResponseTime,
      lastChecked: new Date(),
    };

    // Document storage check (Cloudinary - mock for now)
    healthChecks.documentStorage = {
      status: 'healthy', // Mock status
      responseTime: 150, // Mock response time
      lastChecked: new Date(),
      note: 'Cloudinary integration pending - Phase 4',
    };

    // Calculate overall system status
    const allChecks = Object.values(healthChecks);
    const unhealthyCount = allChecks.filter((check: any) => check.status === 'unhealthy').length;
    const degradedCount = allChecks.filter((check: any) => check.status === 'degraded').length;
    
    let overallStatus = 'healthy';
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    }

    // Get system metrics
    const systemMetrics = await getSystemMetrics(session.user.id, hospital.facilityName);

    // Get recent alerts (mock data)
    const recentAlerts: any[] = [
      // TODO: Implement real alerting system
    ];

    return NextResponse.json({
      success: true,
      data: {
        overall: {
          status: overallStatus,
          lastChecked: new Date(),
          uptime: '99.9%', // Mock uptime
          version: '1.0.0',
        },
        components: healthChecks,
        metrics: systemMetrics,
        alerts: recentAlerts,
        recommendations: generateRecommendations(healthChecks, systemMetrics),
      },
    });

  } catch (error) {
    console.error('System health check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get system metrics
async function getSystemMetrics(hospitalId: string, facilityName: string) {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get patient metrics
    const patientsWithVisits = await Patient.find({
      'visits.hospitalId': hospitalId
    }).select('visits');

    let visitsLast24h = 0;
    let visitsLast7d = 0;

    patientsWithVisits.forEach(patient => {
      patient.visits?.forEach((visit: any) => {
        if (visit.hospitalId.toString() === hospitalId) {
          const visitDate = new Date(visit.date);
          if (visitDate >= last24Hours) visitsLast24h++;
          if (visitDate >= last7Days) visitsLast7d++;
        }
      });
    });

    // Get staff metrics
    const totalStaff = await Doctor.countDocuments({
      hospitalAffiliation: facilityName
    });

    const activeStaff = await Doctor.countDocuments({
      hospitalAffiliation: facilityName,
      isVerified: true
    });

    return {
      patients: {
        total: patientsWithVisits.length,
        visitsLast24h,
        visitsLast7d,
        averageVisitsPerDay: Math.round(visitsLast7d / 7),
      },
      staff: {
        total: totalStaff,
        active: activeStaff,
        utilizationRate: totalStaff > 0 ? Math.round((activeStaff / totalStaff) * 100) : 0,
      },
      performance: {
        avgResponseTime: 250, // Mock data
        successRate: 99.5, // Mock data
        errorRate: 0.5, // Mock data
      },
    };
  } catch (error) {
    console.error('Error getting system metrics:', error);
    return {
      patients: { total: 0, visitsLast24h: 0, visitsLast7d: 0, averageVisitsPerDay: 0 },
      staff: { total: 0, active: 0, utilizationRate: 0 },
      performance: { avgResponseTime: 0, successRate: 0, errorRate: 0 },
    };
  }
}

// Helper function to generate recommendations
function generateRecommendations(healthChecks: any, metrics: any) {
  const recommendations = [];

  // Database performance recommendation
  if (healthChecks.database.responseTime > 500) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      message: 'Database response time is elevated. Consider optimizing queries or upgrading database resources.',
    });
  }

  // Staff utilization recommendation
  if (metrics.staff.utilizationRate < 60) {
    recommendations.push({
      type: 'staff',
      priority: 'low',
      message: 'Staff utilization is low. Consider reviewing staff schedules or verification processes.',
    });
  }

  // Patient load recommendation
  if (metrics.patients.visitsLast24h > 100) {
    recommendations.push({
      type: 'capacity',
      priority: 'high',
      message: 'High patient volume detected. Consider increasing staff or optimizing patient flow.',
    });
  }

  // System health recommendation
  const unhealthyComponents = Object.entries(healthChecks).filter(
    ([, check]: [string, any]) => check.status === 'unhealthy'
  );

  if (unhealthyComponents.length > 0) {
    recommendations.push({
      type: 'system',
      priority: 'high',
      message: `${unhealthyComponents.length} system component(s) are unhealthy. Immediate attention required.`,
    });
  }

  return recommendations;
}
