import mongoose from 'mongoose';

const PatientNotificationSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['access_request', 'access_granted', 'access_denied', 'access_expired'],
    default: 'access_request'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied', 'expired'],
    default: 'pending'
  },
  message: {
    type: String,
    required: true
  },
  requestedBy: {
    name: String,
    email: String,
    role: String
  },
  respondedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from creation
  },
  metadata: {
    patientName: String,
    requestReason: String,
    accessDuration: {
      type: Number,
      default: 24 // hours
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
PatientNotificationSchema.index({ patientId: 1, status: 1 });
PatientNotificationSchema.index({ hospitalId: 1, status: 1 });
PatientNotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PatientNotification || mongoose.model('PatientNotification', PatientNotificationSchema);
