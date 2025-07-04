import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import { FileAuditLogger, FileActivityType } from '@/lib/models/FileAuditLog';

// GET - Retrieve audit logs
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Only hospitals and admins can access audit logs
    if (session.user.role !== 'hospital') {
      return NextResponse.json(
        { error: 'Forbidden - Hospital admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all, file, user, suspicious
    const fileId = searchParams.get('fileId');
    const userId = searchParams.get('userId');
    const activity = searchParams.get('activity') as FileActivityType;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Connect to database
    await dbConnect();

    let logs: any[] = [];
    let total = 0;

    const options = {
      limit,
      skip,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      activity,
    };

    switch (type) {
      case 'file':
        if (!fileId) {
          return NextResponse.json(
            { error: 'File ID required for file audit logs' },
            { status: 400 }
          );
        }
        logs = await FileAuditLogger.getFileAuditLogs(fileId, options);
        break;

      case 'user':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID required for user audit logs' },
            { status: 400 }
          );
        }
        logs = await FileAuditLogger.getUserAuditLogs(userId, options);
        break;

      case 'suspicious':
        logs = await FileAuditLogger.getSuspiciousActivities(options);
        break;

      case 'all':
      default:
        // Get all logs with pagination
        const FileAuditLog = (await import('@/lib/models/FileAuditLog')).default;
        const query: any = {};
        
        if (options.startDate || options.endDate) {
          query.createdAt = {};
          if (options.startDate) query.createdAt.$gte = options.startDate;
          if (options.endDate) query.createdAt.$lte = options.endDate;
        }
        
        if (options.activity) {
          query.activity = options.activity;
        }

        logs = await FileAuditLog.find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip)
          .lean();

        total = await FileAuditLog.countDocuments(query);
        break;
    }

    // Format response
    const response = {
      success: true,
      data: {
        logs: logs.map(log => ({
          id: log._id,
          fileId: log.fileId,
          fileName: log.fileName,
          fileType: log.fileType,
          activity: log.activity,
          description: log.description,
          user: {
            id: log.userId,
            name: log.userName,
            role: log.userRole,
          },
          request: {
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
          },
          context: {
            patientId: log.patientId,
            hospitalId: log.hospitalId,
            doctorId: log.doctorId,
          },
          security: {
            accessGranted: log.accessGranted,
            accessReason: log.accessReason,
            securityFlags: log.securityFlags || [],
            hipaaCompliance: log.hipaaCompliance,
            dataClassification: log.dataClassification,
          },
          metadata: log.metadata || {},
          timestamp: log.createdAt,
        })),
        pagination: {
          total: type === 'all' ? total : logs.length,
          limit,
          skip,
          hasMore: logs.length === limit,
        },
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Audit logs retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Generate compliance report
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Only hospitals and admins can generate reports
    if (session.user.role !== 'hospital') {
      return NextResponse.json(
        { error: 'Forbidden - Hospital admin access required' },
        { status: 403 }
      );
    }

    const { reportType, startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    const start = new Date(startDate);
    const end = new Date(endDate);

    let report: any;

    switch (reportType) {
      case 'compliance':
        report = await FileAuditLogger.generateComplianceReport(start, end);
        break;

      case 'security':
        const suspiciousLogs = await FileAuditLogger.getSuspiciousActivities({
          startDate: start,
          endDate: end,
          limit: 1000,
        });

        report = {
          period: { startDate: start, endDate: end },
          summary: {
            totalSecurityIncidents: suspiciousLogs.length,
            suspiciousActivities: suspiciousLogs.reduce((acc: any, log: any) => {
              (log.securityFlags || []).forEach((flag: string) => {
                acc[flag] = (acc[flag] || 0) + 1;
              });
              return acc;
            }, {}),
          },
          incidents: suspiciousLogs.slice(0, 50), // Top 50 incidents
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        report,
        generatedAt: new Date(),
        generatedBy: {
          id: session.user.id,
          name: session.user.name || session.user.email,
          role: session.user.role,
        },
      },
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
