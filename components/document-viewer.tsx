import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Image, 
  Video, 
  Download, 
  Eye, 
  Share2, 
  Trash2, 
  Calendar,
  User,
  FileIcon,
  AlertCircle,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentFile {
  _id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  cloudinaryId: string;
  cloudinaryUrl: string;
  documentType: string;
  category: string;
  description?: string;
  tags?: string[];
  isPublic: boolean;
  uploadedBy: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  metadata?: {
    width?: number;
    height?: number;
    pages?: number;
    duration?: number;
  };
}

interface DocumentViewerProps {
  documents: DocumentFile[];
  onDocumentUpdate?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  viewMode?: 'grid' | 'list';
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documents,
  onDocumentUpdate,
  canEdit = false,
  canDelete = false,
  viewMode = 'grid'
}) => {
  const [selectedDocument, setSelectedDocument] = useState<DocumentFile | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (fileType === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <FileIcon className="w-4 h-4" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle document download
  const handleDownload = async (document: DocumentFile) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/files/${document._id}?download=true`);
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = globalThis.document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = document.originalName;
      globalThis.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      globalThis.document.body.removeChild(a);

      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document sharing
  const handleShare = async (document: DocumentFile) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/files/${document._id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expiresIn: '24h', // 24 hours
          allowDownload: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create share link');
      }

      const data = await response.json();
      
      // Copy share link to clipboard
      await navigator.clipboard.writeText(data.shareUrl);
      
      toast({
        title: "Success",
        description: "Share link copied to clipboard (expires in 24 hours)",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create share link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document deletion
  const handleDelete = async (document: DocumentFile) => {
    if (!confirm(`Are you sure you want to delete "${document.originalName}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/files/${document._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      toast({
        title: "Success",
        description: "File deleted successfully",
      });

      onDocumentUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render document preview
  const renderDocumentPreview = (document: DocumentFile) => {
    if (document.fileType.startsWith('image/')) {
      return (
        <img
          src={document.cloudinaryUrl}
          alt={document.originalName}
          className="max-w-full max-h-96 object-contain"
        />
      );
    }
    
    if (document.fileType === 'application/pdf') {
      return (
        <iframe
          src={`${document.cloudinaryUrl}#toolbar=0`}
          className="w-full h-96"
          title={document.originalName}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        {getFileIcon(document.fileType)}
        <p className="mt-2 text-sm">Preview not available for this file type</p>
        <Button 
          onClick={() => handleDownload(document)}
          className="mt-4"
          disabled={isLoading}
        >
          <Download className="w-4 h-4 mr-2" />
          Download to View
        </Button>
      </div>
    );
  };

  // Render document card
  const renderDocumentCard = (document: DocumentFile) => (
    <Card key={document._id} className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getFileIcon(document.fileType)}
            <CardTitle className="text-sm truncate" title={document.originalName}>
              {document.originalName}
            </CardTitle>
          </div>
          {!document.isPublic && <Lock className="w-4 h-4 text-gray-400" />}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {/* Document info */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {document.documentType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {document.category}
            </Badge>
          </div>

          {/* File details */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Size: {formatFileSize(document.fileSize)}</div>
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(document.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              {document.uploadedBy.name}
            </div>
          </div>

          {/* Description */}
          {document.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {document.description}
            </p>
          )}

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {document.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-1 py-0.5 bg-gray-100 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {document.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{document.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <div className="flex space-x-1">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDocument(document)}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>{document.originalName}</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[70vh]">
                    {renderDocumentPreview(document)}
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(document)}
                disabled={isLoading}
              >
                <Download className="w-3 h-3" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleShare(document)}
                disabled={isLoading}
              >
                <Share2 className="w-3 h-3" />
              </Button>
            </div>

            {canDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(document)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileIcon className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-center">No documents found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(renderDocumentCard)}
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((document) => (
            <Card key={document._id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  {getFileIcon(document.fileType)}
                  <div>
                    <h4 className="font-medium">{document.originalName}</h4>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(document.fileSize)} • {document.documentType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(document)}
                    disabled={isLoading}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(document)}
                      disabled={isLoading}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
