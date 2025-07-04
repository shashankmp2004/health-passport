import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  X, 
  AlertCircle,
  CheckCircle2,
  FileIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onUploadComplete?: (uploadedFiles: any[]) => void;
  allowMultiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  documentTypes?: { value: string; label: string }[];
  categories?: { value: string; label: string }[];
}

interface UploadFile {
  file: File;
  id: string;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  documentType?: string;
  category?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  allowMultiple = true,
  maxFiles = 10,
  maxFileSize = 10, // 10MB default
  acceptedFileTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  documentTypes = [
    { value: 'medical-record', label: 'Medical Record' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'lab-report', label: 'Lab Report' },
    { value: 'imaging', label: 'Imaging/X-ray' },
    { value: 'vaccination', label: 'Vaccination Card' },
    { value: 'insurance', label: 'Insurance Card' },
    { value: 'id-document', label: 'ID Document' },
    { value: 'other', label: 'Other' },
  ],
  categories = [
    { value: 'general', label: 'General' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'laboratory', label: 'Laboratory' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'emergency', label: 'Emergency' },
  ],
}) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Generate file icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (fileType === 'application/pdf') return <FileText className="w-5 h-5" />;
    return <FileIcon className="w-5 h-5" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          toast({
            title: "File Rejected",
            description: `${file.name}: ${error.message}`,
            variant: "destructive",
          });
        });
      });
    }

    // Handle accepted files
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: 'pending' as const,
      documentType: '',
      category: '',
      description: '',
      tags: [],
      isPublic: false,
    }));

    setUploadFiles(prev => {
      const combined = [...prev, ...newFiles];
      if (combined.length > maxFiles) {
        toast({
          title: "Too Many Files",
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive",
        });
        return combined.slice(0, maxFiles);
      }
      return combined;
    });
  }, [maxFiles, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize * 1024 * 1024, // Convert MB to bytes
    multiple: allowMultiple,
    disabled: isUploading,
  });

  // Remove file
  const removeFile = (id: string) => {
    setUploadFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  // Update file metadata
  const updateFileMetadata = (id: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ));
  };

  // Upload single file
  const uploadSingleFile = async (uploadFile: UploadFile): Promise<boolean> => {
    try {
      updateFileMetadata(uploadFile.id, { status: 'uploading' });

      const formData = new FormData();
      formData.append('file', uploadFile.file);
      formData.append('documentType', uploadFile.documentType || 'other');
      formData.append('category', uploadFile.category || 'general');
      formData.append('description', uploadFile.description || '');
      formData.append('tags', uploadFile.tags?.join(',') || '');
      formData.append('isPublic', String(uploadFile.isPublic || false));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      updateFileMetadata(uploadFile.id, { 
        status: 'completed', 
        progress: 100 
      });

      return true;
    } catch (error) {
      updateFileMetadata(uploadFile.id, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Upload failed',
        progress: 0
      });
      return false;
    }
  };

  // Upload all files
  const uploadAllFiles = async () => {
    const filesToUpload = uploadFiles.filter(f => f.status === 'pending');
    
    if (filesToUpload.length === 0) {
      toast({
        title: "No Files",
        description: "No files ready for upload",
        variant: "destructive",
      });
      return;
    }

    // Validate that all files have required metadata
    const incompleteFiles = filesToUpload.filter(f => !f.documentType);
    if (incompleteFiles.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please select document type for all files",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const results = await Promise.all(
        filesToUpload.map(file => uploadSingleFile(file))
      );

      const successCount = results.filter(Boolean).length;
      const failureCount = results.length - successCount;

      if (successCount > 0) {
        toast({
          title: "Upload Complete",
          description: `${successCount} file(s) uploaded successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
        });

        onUploadComplete?.(uploadFiles.filter(f => f.status === 'completed'));
      }

      if (failureCount === results.length) {
        toast({
          title: "Upload Failed",
          description: "All uploads failed. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Clear completed files
  const clearCompleted = () => {
    setUploadFiles(prev => {
      prev.forEach(file => {
        if (file.preview && file.status === 'completed') {
          URL.revokeObjectURL(file.preview);
        }
      });
      return prev.filter(f => f.status !== 'completed');
    });
  };

  const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
  const completedFiles = uploadFiles.filter(f => f.status === 'completed');
  const failedFiles = uploadFiles.filter(f => f.status === 'error');

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-lg text-blue-600">Drop files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Max {maxFiles} files, up to {maxFileSize}MB each
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supported: {acceptedFileTypes.map(type => type.split('/')[1]).join(', ')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Files ({uploadFiles.length})</CardTitle>
              <div className="flex space-x-2">
                {completedFiles.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCompleted}
                  >
                    Clear Completed
                  </Button>
                )}
                {pendingFiles.length > 0 && (
                  <Button
                    onClick={uploadAllFiles}
                    disabled={isUploading}
                    size="sm"
                  >
                    Upload All ({pendingFiles.length})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {uploadFiles.map((uploadFile) => (
              <div key={uploadFile.id} className="border rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  {/* File Preview */}
                  <div className="flex-shrink-0">
                    {uploadFile.preview ? (
                      <img
                        src={uploadFile.preview}
                        alt={uploadFile.file.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        {getFileIcon(uploadFile.file.type)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{uploadFile.file.name}</h4>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {uploadFile.status === 'completed' && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Uploaded
                          </Badge>
                        )}
                        {uploadFile.status === 'error' && (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadFile.id)}
                          disabled={uploadFile.status === 'uploading'}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* File Metadata Form */}
                    {uploadFile.status === 'pending' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`docType-${uploadFile.id}`}>Document Type *</Label>
                          <Select
                            value={uploadFile.documentType}
                            onValueChange={(value) => 
                              updateFileMetadata(uploadFile.id, { documentType: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                            <SelectContent>
                              {documentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`category-${uploadFile.id}`}>Category</Label>
                          <Select
                            value={uploadFile.category}
                            onValueChange={(value) => 
                              updateFileMetadata(uploadFile.id, { category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category..." />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor={`description-${uploadFile.id}`}>Description</Label>
                          <Textarea
                            id={`description-${uploadFile.id}`}
                            placeholder="Optional description..."
                            value={uploadFile.description}
                            onChange={(e) => 
                              updateFileMetadata(uploadFile.id, { description: e.target.value })
                            }
                            rows={2}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor={`tags-${uploadFile.id}`}>Tags</Label>
                          <Input
                            id={`tags-${uploadFile.id}`}
                            placeholder="Comma-separated tags..."
                            value={uploadFile.tags?.join(', ')}
                            onChange={(e) => 
                              updateFileMetadata(uploadFile.id, { 
                                tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                              })
                            }
                          />
                        </div>

                        <div className="md:col-span-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`public-${uploadFile.id}`}
                              checked={uploadFile.isPublic}
                              onCheckedChange={(checked) => 
                                updateFileMetadata(uploadFile.id, { isPublic: checked as boolean })
                              }
                            />
                            <Label htmlFor={`public-${uploadFile.id}`}>
                              Make this document publicly accessible
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="w-full" />
                    )}

                    {/* Error Message */}
                    {uploadFile.status === 'error' && uploadFile.error && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {uploadFile.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upload Summary */}
      {(completedFiles.length > 0 || failedFiles.length > 0) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex space-x-4">
                {completedFiles.length > 0 && (
                  <span className="text-green-600">
                    ✓ {completedFiles.length} uploaded
                  </span>
                )}
                {failedFiles.length > 0 && (
                  <span className="text-red-600">
                    ✗ {failedFiles.length} failed
                  </span>
                )}
              </div>
              <span className="text-gray-500">
                {uploadFiles.length} total files
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
