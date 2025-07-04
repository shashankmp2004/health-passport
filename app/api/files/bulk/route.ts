import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/lib/models/Patient';
import { deleteFile } from '@/lib/cloudinary';

// POST - Bulk operations on files
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

    const body = await request.json();
    const { operation, documentIds } = body;

    if (!operation || !documentIds || !Array.isArray(documentIds)) {
      return NextResponse.json(
        { error: 'Operation and document IDs array are required' },
        { status: 400 }
      );
    }

    if (documentIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one document ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    const results = {
      successful: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    switch (operation) {
      case 'delete':
        await bulkDelete(session, documentIds, results);
        break;
      
      case 'updateCategory':
        const { category } = body;
        if (!category) {
          return NextResponse.json(
            { error: 'Category is required for update operation' },
            { status: 400 }
          );
        }
        await bulkUpdateCategory(session, documentIds, category, results);
        break;
      
      case 'updateVisibility':
        const { isPublic } = body;
        if (typeof isPublic !== 'boolean') {
          return NextResponse.json(
            { error: 'isPublic boolean value is required for visibility update' },
            { status: 400 }
          );
        }
        await bulkUpdateVisibility(session, documentIds, isPublic, results);
        break;
      
      default:
        return NextResponse.json(
          { error: `Unsupported operation: ${operation}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Bulk ${operation} operation completed`,
      data: {
        operation,
        total: documentIds.length,
        successful: results.successful.length,
        failed: results.failed.length,
        results,
      },
    });

  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during bulk operation' },
      { status: 500 }
    );
  }
}

// Bulk delete documents
async function bulkDelete(
  session: any,
  documentIds: string[],
  results: { successful: string[]; failed: { id: string; error: string }[] }
) {
  for (const documentId of documentIds) {
    try {
      // Find the document
      const patient = await Patient.findOne({
        'documents._id': documentId
      });

      if (!patient) {
        results.failed.push({ id: documentId, error: 'Document not found' });
        continue;
      }

      const document = patient.documents.find((doc: any) => doc._id.toString() === documentId);
      
      if (!document) {
        results.failed.push({ id: documentId, error: 'Document not found in patient records' });
        continue;
      }

      // Check permissions
      if (session.user.role !== 'patient' || session.user.id !== patient._id.toString()) {
        results.failed.push({ id: documentId, error: 'Access denied' });
        continue;
      }

      // Delete from Cloudinary
      const cloudinaryDeleteResult = await deleteFile(document.cloudinaryData.publicId);
      
      if (!cloudinaryDeleteResult.success) {
        results.failed.push({ id: documentId, error: 'Failed to delete from storage' });
        continue;
      }

      // Remove from database
      patient.documents = patient.documents.filter(
        (doc: any) => doc._id.toString() !== documentId
      );
      
      await patient.save();
      results.successful.push(documentId);

    } catch (error) {
      results.failed.push({ id: documentId, error: 'Processing error' });
    }
  }
}

// Bulk update category
async function bulkUpdateCategory(
  session: any,
  documentIds: string[],
  category: string,
  results: { successful: string[]; failed: { id: string; error: string }[] }
) {
  for (const documentId of documentIds) {
    try {
      const patient = await Patient.findOne({
        'documents._id': documentId
      });

      if (!patient) {
        results.failed.push({ id: documentId, error: 'Document not found' });
        continue;
      }

      // Check permissions (only owner can update)
      if (session.user.role !== 'patient' || session.user.id !== patient._id.toString()) {
        results.failed.push({ id: documentId, error: 'Access denied' });
        continue;
      }

      // Update category
      const documentIndex = patient.documents.findIndex((doc: any) => doc._id.toString() === documentId);
      if (documentIndex === -1) {
        results.failed.push({ id: documentId, error: 'Document not found in records' });
        continue;
      }

      patient.documents[documentIndex].category = category;
      await patient.save();
      results.successful.push(documentId);

    } catch (error) {
      results.failed.push({ id: documentId, error: 'Processing error' });
    }
  }
}

// Bulk update visibility
async function bulkUpdateVisibility(
  session: any,
  documentIds: string[],
  isPublic: boolean,
  results: { successful: string[]; failed: { id: string; error: string }[] }
) {
  for (const documentId of documentIds) {
    try {
      const patient = await Patient.findOne({
        'documents._id': documentId
      });

      if (!patient) {
        results.failed.push({ id: documentId, error: 'Document not found' });
        continue;
      }

      // Check permissions (only owner can update)
      if (session.user.role !== 'patient' || session.user.id !== patient._id.toString()) {
        results.failed.push({ id: documentId, error: 'Access denied' });
        continue;
      }

      // Update visibility
      const documentIndex = patient.documents.findIndex((doc: any) => doc._id.toString() === documentId);
      if (documentIndex === -1) {
        results.failed.push({ id: documentId, error: 'Document not found in records' });
        continue;
      }

      patient.documents[documentIndex].isPublic = isPublic;
      await patient.save();
      results.successful.push(documentId);

    } catch (error) {
      results.failed.push({ id: documentId, error: 'Processing error' });
    }
  }
}
