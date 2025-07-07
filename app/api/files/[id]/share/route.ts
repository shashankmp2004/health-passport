import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import Doctor from '@/lib/models/Doctor';
import Hospital from '@/lib/models/Hospital';
import { generateSecureUrl } from '@/lib/cloudinary';

// POST - Share a document with specific users or make it temporarily public
export async function POST(
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
    const body = await request.json();
    const { shareWith, expiresIn, message, allowDownload } = body;

    // shareWith can be:
    // - 'public': Make temporarily public
    // - array of user IDs: Share with specific users
    // - specific role: 'doctors', 'hospitals'

    if (!shareWith) {
      return NextResponse.json(
        { error: 'Share target is required (shareWith)' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find the document
    const patient = await Patient.findOne({
      'documents._id': documentId
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const document = patient.documents.find((doc: any) => doc._id.toString() === documentId);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found in records' },
        { status: 404 }
      );
    }

    // Check if user owns the document
    if (session.user.role !== 'patient' || session.user.id !== patient._id.toString()) {
      return NextResponse.json(
        { error: 'Access denied - Only document owners can share files' },
        { status: 403 }
      );
    }

    // Generate sharing configuration
    const shareConfig = {
      shareId: generateShareId(),
      createdBy: session.user.id,
      createdAt: new Date(),
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24 hours
      shareWith,
      message: message || '',
      allowDownload: allowDownload !== false, // Default true
      accessCount: 0,
      lastAccessed: null,
    };

    // Add sharing info to document
    document.sharing = document.sharing || [];
    document.sharing.push(shareConfig);
    
    await patient.save();

    // Generate secure share URL
    const shareUrl = `${process.env.NEXTAUTH_URL}/shared/${shareConfig.shareId}`;

    // Log sharing activity
    console.log(`Document shared: ${documentId} by ${session.user.id} with ${JSON.stringify(shareWith)}`);

    return NextResponse.json({
      success: true,
      message: 'Document shared successfully',
      data: {
        shareId: shareConfig.shareId,
        shareUrl,
        expiresAt: shareConfig.expiresAt,
        shareWith: shareConfig.shareWith,
        allowDownload: shareConfig.allowDownload,
        document: {
          id: document._id,
          fileName: document.fileName,
          fileType: document.fileType,
        },
      },
    });

  } catch (error) {
    console.error('Document sharing error:', error);
    return NextResponse.json(
      { error: 'Internal server error during document sharing' },
      { status: 500 }
    );
  }
}

// GET - Get sharing information for a document
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

    // Connect to database
    await dbConnect();

    // Find the document
    const patient = await Patient.findOne({
      'documents._id': documentId
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const document = patient.documents.find((doc: any) => doc._id.toString() === documentId);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found in records' },
        { status: 404 }
      );
    }

    // Check permissions
    if (session.user.role !== 'patient' || session.user.id !== patient._id.toString()) {
      return NextResponse.json(
        { error: 'Access denied - Only document owners can view sharing information' },
        { status: 403 }
      );
    }

    // Filter out expired shares
    const activeShares = (document.sharing || []).filter((share: any) => 
      new Date(share.expiresAt) > new Date()
    );

    return NextResponse.json({
      success: true,
      data: {
        document: {
          id: document._id,
          fileName: document.fileName,
          fileType: document.fileType,
        },
        activeShares: activeShares.map((share: any) => ({
          shareId: share.shareId,
          shareUrl: `${process.env.NEXTAUTH_URL}/shared/${share.shareId}`,
          createdAt: share.createdAt,
          expiresAt: share.expiresAt,
          shareWith: share.shareWith,
          allowDownload: share.allowDownload,
          accessCount: share.accessCount,
          lastAccessed: share.lastAccessed,
        })),
        totalShares: activeShares.length,
      },
    });

  } catch (error) {
    console.error('Sharing info error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching sharing information' },
      { status: 500 }
    );
  }
}

// DELETE - Revoke document sharing
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
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find the document
    const patient = await Patient.findOne({
      'documents._id': documentId
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const document = patient.documents.find((doc: any) => doc._id.toString() === documentId);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found in records' },
        { status: 404 }
      );
    }

    // Check permissions
    if (session.user.role !== 'patient' || session.user.id !== patient._id.toString()) {
      return NextResponse.json(
        { error: 'Access denied - Only document owners can revoke sharing' },
        { status: 403 }
      );
    }

    // Remove the specific share
    document.sharing = (document.sharing || []).filter((share: any) => share.shareId !== shareId);
    
    await patient.save();

    // Log revocation
    console.log(`Document sharing revoked: ${documentId} shareId: ${shareId} by ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Document sharing revoked successfully',
      data: {
        revokedShareId: shareId,
        documentId,
      },
    });

  } catch (error) {
    console.error('Share revocation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during share revocation' },
      { status: 500 }
    );
  }
}

// Helper function to generate unique share ID
function generateShareId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
}
