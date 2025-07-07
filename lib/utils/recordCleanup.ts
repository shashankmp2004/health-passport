import HospitalPatientRecord from '@/lib/models/HospitalPatientRecord';
import dbConnect from '@/lib/db/mongodb';

import HospitalPatientRecord from '@/lib/models/HospitalPatientRecord';
import dbConnect from '@/lib/db/mongodb';

/**
 * DEPRECATED: Cleanup function for expired hospital patient records
 * 24-hour access limit has been removed, so this function is now a no-op
 */
export async function cleanupExpiredRecords() {
  console.log('Record cleanup disabled - 24-hour limit removed');
  return {
    success: true,
    recordsExpired: 0,
    timestamp: new Date().toISOString()
  };
}

/**
 * DEPRECATED: Get statistics about record expiration
 * 24-hour access limit has been removed, returns all records as active
 */
export async function getExpirationStats() {
  try {
    await dbConnect();
    
    // Since 24-hour limit is removed, all records are considered active
    const totalRecords = await HospitalPatientRecord.countDocuments({});
    const activeRecords = await HospitalPatientRecord.countDocuments({ status: 'active' });
    
    return {
      activeRecords,
      expiredRecords: 0, // No records expire anymore
      totalRecords,
      expirationThreshold: null // No expiration threshold
    };
    
  } catch (error) {
    console.error('Error getting stats:', error);
    throw error;
  }
}
