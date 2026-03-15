'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { DocumentType } from '@/types';

interface FileUploadProps {
  applicationId: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  multiple?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  uploadedAt?: Date;
  processingResult?: any;
}

const DOCUMENT_TYPES = [
  { value: 'GST_RETURN_1', label: 'GSTR-1 (Sales)', required: true },
  { value: 'GST_RETURN_3B', label: 'GSTR-3B (Summary)', required: true },
  { value: 'GST_2A', label: 'GSTR-2A (Purchase)', required: true },
  { value: 'ITR', label: 'Income Tax Return', required: true },
  { value: 'BANK_STATEMENT', label: 'Bank Statements (6 months)', required: true },
  { value: 'BALANCE_SHEET', label: 'Balance Sheet', required: true },
  { value: 'PNL_STATEMENT', label: 'Profit & Loss Statement', required: true },
  { value: 'ANNUAL_REPORT', label: 'Annual Report', required: false },
  { value: 'CIBIL_REPORT', label: 'CIBIL Commercial Report', required: true },
  { value: 'BOARD_RESOLUTION', label: 'Board Resolution', required: true },
  { value: 'MOA_AOA', label: 'MOA & AOA', required: true },
  { value: 'RATING_REPORT', label: 'Rating Agency Report', required: false },
];

const FileUploadComponent: React.FC<FileUploadProps> = ({ 
  applicationId, 
  onUploadComplete, 
  multiple = true 
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      type: 'UNKNOWN' as DocumentType,
      size: file.size,
      status: 'uploading' as const,
      progress: 0,
      uploadedAt: new Date()
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      
      // Upload progress simulation
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress } : f
        ));
      }

      // Mark as completed
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'completed', progress: 100 } : f
      ));
    }
    
    setUploading(false);
    onUploadComplete?.(newFiles);
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600';
      case 'processing':
        return 'text-yellow-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getMissingDocuments = () => {
    const uploadedTypes = files.map(f => f.type);
    return DOCUMENT_TYPES.filter(doc => 
      doc.required && !uploadedTypes.includes(doc.value as DocumentType)
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Document Upload
          </CardTitle>
          <CardDescription>
            Upload financial documents, GST returns, bank statements, and other required files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-lg font-medium text-blue-600">Drop the files here...</p>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-700">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports PDF, Images (PNG/JPG), Excel, CSV up to 50MB
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Required Documents</CardTitle>
          <CardDescription>
            Check which documents are required for complete application processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DOCUMENT_TYPES.map(doc => {
              const isUploaded = files.some(f => f.type === doc.value);
              return (
                <div
                  key={doc.value}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border
                    ${isUploaded 
                      ? 'border-green-200 bg-green-50' 
                      : doc.required 
                        ? 'border-orange-200 bg-orange-50' 
                        : 'border-gray-200'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    <span className={isUploaded ? 'font-medium text-green-700' : ''}>
                      {doc.label}
                    </span>
                  </div>
                  {isUploaded ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : doc.required ? (
                    <Badge variant="destructive">Required</Badge>
                  ) : (
                    <Badge variant="secondary">Optional</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upload Progress</span>
              <span className="text-sm font-normal text-gray-500">
                {files.filter(f => f.status === 'completed').length} / {files.length} completed
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map(file => (
                <div key={file.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {getStatusIcon(file.status)}
                      <span className={`ml-2 font-medium ${getStatusColor(file.status)}`}>
                        {file.name}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getStatusColor(file.status)}>
                        {file.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === 'uploading'}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <Progress value={file.progress} className="h-2" />
                  {file.error && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {file.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing Documents Warning */}
      {files.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              Document Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-orange-50 p-4 rounded-lg">
              {(() => {
                const missingDocs = getMissingDocuments();
                if (missingDocs.length === 0) {
                  return (
                    <div className="flex items-center text-green-700">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">All required documents uploaded!</span>
                    </div>
                  );
                }
                return (
                  <>
                    <p className="font-medium text-orange-800 mb-2">
                      {missingDocs.length} required documents missing:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {missingDocs.map(doc => (
                        <div key={doc.value} className="flex items-center text-sm">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                          {doc.label}
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadComponent;