import HospitalPatientRecord from '@/lib/models/HospitalPatientRecord';
import dbConnect from '@/lib/db/mongodb';

/**
 * Cleanup function to mark expired hospital patient records as inactive
 * This function should be called periodically (e.g., by a cron job)
 */
export async function cleanupExpiredRecords() {
  try {
    await dbConnect();
    
    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    // Find and update expired records
    const result = await HospitalPatientRecord.updateMany(
      {
        status: 'active',
        addedDate: { $lt: twentyFourHoursAgo }
      },
      {
        $set: {
          status: 'expired',
          lastUpdated: new Date()
        }
      }
    );
    
    console.log(`Cleanup completed: ${result.modifiedCount} records marked as expired`);
    
    return {
      success: true,
      recordsExpired: result.modifiedCount,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get statistics about record expiration
 */
export async function getExpirationStats() {
  try {
    await dbConnect();
    
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const [activeRecords, expiredRecords, totalRecords] = await Promise.all([
      HospitalPatientRecord.countDocuments({
        status: 'active',
        addedDate: { $gte: twentyFourHoursAgo }
      }),
      HospitalPatientRecord.countDocuments({
        status: { $in: ['expired', 'inactive'] }
      }),
      HospitalPatientRecord.countDocuments({})
    ]);
    
    return {
      activeRecords,
      expiredRecords,
      totalRecords,
      expirationThreshold: twentyFourHoursAgo.toISOString()
    };
    
  } catch (error) {
    console.error('Error getting expiration stats:', error);
    throw error;
  }
}
