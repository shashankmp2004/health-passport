import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import { getMockPatient, isMockPatientById } from '@/lib/utils/mock-data';

// GET - Fetch patient's documents
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'patient') {
      return NextResponse.json(
        { error: 'Unauthorized - Patient access required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // lab-report, prescription, scan, etc.
    const limit = parseInt(searchParams.get('limit') || '20');

    // Connect to database
    await dbConnect();

    // Get patient data - check for mock patient first
    let patient;
    if (isMockPatientById(session.user.id)) {
      console.log('Using mock patient data for documents...');
      patient = getMockPatient();
    } else {
      patient = await Patient.findById(session.user.id).select('documents');
    }
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    let documents = patient.documents || [];

    // Filter by type if specified
    if (type) {
      documents = documents.filter((doc: any) => doc.fileType === type);
    }

    // Sort by upload date (most recent first)
    const sortedDocuments = documents
      .sort((a: any, b: any) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
      .slice(0, limit);

    // Calculate statistics
    const totalDocuments = documents.length;
    const documentTypes = documents.reduce((acc: any, doc: any) => {
      acc[doc.fileType] = (acc[doc.fileType] || 0) + 1;
      return acc;
    }, {});

    const recentDocuments = documents.filter((doc: any) => {
      const uploadDate = new Date(doc.uploadDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return uploadDate >= thirtyDaysAgo;
    }).length;

    return NextResponse.json({
      success: true,
      data: {
        documents: sortedDocuments.map((doc: any) => ({
          id: doc._id,
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          uploadDate: doc.uploadDate,
          uploadedBy: doc.uploadedBy,
          category: doc.category,
          description: doc.description,
          tags: doc.tags,
          isPublic: doc.isPublic,
          // Don't expose the actual file URL for security
          hasFile: !!doc.fileUrl,
        })),
        statistics: {
          total: totalDocuments,
          byType: documentTypes,
          recentUploads: recentDocuments,
        },
        pagination: {
          limit,
          total: documents.length,
          hasMore: documents.length > limit,
        },
      },
    });

  } catch (error) {
    console.error('Documents fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Upload new document with actual file
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'patient') {
      return NextResponse.json(
        { error: 'Unauthorized - Patient access required' },
        { status: 401 }
      );
    }

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

    // Forward to upload API
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('documentType', documentType);
    if (category) uploadFormData.append('category', category);
    if (description) uploadFormData.append('description', description);
    if (tags) uploadFormData.append('tags', tags);
    uploadFormData.append('isPublic', isPublic.toString());

    // Make internal request to upload API
    const uploadResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/upload`, {
      method: 'POST',
      body: uploadFormData,
      headers: {
        // Forward session cookies
        'Cookie': request.headers.get('Cookie') || '',
      },
    });

    const uploadResult = await uploadResponse.json();

    if (!uploadResponse.ok) {
      return NextResponse.json(uploadResult, { status: uploadResponse.status });
    }

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      data: uploadResult.data,
      note: 'File upload now fully functional with Cloudinary integration'
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
