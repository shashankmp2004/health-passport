import mongoose from 'mongoose';

// File activity types
export enum FileActivityType {
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  VIEW = 'view',
  SHARE = 'share',
  DELETE = 'delete',
  UPDATE = 'update',
  PERMISSION_CHANGE = 'permission_change',
  ACCESS_DENIED = 'access_denied',
}

// Audit log schema
const fileAuditLogSchema = new mongoose.Schema({
  // File information
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  
  // Activity information
  activity: {
    type: String,
    enum: Object.values(FileActivityType),
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  userRole: {
    type: String,
    enum: ['patient', 'doctor', 'hospital'],
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  
  // Request information
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  
  // Context information
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  
  // Security information
  accessGranted: {
    type: Boolean,
    required: true,
    default: true,
  },
  accessReason: {
    type: String,
  },
  securityFlags: [{
    type: String,
    enum: [
      'suspicious_activity',
      'multiple_downloads',
      'unusual_time',
      'unusual_location',
      'failed_authentication',
      'permission_escalation',
    ],
  }],
  
  // Compliance information
  hipaaCompliance: {
    type: Boolean,
    default: true,
  },
  dataClassification: {
    type: String,
    enum: ['public', 'internal', 'confidential', 'restricted'],
    default: 'confidential',
  },
  
}, {
  timestamps: true,
  collection: 'file_audit_logs',
});

// Indexes for efficient querying
fileAuditLogSchema.index({ fileId: 1, createdAt: -1 });
fileAuditLogSchema.index({ userId: 1, createdAt: -1 });
fileAuditLogSchema.index({ activity: 1, createdAt: -1 });
fileAuditLogSchema.index({ patientId: 1, createdAt: -1 });
fileAuditLogSchema.index({ accessGranted: 1, createdAt: -1 });
fileAuditLogSchema.index({ securityFlags: 1, createdAt: -1 });

// TTL index to automatically delete old logs (optional - keep for 7 years for compliance)
fileAuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 365 * 24 * 60 * 60 }); // 7 years

const FileAuditLog = mongoose.models.FileAuditLog || mongoose.model('FileAuditLog', fileAuditLogSchema);

// Audit logging utility functions
export class FileAuditLogger {
  
  // Log file activity
  static async logActivity({
    fileId,
    fileName,
    fileType,
    activity,
    description,
    userId,
    userRole,
    userName,
    ipAddress,
    userAgent,
    patientId,
    hospitalId,
    doctorId,
    metadata = {},
    accessGranted = true,
    accessReason,
    securityFlags = [],
    hipaaCompliance = true,
    dataClassification = 'confidential',
  }: {
    fileId: string;
    fileName: string;
    fileType: string;
    activity: FileActivityType;
    description: string;
    userId: string;
    userRole: 'patient' | 'doctor' | 'hospital';
    userName: string;
    ipAddress: string;
    userAgent: string;
    patientId?: string;
    hospitalId?: string;
    doctorId?: string;
    metadata?: any;
    accessGranted?: boolean;
    accessReason?: string;
    securityFlags?: string[];
    hipaaCompliance?: boolean;
    dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
  }) {
    try {
      const auditLog = new FileAuditLog({
        fileId,
        fileName,
        fileType,
        activity,
        description,
        userId,
        userRole,
        userName,
        ipAddress,
        userAgent,
        patientId,
        hospitalId,
        doctorId,
        metadata,
        accessGranted,
        accessReason,
        securityFlags,
        hipaaCompliance,
        dataClassification,
      });

      await auditLog.save();
      
      // Check for suspicious activities
      await this.checkSuspiciousActivity(userId, activity, ipAddress);
      
      return auditLog;
    } catch (error) {
      console.error('Failed to log file activity:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  // Check for suspicious activities
  static async checkSuspiciousActivity(
    userId: string,
    activity: FileActivityType,
    ipAddress: string
  ) {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      // Check for multiple downloads in short time
      if (activity === FileActivityType.DOWNLOAD) {
        const recentDownloads = await FileAuditLog.countDocuments({
          userId,
          activity: FileActivityType.DOWNLOAD,
          createdAt: { $gte: oneHourAgo },
        });

        if (recentDownloads > 10) {
          await this.flagSuspiciousActivity(
            userId,
            'multiple_downloads',
            `${recentDownloads} downloads in the last hour`
          );
        }
      }

      // Check for unusual time access (outside business hours)
      const hour = now.getHours();
      if (hour < 6 || hour > 22) {
        await this.flagSuspiciousActivity(
          userId,
          'unusual_time',
          `Access at ${hour}:${now.getMinutes()}`
        );
      }

      // Check for multiple IP addresses
      const recentIPs = await FileAuditLog.distinct('ipAddress', {
        userId,
        createdAt: { $gte: oneHourAgo },
      });

      if (recentIPs.length > 3) {
        await this.flagSuspiciousActivity(
          userId,
          'unusual_location',
          `Access from ${recentIPs.length} different IP addresses`
        );
      }

    } catch (error) {
      console.error('Failed to check suspicious activity:', error);
    }
  }

  // Flag suspicious activity
  static async flagSuspiciousActivity(
    userId: string,
    flagType: string,
    description: string
  ) {
    try {
      // Update recent logs with security flag
      await FileAuditLog.updateMany(
        {
          userId,
          createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
          securityFlags: { $ne: flagType },
        },
        {
          $addToSet: { securityFlags: flagType },
          $set: { 'metadata.securityAlert': description },
        }
      );

      console.warn(`Security flag raised for user ${userId}: ${flagType} - ${description}`);
      
      // In a real system, you might:
      // - Send alert to security team
      // - Temporarily restrict user access
      // - Require additional authentication
      
    } catch (error) {
      console.error('Failed to flag suspicious activity:', error);
    }
  }

  // Get audit logs for a file
  static async getFileAuditLogs(
    fileId: string,
    options: {
      limit?: number;
      skip?: number;
      startDate?: Date;
      endDate?: Date;
      activity?: FileActivityType;
    } = {}
  ) {
    const query: any = { fileId };
    
    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) query.createdAt.$gte = options.startDate;
      if (options.endDate) query.createdAt.$lte = options.endDate;
    }
    
    if (options.activity) {
      query.activity = options.activity;
    }

    return await FileAuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(options.limit || 100)
      .skip(options.skip || 0)
      .lean();
  }

  // Get audit logs for a user
  static async getUserAuditLogs(
    userId: string,
    options: {
      limit?: number;
      skip?: number;
      startDate?: Date;
      endDate?: Date;
      activity?: FileActivityType;
    } = {}
  ) {
    const query: any = { userId };
    
    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) query.createdAt.$gte = options.startDate;
      if (options.endDate) query.createdAt.$lte = options.endDate;
    }
    
    if (options.activity) {
      query.activity = options.activity;
    }

    return await FileAuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(options.limit || 100)
      .skip(options.skip || 0)
      .lean();
  }

  // Get suspicious activities
  static async getSuspiciousActivities(options: {
    limit?: number;
    skip?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}) {
    const query: any = {
      $or: [
        { accessGranted: false },
        { securityFlags: { $exists: true, $ne: [] } },
      ],
    };
    
    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) query.createdAt.$gte = options.startDate;
      if (options.endDate) query.createdAt.$lte = options.endDate;
    }

    return await FileAuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(options.limit || 100)
      .skip(options.skip || 0)
      .lean();
  }

  // Generate compliance report
  static async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            activity: '$activity',
            userRole: '$userRole',
            accessGranted: '$accessGranted',
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          uniqueFiles: { $addToSet: '$fileId' },
        },
      },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: '$count' },
          activityBreakdown: {
            $push: {
              activity: '$_id.activity',
              userRole: '$_id.userRole',
              accessGranted: '$_id.accessGranted',
              count: '$count',
              uniqueUsers: { $size: '$uniqueUsers' },
              uniqueFiles: { $size: '$uniqueFiles' },
            },
          },
        },
      },
    ];

    const result = await FileAuditLog.aggregate(pipeline);
    
    // Get additional metrics
    const totalUsers = await FileAuditLog.distinct('userId', {
      createdAt: { $gte: startDate, $lte: endDate },
    });
    
    const totalFiles = await FileAuditLog.distinct('fileId', {
      createdAt: { $gte: startDate, $lte: endDate },
    });
    
    const securityIncidents = await FileAuditLog.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      $or: [
        { accessGranted: false },
        { securityFlags: { $exists: true, $ne: [] } },
      ],
    });

    return {
      period: { startDate, endDate },
      summary: {
        totalActivities: result[0]?.totalActivities || 0,
        totalUsers: totalUsers.length,
        totalFiles: totalFiles.length,
        securityIncidents,
      },
      breakdown: result[0]?.activityBreakdown || [],
    };
  }
}

export default FileAuditLog;
