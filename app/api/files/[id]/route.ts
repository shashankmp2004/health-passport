import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import Doctor from '@/lib/models/Doctor';
import Hospital from '@/lib/models/Hospital';
import { generateSecureUrl, deleteFile } from '@/lib/cloudinary';

// GET - Download or view a file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const documentId = params.id;
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';
    const transformation = searchParams.get('transform'); // For image transformations

    // Connect to database
    await dbConnect();

    // Find the document
    let document: any = null;
    let ownerInfo: any = null;
    let hasAccess = false;

    // Search in patient documents
    const patient = await Patient.findOne({
      'documents._id': documentId
    }).select('documents personalInfo');

    if (patient) {
      document = patient.documents.find((doc: any) => doc._id.toString() === documentId);
      ownerInfo = {
        type: 'patient',
        id: patient._id,
        name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
      };

      // Check access permissions
      if (session.user.role === 'patient' && session.user.id === patient._id.toString()) {
        hasAccess = true; // Patient accessing their own document
      } else if (session.user.role === 'doctor') {
        // Check if doctor has treated this patient
        const hasVisits = patient.visits?.some((visit: any) => 
          visit.doctorId.toString() === session.user.id
        );
        hasAccess = hasVisits || document.isPublic;
      } else if (session.user.role === 'hospital') {
        // Check if patient has visited this hospital
        const hasVisits = patient.visits?.some((visit: any) => 
          visit.hospitalId.toString() === session.user.id
        );
        hasAccess = hasVisits || document.isPublic;
      }
    }

    // If not found in patient records, search other collections
    // TODO: Implement doctor and hospital document collections

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied - Insufficient permissions to view this document' },
        { status: 403 }
      );
    }

    // Generate secure URL for the file
    let secureUrl: string;
    const expiresIn = 3600; // 1 hour

    try {
      if (transformation && document.cloudinaryData.resourceType === 'image') {
        // Apply transformation for images
        const transformParams = JSON.parse(transformation);
        secureUrl = generateSecureUrl(
          document.cloudinaryData.publicId,
          transformParams,
          expiresIn
        );
      } else {
        secureUrl = generateSecureUrl(
          document.cloudinaryData.publicId,
          null,
          expiresIn
        );
      }
    } catch (error) {
      console.error('Error generating secure URL:', error);
      return NextResponse.json(
        { error: 'Failed to generate file access URL' },
        { status: 500 }
      );
    }

    // Log file access for audit purposes
    console.log(`File access: ${documentId} by ${session.user.role} ${session.user.id}`);

    if (download) {
      // For download, redirect to the secure URL with download headers
      return NextResponse.redirect(secureUrl);
    } else {
      // Return file metadata and secure URL for viewing
      return NextResponse.json({
        success: true,
        data: {
          document: {
            id: document._id,
            fileName: document.fileName,
            fileType: document.fileType,
            fileSize: document.fileSize,
            category: document.category,
            description: document.description,
            uploadDate: document.uploadDate,
            tags: document.tags,
            metadata: document.metadata,
          },
          access: {
            url: secureUrl,
            expiresIn,
            expiresAt: new Date(Date.now() + expiresIn * 1000),
          },
          owner: ownerInfo,
          permissions: {
            canView: true,
            canDownload: true,
            canDelete: session.user.role === 'patient' && session.user.id === ownerInfo.id,
            canShare: session.user.role === 'patient' && session.user.id === ownerInfo.id,
          },
        },
      });
    }

  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json(
      { error: 'Internal server error during file access' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const documentId = params.id;

    // Connect to database
    await dbConnect();

    // Find the document and check ownership
    let document: any = null;
    let canDelete = false;
    let patient: any = null;

    // Search in patient documents
    patient = await Patient.findOne({
      'documents._id': documentId
    });

    if (patient) {
      document = patient.documents.find((doc: any) => doc._id.toString() === documentId);
      
      // Only the document owner (patient) can delete their documents
      canDelete = session.user.role === 'patient' && session.user.id === patient._id.toString();
    }

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Access denied - Only document owners can delete files' },
        { status: 403 }
      );
    }

    // Delete from Cloudinary
    const cloudinaryDeleteResult = await deleteFile(document.cloudinaryData.publicId);
    
    if (!cloudinaryDeleteResult.success) {
      return NextResponse.json(
        { error: 'Failed to delete file from storage' },
        { status: 500 }
      );
    }

    // Remove from database
    patient.documents = patient.documents.filter(
      (doc: any) => doc._id.toString() !== documentId
    );
    
    await patient.save();

    // Log file deletion for audit purposes
    console.log(`File deleted: ${documentId} by ${session.user.role} ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      data: {
        deletedDocument: {
          id: document._id,
          fileName: document.fileName,
          deletedAt: new Date(),
        },
      },
    });

  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error during file deletion' },
      { status: 500 }
    );
  }
}
