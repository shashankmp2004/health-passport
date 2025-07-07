import { z } from 'zod';

// File validation schemas
export const fileValidationSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().min(1, 'File size must be greater than 0'),
  type: z.string().min(1, 'File type is required'),
});

// Document type validation
export const documentTypeSchema = z.enum([
  'lab-report',
  'prescription',
  'medical-scan',
  'insurance',
  'identification',
  'medical-certificate',
  'discharge-summary',
  'vaccination-record',
  'allergy-record',
  'profile-picture',
  'other'
]);

// File upload validation
export const fileUploadSchema = z.object({
  file: fileValidationSchema,
  documentType: documentTypeSchema,
  category: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
});

// Allowed file types for each document category
export const allowedFileTypes = {
  'lab-report': ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'],
  'prescription': ['application/pdf', 'image/jpeg', 'image/png'],
  'medical-scan': ['image/jpeg', 'image/png', 'image/tiff', 'application/pdf', 'application/dicom'],
  'insurance': ['application/pdf', 'image/jpeg', 'image/png'],
  'identification': ['application/pdf', 'image/jpeg', 'image/png'],
  'medical-certificate': ['application/pdf', 'image/jpeg', 'image/png'],
  'discharge-summary': ['application/pdf'],
  'vaccination-record': ['application/pdf', 'image/jpeg', 'image/png'],
  'allergy-record': ['application/pdf', 'image/jpeg', 'image/png'],
  'profile-picture': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  'other': ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'],
};

// File size limits (in bytes)
export const fileSizeLimits = {
  'lab-report': 15 * 1024 * 1024, // 15MB
  'prescription': 5 * 1024 * 1024, // 5MB
  'medical-scan': 50 * 1024 * 1024, // 50MB
  'insurance': 10 * 1024 * 1024, // 10MB
  'identification': 10 * 1024 * 1024, // 10MB
  'medical-certificate': 5 * 1024 * 1024, // 5MB
  'discharge-summary': 10 * 1024 * 1024, // 10MB
  'vaccination-record': 5 * 1024 * 1024, // 5MB
  'allergy-record': 5 * 1024 * 1024, // 5MB
  'profile-picture': 2 * 1024 * 1024, // 2MB
  'other': 10 * 1024 * 1024, // 10MB
};

// Validate file type and size
export const validateFile = (
  file: { name: string; size: number; type: string },
  documentType: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if document type is supported
  if (!allowedFileTypes[documentType as keyof typeof allowedFileTypes]) {
    errors.push(`Document type "${documentType}" is not supported`);
    return { isValid: false, errors };
  }

  const allowedTypes = allowedFileTypes[documentType as keyof typeof allowedFileTypes];
  const maxSize = fileSizeLimits[documentType as keyof typeof fileSizeLimits];

  // Validate file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not allowed for ${documentType}. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Validate file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    errors.push(`File size exceeds the limit of ${maxSizeMB}MB for ${documentType}`);
  }

  // Validate file name
  if (!file.name || file.name.trim().length === 0) {
    errors.push('File name is required');
  }

  // Check for potentially dangerous file extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (dangerousExtensions.includes(fileExtension)) {
    errors.push(`File extension "${fileExtension}" is not allowed for security reasons`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize file name
export const sanitizeFileName = (fileName: string): string => {
  // Remove special characters and replace spaces with underscores
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
};

// Extract file metadata
export const extractFileMetadata = (file: File | { name: string; size: number; type: string }) => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const nameWithoutExtension = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  
  return {
    originalName: file.name,
    sanitizedName: sanitizeFileName(file.name),
    nameWithoutExtension,
    extension,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    type: file.type,
    category: categorizeFile(file.type, extension),
  };
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Categorize file based on type and extension
const categorizeFile = (mimeType: string, extension: string): string => {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType === 'application/pdf') {
    return 'pdf';
  } else if (mimeType === 'application/dicom' || extension === 'dcm') {
    return 'dicom';
  } else if (mimeType.startsWith('text/')) {
    return 'text';
  } else {
    return 'document';
  }
};

// Generate unique filename
export const generateUniqueFileName = (originalName: string, userId: string): string => {
  const sanitized = sanitizeFileName(originalName);
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = sanitized.split('.').pop();
  const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.')) || sanitized;
  
  return `${userId}_${timestamp}_${randomString}_${nameWithoutExt}.${extension}`;
};

// Virus scanning simulation (placeholder for real implementation)
export const scanForVirus = async (fileBuffer: Buffer): Promise<{ isClean: boolean; threats?: string[] }> => {
  // TODO: Integrate with a real virus scanning service like ClamAV or VirusTotal
  // For now, return a simple check based on file content patterns
  
  const fileContent = fileBuffer.toString('hex');
  
  // Simple check for suspicious patterns (this is just a demo)
  const suspiciousPatterns = [
    '4d5a', // MZ header (executable)
    '7f454c46', // ELF header (Linux executable)
  ];
  
  const threats: string[] = [];
  
  for (const pattern of suspiciousPatterns) {
    if (fileContent.toLowerCase().includes(pattern)) {
      threats.push(`Suspicious pattern detected: ${pattern}`);
    }
  }
  
  return {
    isClean: threats.length === 0,
    threats: threats.length > 0 ? threats : undefined,
  };
};

// Image processing validation
export const validateImageFile = (file: { name: string; size: number; type: string }): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!file.type.startsWith('image/')) {
    errors.push('File must be an image');
  }
  
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedImageTypes.includes(file.type)) {
    errors.push(`Image type "${file.type}" is not supported. Allowed types: ${allowedImageTypes.join(', ')}`);
  }
  
  // Additional image-specific validations can be added here
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// PDF validation
export const validatePdfFile = (file: { name: string; size: number; type: string }): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (file.type !== 'application/pdf') {
    errors.push('File must be a PDF');
  }
  
  // Additional PDF-specific validations can be added here
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
