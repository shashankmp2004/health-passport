import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload options for different document types
export const uploadOptions = {
  // Medical documents (PDFs, images)
  medical: {
    folder: 'health-passport/medical',
    resource_type: 'auto' as const,
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'],
    max_file_size: 10 * 1024 * 1024, // 10MB
    transformation: [
      { quality: 'auto', fetch_format: 'auto' }
    ],
  },
  
  // Lab reports
  labReports: {
    folder: 'health-passport/lab-reports',
    resource_type: 'auto' as const,
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
    max_file_size: 15 * 1024 * 1024, // 15MB
    transformation: [
      { quality: 'auto', fetch_format: 'auto' }
    ],
  },
  
  // Prescriptions
  prescriptions: {
    folder: 'health-passport/prescriptions',
    resource_type: 'auto' as const,
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
    max_file_size: 5 * 1024 * 1024, // 5MB
    transformation: [
      { quality: 'auto', fetch_format: 'auto' }
    ],
  },
  
  // Medical scans (X-rays, MRIs, etc.)
  medicalScans: {
    folder: 'health-passport/scans',
    resource_type: 'auto' as const,
    allowed_formats: ['dcm', 'jpg', 'jpeg', 'png', 'tiff', 'pdf'],
    max_file_size: 50 * 1024 * 1024, // 50MB for large scan files
    transformation: [
      { quality: 'auto', fetch_format: 'auto' }
    ],
  },
  
  // Profile pictures
  profiles: {
    folder: 'health-passport/profiles',
    resource_type: 'image' as const,
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    max_file_size: 2 * 1024 * 1024, // 2MB
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }
    ],
  },
  
  // Insurance and ID documents
  documents: {
    folder: 'health-passport/documents',
    resource_type: 'auto' as const,
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
    max_file_size: 10 * 1024 * 1024, // 10MB
    transformation: [
      { quality: 'auto', fetch_format: 'auto' }
    ],
  },
};

// File type to upload option mapping
export const getUploadOptions = (fileType: string) => {
  switch (fileType) {
    case 'lab-report':
      return uploadOptions.labReports;
    case 'prescription':
      return uploadOptions.prescriptions;
    case 'medical-scan':
      return uploadOptions.medicalScans;
    case 'profile-picture':
      return uploadOptions.profiles;
    case 'insurance':
    case 'identification':
      return uploadOptions.documents;
    default:
      return uploadOptions.medical;
  }
};

// Generate secure signed upload URL
export const generateSignedUploadUrl = async (
  fileType: string,
  userId: string,
  userRole: 'patient' | 'doctor' | 'hospital'
) => {
  const options = getUploadOptions(fileType);
  
  const uploadParams = {
    ...options,
    folder: `${options.folder}/${userRole}s/${userId}`,
    public_id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    timestamp: Math.round(new Date().getTime() / 1000),
    eager: options.transformation,
    notification_url: `${process.env.NEXTAUTH_URL}/api/upload/webhook`,
  };

  const signature = cloudinary.utils.api_sign_request(uploadParams, process.env.CLOUDINARY_API_SECRET!);

  return {
    url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
    params: {
      ...uploadParams,
      signature,
      api_key: process.env.CLOUDINARY_API_KEY,
    },
  };
};

// Upload file directly (server-side)
export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
  fileType: string,
  userId: string,
  userRole: 'patient' | 'doctor' | 'hospital'
) => {
  const options = getUploadOptions(fileType);
  
  const uploadParams = {
    ...options,
    folder: `${options.folder}/${userRole}s/${userId}`,
    public_id: `${Date.now()}-${fileName.split('.')[0]}`,
    resource_type: options.resource_type,
    eager: options.transformation,
  };

  try {
    const result = await cloudinary.uploader.upload(
      `data:${getMimeType(fileName)};base64,${fileBuffer.toString('base64')}`,
      uploadParams
    );

    return {
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        eager: result.eager,
      },
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: 'File upload failed',
    };
  }
};

// Delete file from Cloudinary
export const deleteFile = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: 'File deletion failed',
    };
  }
};

// Generate secure URL with expiration
export const generateSecureUrl = (
  publicId: string,
  transformation?: any,
  expiresIn: number = 3600 // 1 hour
) => {
  const timestamp = Math.round(new Date().getTime() / 1000) + expiresIn;
  
  return cloudinary.url(publicId, {
    sign_url: true,
    auth_token: {
      duration: expiresIn,
      start_time: Math.round(new Date().getTime() / 1000),
    },
    transformation: transformation || [],
  });
};

// Helper function to get MIME type from file extension
function getMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'tiff': 'image/tiff',
    'dcm': 'application/dicom',
  };
  
  return mimeTypes[extension || ''] || 'application/octet-stream';
}

export default cloudinary;
