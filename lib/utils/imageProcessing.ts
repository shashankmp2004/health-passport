import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

// Image optimization configurations
export const imageOptimizationConfig = {
  // Thumbnail settings
  thumbnail: {
    width: 200,
    height: 200,
    quality: 80,
    format: 'webp' as const,
  },
  
  // Preview settings
  preview: {
    width: 800,
    height: 600,
    quality: 85,
    format: 'webp' as const,
  },
  
  // High quality settings
  highQuality: {
    width: 1920,
    height: 1440,
    quality: 90,
    format: 'jpeg' as const,
  },
};

// Medical image processing configurations
export const medicalImageConfig = {
  // X-ray optimization
  xray: {
    width: 2048,
    height: 2048,
    quality: 95,
    format: 'png' as const,
    sharpen: true,
    contrast: 1.2,
  },
  
  // MRI/CT scan optimization
  scan: {
    width: 1024,
    height: 1024,
    quality: 95,
    format: 'png' as const,
    normalize: true,
  },
  
  // Document scan optimization
  document: {
    width: 1650,
    height: 2200,
    quality: 90,
    format: 'jpeg' as const,
    sharpen: true,
    contrast: 1.1,
  },
};

// Optimize image using Sharp
export async function optimizeImage(
  buffer: Buffer,
  config: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    sharpen?: boolean;
    contrast?: number;
    normalize?: boolean;
  }
): Promise<{ buffer: Buffer; metadata: any }> {
  try {
    let pipeline = sharp(buffer);

    // Get original metadata
    const metadata = await pipeline.metadata();

    // Resize if dimensions specified
    if (config.width || config.height) {
      pipeline = pipeline.resize(config.width, config.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Apply image enhancements
    if (config.normalize) {
      pipeline = pipeline.normalize();
    }

    if (config.contrast && config.contrast !== 1) {
      pipeline = pipeline.linear(config.contrast, -(128 * config.contrast) + 128);
    }

    if (config.sharpen) {
      pipeline = pipeline.sharpen();
    }

    // Convert format and set quality
    switch (config.format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality: config.quality || 85 });
        break;
      case 'png':
        pipeline = pipeline.png({ quality: config.quality || 90 });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality: config.quality || 80 });
        break;
      default:
        pipeline = pipeline.jpeg({ quality: config.quality || 85 });
    }

    const optimizedBuffer = await pipeline.toBuffer();

    return {
      buffer: optimizedBuffer,
      metadata: {
        ...metadata,
        optimized: true,
        originalSize: buffer.length,
        optimizedSize: optimizedBuffer.length,
        compressionRatio: Math.round((1 - optimizedBuffer.length / buffer.length) * 100),
      },
    };
  } catch (error) {
    console.error('Image optimization error:', error);
    throw new Error('Failed to optimize image');
  }
}

// Generate multiple image variants
export async function generateImageVariants(
  buffer: Buffer,
  fileType: string
): Promise<{
  thumbnail: { buffer: Buffer; metadata: any };
  preview: { buffer: Buffer; metadata: any };
  original?: { buffer: Buffer; metadata: any };
}> {
  const variants: any = {};

  // Determine if it's a medical image
  const isMedicalImage = fileType.includes('medical') || fileType.includes('xray') || fileType.includes('scan');
  
  // Generate thumbnail
  variants.thumbnail = await optimizeImage(buffer, imageOptimizationConfig.thumbnail);
  
  // Generate preview
  if (isMedicalImage) {
    variants.preview = await optimizeImage(buffer, medicalImageConfig.document);
  } else {
    variants.preview = await optimizeImage(buffer, imageOptimizationConfig.preview);
  }

  // Keep original for medical images
  if (isMedicalImage) {
    variants.original = {
      buffer,
      metadata: await sharp(buffer).metadata(),
    };
  }

  return variants;
}

// Upload image variants to Cloudinary
export async function uploadImageVariants(
  variants: any,
  baseFileName: string,
  folder: string
): Promise<{
  thumbnail: any;
  preview: any;
  original?: any;
}> {
  const results: any = {};

  try {
    // Upload thumbnail
    const thumbnailResult = await cloudinary.uploader.upload(
      `data:image/webp;base64,${variants.thumbnail.buffer.toString('base64')}`,
      {
        folder: `${folder}/thumbnails`,
        public_id: `${baseFileName}_thumb`,
        format: 'webp',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      }
    );
    results.thumbnail = thumbnailResult;

    // Upload preview
    const previewResult = await cloudinary.uploader.upload(
      `data:image/webp;base64,${variants.preview.buffer.toString('base64')}`,
      {
        folder: `${folder}/previews`,
        public_id: `${baseFileName}_preview`,
        format: 'webp',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      }
    );
    results.preview = previewResult;

    // Upload original if exists
    if (variants.original) {
      const originalResult = await cloudinary.uploader.upload(
        `data:image/png;base64,${variants.original.buffer.toString('base64')}`,
        {
          folder: `${folder}/originals`,
          public_id: `${baseFileName}_original`,
          format: 'png',
          transformation: [{ quality: '100' }],
        }
      );
      results.original = originalResult;
    }

    return results;
  } catch (error) {
    console.error('Failed to upload image variants:', error);
    throw new Error('Failed to upload image variants');
  }
}

// Extract text from image using OCR (mock implementation)
export async function extractTextFromImage(buffer: Buffer): Promise<string | null> {
  try {
    // This is a placeholder for OCR functionality
    // In a real implementation, you might use:
    // - Google Cloud Vision API
    // - Amazon Textract
    // - Azure Computer Vision
    // - Tesseract.js for client-side OCR
    
    console.log('OCR extraction would happen here');
    return null;
  } catch (error) {
    console.error('Text extraction error:', error);
    return null;
  }
}

// Analyze image for medical content (mock implementation)
export async function analyzeMedicalImage(buffer: Buffer): Promise<{
  confidence: number;
  findings: string[];
  bodyPart?: string;
  modality?: string;
}> {
  try {
    // This is a placeholder for AI medical image analysis
    // In a real implementation, you might use:
    // - Google Cloud Healthcare API
    // - AWS HealthLake
    // - Custom ML models
    // - Third-party medical AI services
    
    const metadata = await sharp(buffer).metadata();
    
    // Mock analysis based on image characteristics
    const mockFindings = [];
    if (metadata.width && metadata.height) {
      if (metadata.width > 1500 && metadata.height > 1500) {
        mockFindings.push('High resolution medical image detected');
      }
    }

    return {
      confidence: 0.8,
      findings: mockFindings,
      bodyPart: 'unknown',
      modality: 'unknown',
    };
  } catch (error) {
    console.error('Medical image analysis error:', error);
    return {
      confidence: 0,
      findings: ['Analysis failed'],
    };
  }
}

// Create secure transformation URLs
export function createSecureImageUrl(
  cloudinaryId: string,
  transformation?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    crop?: string;
    watermark?: boolean;
  }
): string {
  let transformationString = '';
  
  if (transformation) {
    const params = [];
    
    if (transformation.width) params.push(`w_${transformation.width}`);
    if (transformation.height) params.push(`h_${transformation.height}`);
    if (transformation.quality) params.push(`q_${transformation.quality}`);
    if (transformation.format) params.push(`f_${transformation.format}`);
    if (transformation.crop) params.push(`c_${transformation.crop}`);
    
    // Add watermark for sensitive medical images
    if (transformation.watermark) {
      params.push('l_text:Arial_20:CONFIDENTIAL,co_rgb:ffffff,o_30');
    }
    
    if (params.length > 0) {
      transformationString = `/${params.join(',')}`;
    }
  }

  return cloudinary.url(cloudinaryId, {
    secure: true,
    transformation: transformationString,
  });
}

// Generate signed URLs for secure access
export function generateSignedImageUrl(
  cloudinaryId: string,
  expiresIn: number = 3600, // 1 hour default
): string {
  const timestamp = Math.round(Date.now() / 1000) + expiresIn;
  
  return cloudinary.utils.private_download_url(cloudinaryId, 'jpg', {
    resource_type: 'image',
    expires_at: timestamp,
  });
}
