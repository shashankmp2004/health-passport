import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import { uploadFile } from '@/lib/cloudinary';
import { validateFile, extractFileMetadata, generateUniqueFileName, scanForVirus } from '@/lib/utils/fileValidation';
import { optimizeImage, generateImageVariants, uploadImageVariants } from '@/lib/utils/imageProcessing';
import { FileAuditLogger, FileActivityType } from '@/lib/models/FileAuditLog';

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

    // Extract client information for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const isPublic = formData.get('isPublic') === 'true';

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!documentType) {
      return NextResponse.json(
        { error: 'Document type is required' },
        { status: 400 }
      );
    }

    // Extract file metadata
    const fileMetadata = extractFileMetadata(file);

    // Validate file
    const validation = validateFile(
      {
        name: file.name,
        size: file.size,
        type: file.type,
      },
      documentType
    );

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'File validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Scan for viruses (basic implementation)
    const scanResult = await scanForVirus(fileBuffer);
    if (!scanResult.isClean) {
      // Log failed upload attempt
      await FileAuditLogger.logActivity({
        fileId: 'temp',
        fileName: file.name,
        fileType: file.type,
        activity: FileActivityType.UPLOAD,
        description: `Upload blocked - virus scan failed: ${scanResult.threats?.join(', ') || 'Unknown threats'}`,
        userId: session.user.id,
        userRole: session.user.role,
        userName: session.user.name || session.user.email || 'Unknown user',
        ipAddress,
        userAgent,
        accessGranted: false,
        accessReason: 'Virus scan failed',
        securityFlags: ['virus_detected'],
      });

      return NextResponse.json(
        {
          error: 'Security scan failed',
          details: scanResult.threats,
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueFileName = generateUniqueFileName(file.name, session.user.id);

    // Process images for optimization
    let uploadResult: any;
    let imageVariants: any = null;

    if (file.type.startsWith('image/')) {
      try {
        // Generate optimized image variants
        imageVariants = await generateImageVariants(fileBuffer, documentType);
        
        // Upload variants to Cloudinary
        const variantResults = await uploadImageVariants(
          imageVariants,
          uniqueFileName.split('.')[0],
          `health-passport/${documentType}`
        );

        uploadResult = {
          success: true,
          data: {
            ...variantResults.preview, // Use preview as main URL
            variants: variantResults,
            public_id: variantResults.preview.public_id,
            secure_url: variantResults.preview.secure_url,
            url: variantResults.preview.url,
            format: variantResults.preview.format,
            resource_type: variantResults.preview.resource_type,
            bytes: variantResults.preview.bytes,
            width: variantResults.preview.width,
            height: variantResults.preview.height,
          }
        };
      } catch (imageError) {
        console.error('Image processing failed, falling back to regular upload:', imageError);
        // Fallback to regular upload
        uploadResult = await uploadFile(
          fileBuffer,
          uniqueFileName,
          documentType,
          session.user.id,
          session.user.role
        );
      }
    } else {
      // Regular file upload for non-images
      uploadResult = await uploadFile(
        fileBuffer,
        uniqueFileName,
        documentType,
        session.user.id,
        session.user.role
      );
    }

    if (!uploadResult.success || !uploadResult.data) {
      // Log failed upload
      await FileAuditLogger.logActivity({
        fileId: 'temp',
        fileName: file.name,
        fileType: file.type,
        activity: FileActivityType.UPLOAD,
        description: `Upload failed: ${uploadResult.error || 'Unknown error'}`,
        userId: session.user.id,
        userRole: session.user.role,
        userName: session.user.name || session.user.email || 'Unknown user',
        ipAddress,
        userAgent,
        accessGranted: false,
        accessReason: 'Upload failed',
      });

      return NextResponse.json(
        { error: uploadResult.error || 'File upload failed' },
        { status: 500 }
      );
    }

    // Connect to database
    await dbConnect();

    // Create document record
    const documentRecord = {
      _id: new Date().getTime().toString(), // Temporary ID for audit logging
      fileName: file.name,
      uniqueFileName,
      fileType: documentType,
      fileSize: file.size,
      mimeType: file.type,
      category: category || 'general',
      description: description || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic: isPublic,
      uploadDate: new Date(),
      uploadedBy: session.user.id,
      cloudinaryData: {
        publicId: uploadResult.data.public_id,
        secureUrl: uploadResult.data.secure_url,
        url: uploadResult.data.url,
        format: uploadResult.data.format,
        resourceType: uploadResult.data.resource_type,
        bytes: uploadResult.data.bytes,
        width: uploadResult.data.width,
        height: uploadResult.data.height,
        variants: uploadResult.data.variants, // Include image variants if available
      },
      metadata: {
        ...fileMetadata,
        imageOptimization: imageVariants ? {
          hasVariants: true,
          thumbnailSize: imageVariants.thumbnail?.metadata?.optimizedSize,
          previewSize: imageVariants.preview?.metadata?.optimizedSize,
          compressionRatio: imageVariants.preview?.metadata?.compressionRatio,
        } : null,
      },
      scanResult: {
        isClean: scanResult.isClean,
        scanDate: new Date(),
      },
    };

    // Add document to user's records based on role
    if (session.user.role === 'patient') {
      const patient = await Patient.findById(session.user.id);
      if (!patient) {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        );
      }

      patient.documents = patient.documents || [];
      patient.documents.push(documentRecord);
      await patient.save();

      // Use the actual document ID from MongoDB
      const savedDocument = patient.documents[patient.documents.length - 1];
      documentRecord._id = savedDocument._id.toString();
    } else {
      // For doctors and hospitals, we might want a separate document collection
      // For now, we'll return success without saving to user profile
    }

    // Log successful upload
    await FileAuditLogger.logActivity({
      fileId: documentRecord._id,
      fileName: file.name,
      fileType: file.type,
      activity: FileActivityType.UPLOAD,
      description: `File uploaded successfully: ${documentType} document`,
      userId: session.user.id,
      userRole: session.user.role,
      userName: session.user.name || session.user.email || 'Unknown user',
      ipAddress,
      userAgent,
      patientId: session.user.role === 'patient' ? session.user.id : undefined,
      metadata: {
        fileSize: file.size,
        category,
        tags: tags?.split(',').map(t => t.trim()),
        hasImageVariants: !!imageVariants,
      },
      accessGranted: true,
    });

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        document: {
          id: documentRecord.cloudinaryData.publicId,
          fileName: documentRecord.fileName,
          fileType: documentRecord.fileType,
          fileSize: documentRecord.fileSize,
          category: documentRecord.category,
          description: documentRecord.description,
          uploadDate: documentRecord.uploadDate,
          url: documentRecord.cloudinaryData.secureUrl,
          metadata: documentRecord.metadata,
        },
      },
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during file upload' },
      { status: 500 }
    );
  }
}

// GET - Get signed upload URL for client-side uploads
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get('documentType');
    const fileName = searchParams.get('fileName');

    if (!documentType) {
      return NextResponse.json(
        { error: 'Document type is required' },
        { status: 400 }
      );
    }

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    // Generate signed upload URL
    const { generateSignedUploadUrl } = await import('@/lib/cloudinary');
    const signedUrl = await generateSignedUploadUrl(
      documentType,
      session.user.id,
      session.user.role
    );

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: signedUrl.url,
        uploadParams: signedUrl.params,
        timestamp: Date.now(),
        expiresIn: 3600, // 1 hour
      },
    });

  } catch (error) {
    console.error('Signed URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
