import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, X, File, FileText, Image, Film, Music, Archive,
  Eye, Download, Loader2
} from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  currentFiles?: Array<{
    id: string;
    name: string;
    type: string;
    url?: string;
    size: number;
    uploadedDate: string;
  }>;
  onFileRemove?: (fileId: string) => void;
  onFileDownload?: (fileId: string) => void;
  onFilePreview?: (fileId: string) => void;
  disabled?: boolean;
  className?: string;
}

interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  currentFiles = [],
  onFileRemove,
  onFileDownload,
  onFilePreview,
  disabled = false,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = useCallback((fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Film;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf')) return FileText;
    if (type.includes('word') || type.includes('document')) return FileText;
    if (type.includes('zip') || type.includes('archive')) return Archive;
    return File;
  }, []);

  const validateFile = useCallback((file: File): FileValidationResult => {
    // Check file size
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `File "${file.name}" exceeds maximum size of ${Math.round(maxFileSize / (1024 * 1024))}MB`
      };
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isAcceptedType = acceptedTypes.some(type => 
      type.toLowerCase() === fileExtension || file.type.includes(type.replace('.', ''))
    );

    if (!isAcceptedType) {
      return {
        isValid: false,
        error: `File type "${fileExtension}" is not accepted. Allowed types: ${acceptedTypes.join(', ')}`
      };
    }

    // Check max files limit
    if (currentFiles.length >= maxFiles) {
      return {
        isValid: false,
        error: `Maximum ${maxFiles} files allowed`
      };
    }

    return { isValid: true };
  }, [maxFileSize, acceptedTypes, maxFiles, currentFiles.length]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || disabled) return;

    const fileArray = Array.from(files);
    const validationResults = fileArray.map(validateFile);
    const invalidFiles = validationResults.filter(result => !result.isValid);

    if (invalidFiles.length > 0) {
      // Show error for invalid files
      alert(invalidFiles.map(result => result.error).join('\n'));
      return;
    }

    // Check total files after adding new ones
    if (currentFiles.length + fileArray.length > maxFiles) {
      alert(`Cannot add ${fileArray.length} files. Maximum ${maxFiles} files allowed (currently ${currentFiles.length} files).`);
      return;
    }

    // Simulate upload process
    const uploadPromises = fileArray.map((file, index) => {
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setUploadingFiles(prev => new Set([...prev, fileId]));

      return new Promise<void>((resolve) => {
        // Use file information to simulate varying upload times
        const baseUploadTime = 1000;
        const sizeMultiplier = file.size / (1024 * 1024); // Convert to MB
        const typeMultiplier = file.type.startsWith('video/') ? 3 : file.type.startsWith('image/') ? 1.5 : 1;
        const uploadTime = (baseUploadTime + sizeMultiplier * 500) * typeMultiplier + (index * 100);

        setTimeout(() => {
          setUploadingFiles(prev => {
            const newSet = new Set(prev);
            newSet.delete(fileId);
            return newSet;
          });
          resolve();
        }, uploadTime);
      });
    });

    Promise.all(uploadPromises).then(() => {
      onFilesSelected(fileArray);
    });
  }, [disabled, currentFiles.length, maxFiles, onFilesSelected, validateFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [disabled, handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getFileTypeColor = useCallback((fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.startsWith('image/')) return 'text-green-600 bg-green-100';
    if (type.startsWith('video/')) return 'text-purple-600 bg-purple-100';
    if (type.startsWith('audio/')) return 'text-blue-600 bg-blue-100';
    if (type.includes('pdf')) return 'text-red-600 bg-red-100';
    if (type.includes('word') || type.includes('document')) return 'text-blue-600 bg-blue-100';
    if (type.includes('zip') || type.includes('archive')) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
          ${isDragOver && !disabled 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="text-center">
          <Upload className={`mx-auto h-12 w-12 ${isDragOver && !disabled ? 'text-blue-500' : 'text-gray-400'}`} />
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900">
              {isDragOver && !disabled ? 'Drop files here' : 'Upload documents'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Accepted types: {acceptedTypes.join(', ')} • Max size: {Math.round(maxFileSize / (1024 * 1024))}MB • Max files: {maxFiles}
            </p>
          </div>
        </div>
      </div>

      {/* Current Files List */}
      {currentFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Uploaded Files ({currentFiles.length}/{maxFiles})
          </h4>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {currentFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              const isUploading = uploadingFiles.has(file.id);
              
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    ) : (
                      <div className={`p-1 rounded ${getFileTypeColor(file.type)}`}>
                        <FileIcon className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.uploadedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {onFilePreview && file.url && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFilePreview(file.id);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    
                    {onFileDownload && file.url && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileDownload(file.id);
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    
                    {onFileRemove && !disabled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileRemove(file.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Progress Summary */}
      {uploadingFiles.size > 0 && (
        <div className="flex items-center space-x-2 text-sm text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading {uploadingFiles.size} file(s)...</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;