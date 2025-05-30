import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File, Download, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Attachment {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

interface TaskAttachmentsProps {
  taskId: string;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  currentUserId?: string;
}

export default function TaskAttachments({
  taskId,
  attachments,
  onAttachmentsChange,
  currentUserId,
}: TaskAttachmentsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType.includes('pdf')) {
      return '📄';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return '📝';
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return '📊';
    } else if (mimeType.includes('zip')) {
      return '🗜️';
    } else {
      return '📎';
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const newAttachment = await response.json();
      onAttachmentsChange([...attachments, newAttachment]);
      
      toast.success(`File "${file.name}" uploaded successfully`);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadFile = (attachment: Attachment) => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = attachment.filePath;
    link.download = attachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteAttachment = async (attachmentId: string) => {
    try {
      const response = await fetch(
        `/api/tasks/${taskId}/attachments/${attachmentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }

      const updatedAttachments = attachments.filter(a => a.id !== attachmentId);
      onAttachmentsChange(updatedAttachments);
      
      toast.success('Attachment deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete attachment');
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Attachments ({attachments.length})</Label>
      </div>

      {/* Upload Area */}
      <Card 
        className={`border-dashed transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
        } ${isUploading ? 'opacity-50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <div className="text-sm text-gray-600 mb-2">
              Drag and drop a file here, or{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                browse
              </button>
            </div>
            <div className="text-xs text-gray-500">
              Maximum file size: 10MB
            </div>
            <div className="text-xs text-gray-500">
              Supported: Images, PDFs, Documents, Spreadsheets, Archives
            </div>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={isUploading}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
          />
        </CardContent>
      </Card>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <Card key={attachment.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-lg">{getFileIcon(attachment.mimeType)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {attachment.originalName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(attachment.fileSize)} • Uploaded by {attachment.uploader.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadFile(attachment)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    {(currentUserId === attachment.uploader.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAttachment(attachment.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="text-center py-4">
          <div className="text-sm text-gray-600">Uploading...</div>
        </div>
      )}
    </div>
  );
}
