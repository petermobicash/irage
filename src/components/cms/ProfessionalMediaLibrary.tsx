import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Grid, List, Upload, Image, Video, Music, File, 
  Download, Share, Trash2, Edit, Eye, Copy, FolderOpen,
  MoreVertical, X
} from 'lucide-react';
import Button from '../ui/Button';
import '../../styles/cms-dark-theme.css';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnail: string;
  size: number;
  dimensions?: { width: number; height: number };
  duration?: number; // for videos/audio
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
  altText: string;
  description: string;
  folder: string;
}

interface MediaLibraryProps {
  onSelect?: (files: MediaFile[]) => void;
  multiSelect?: boolean;
  allowedTypes?: string[];
}

const ProfessionalMediaLibrary: React.FC<MediaLibraryProps> = ({
  onSelect,
  multiSelect = true,
  allowedTypes = ['image', 'video', 'audio', 'document']
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentFolder, setCurrentFolder] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const loadMediaFiles = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockFiles: MediaFile[] = [
        {
          id: '1',
          name: 'hero-banner.jpg',
          type: 'image',
          url: '/api/placeholder/800/400',
          thumbnail: '/api/placeholder/200/200',
          size: 245760,
          dimensions: { width: 1920, height: 1080 },
          uploadedAt: '2024-01-15T10:30:00Z',
          uploadedBy: 'Sarah Johnson',
          tags: ['hero', 'banner', 'marketing'],
          altText: 'Professional hero banner image',
          description: 'Main banner for website homepage',
          folder: 'images'
        },
        {
          id: '2',
          name: 'intro-video.mp4',
          type: 'video',
          url: '/api/placeholder/video/1',
          thumbnail: '/api/placeholder/200/150',
          size: 15728640,
          duration: 120,
          uploadedAt: '2024-01-14T14:20:00Z',
          uploadedBy: 'Mike Chen',
          tags: ['intro', 'welcome'],
          altText: 'Welcome introduction video',
          description: 'Introduction video for new visitors',
          folder: 'videos'
        },
        {
          id: '3',
          name: 'brand-logo.svg',
          type: 'image',
          url: '/api/placeholder/400/400',
          thumbnail: '/api/placeholder/200/200',
          size: 12340,
          dimensions: { width: 400, height: 400 },
          uploadedAt: '2024-01-13T09:15:00Z',
          uploadedBy: 'Emily Davis',
          tags: ['logo', 'brand', 'identity'],
          altText: 'Company logo',
          description: 'Official company logo in SVG format',
          folder: 'branding'
        },
        {
          id: '4',
          name: 'product-catalog.pdf',
          type: 'document',
          url: '/api/placeholder/document',
          thumbnail: '/api/placeholder/200/150',
          size: 5242880,
          uploadedAt: '2024-01-12T16:45:00Z',
          uploadedBy: 'Admin User',
          tags: ['catalog', 'products', 'pdf'],
          altText: 'Product catalog document',
          description: 'Complete product catalog in PDF format',
          folder: 'documents'
        },
        {
          id: '5',
          name: 'background-music.mp3',
          type: 'audio',
          url: '/api/placeholder/audio',
          thumbnail: '/api/placeholder/200/200',
          size: 3145728,
          duration: 180,
          uploadedAt: '2024-01-11T11:30:00Z',
          uploadedBy: 'Alex Wilson',
          tags: ['music', 'background', 'ambient'],
          altText: 'Background music track',
          description: 'Ambient background music for videos',
          folder: 'audio'
        }
      ];

      setFiles(mockFiles);
      setLoading(false);
    };

    loadMediaFiles();
  }, []);

  // Reset filter type when allowedTypes changes to ensure it's valid
  useEffect(() => {
    if (allowedTypes && filterType !== 'all' && !allowedTypes.includes(filterType)) {
      setFilterType('all');
    }
  }, [allowedTypes, filterType]);

  const filteredFiles = useCallback(() => {
    const filtered = files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || file.type === filterType;
      const matchesAllowedTypes = !allowedTypes || allowedTypes.includes(file.type);
      const matchesFolder = !currentFolder || file.folder === currentFolder;
      
      return matchesSearch && matchesType && matchesAllowedTypes && matchesFolder;
    });

    // Sort files
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [files, searchTerm, filterType, sortBy, sortOrder, currentFolder, allowedTypes]);

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    
    if (multiSelect) {
      if (newSelection.has(fileId)) {
        newSelection.delete(fileId);
      } else {
        newSelection.add(fileId);
      }
    } else {
      newSelection.clear();
      newSelection.add(fileId);
    }
    
    setSelectedFiles(newSelection);
    
    if (onSelect) {
      const selectedFilesList = files.filter(file => newSelection.has(file.id));
      onSelect(selectedFilesList);
    }
  };

  const selectAllFiles = () => {
    const filtered = filteredFiles();
    if (selectedFiles.size === filtered.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filtered.map(file => file.id)));
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      case 'document': return File;
      default: return File;
    }
  };

  const folders = [...new Set(files.map(file => file.folder))];

  if (loading) {
    return (
      <div className="cms-dark-theme min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="cms-text-secondary">Loading media library...</p>
        </div>
      </div>
    );
  }

  const filtered = filteredFiles();

  return (
    <div className="cms-dark-theme min-h-screen cms-fade-in">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="cms-heading-xl mb-2">Media Library</h1>
            <p className="cms-text-secondary">Manage and organize your digital assets</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-amber-500 text-white' 
                    : 'cms-text-secondary hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-amber-500 text-white' 
                    : 'cms-text-secondary hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <Button 
              onClick={() => setShowUploadModal(true)}
              icon={Upload} 
              className="cms-btn-primary-dark"
            >
              Upload Files
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="cms-card-dark p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 cms-text-tertiary" />
              <input
                type="text"
                placeholder="Search files, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 cms-input-dark"
              />
            </div>
            
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="cms-select-dark"
            >
              <option value="all">All Types</option>
              {allowedTypes?.includes('image') && <option value="image">Images</option>}
              {allowedTypes?.includes('video') && <option value="video">Videos</option>}
              {allowedTypes?.includes('audio') && <option value="audio">Audio</option>}
              {allowedTypes?.includes('document') && <option value="document">Documents</option>}
            </select>
            
            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="cms-select-dark"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="size-desc">Largest First</option>
              <option value="size-asc">Smallest First</option>
            </select>
          </div>
          
          {/* Folder Navigation */}
          {folders.length > 0 && (
            <div className="flex items-center space-x-2 mt-4">
              <FolderOpen className="w-4 h-4 cms-text-tertiary" />
              <button
                onClick={() => setCurrentFolder('')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  currentFolder === '' 
                    ? 'bg-amber-500 text-white' 
                    : 'cms-text-secondary hover:text-white'
                }`}
              >
                All Files
              </button>
              {folders.map(folder => (
                <button
                  key={folder}
                  onClick={() => setCurrentFolder(folder)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    currentFolder === folder 
                      ? 'bg-amber-500 text-white' 
                      : 'cms-text-secondary hover:text-white'
                  }`}
                >
                  {folder}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedFiles.size > 0 && (
          <div className="cms-card-dark p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="cms-text-secondary">
                  {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={selectAllFiles}
                  className="cms-btn-ghost-dark"
                >
                  {selectedFiles.size === filtered.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" icon={Download} className="cms-btn-ghost-dark">
                  Download
                </Button>
                <Button size="sm" variant="outline" icon={Share} className="cms-btn-ghost-dark">
                  Share
                </Button>
                <Button size="sm" variant="outline" icon={Trash2} className="cms-btn-ghost-dark">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Files Grid/List */}
        {filtered.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' 
            : 'space-y-2'
          }>
            {filtered.map((file) => {
              const IconComponent = getFileIcon(file.type);
              const isSelected = selectedFiles.has(file.id);
              
              return (
                <div
                  key={file.id}
                  className={`cms-card-dark p-4 cursor-pointer transition-all duration-300 hover:shadow-amber ${
                    viewMode === 'grid' ? 'text-center' : 'flex items-center space-x-4'
                  } ${isSelected ? 'ring-2 ring-amber-500' : ''}`}
                  onClick={() => toggleFileSelection(file.id)}
                >
                  {viewMode === 'grid' ? (
                    <>
                      {/* Grid View */}
                      <div className="relative mb-3">
                        <div className="w-full aspect-square bg-gray-700 rounded-lg overflow-hidden">
                          <img 
                            src={file.thumbnail} 
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-2 right-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFileSelection(file.id)}
                            className="rounded border-gray-600 text-amber-600 focus:ring-amber-500 bg-gray-800"
                          />
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <IconComponent className="w-4 h-4 text-white drop-shadow-lg" />
                        </div>
                      </div>
                      
                      <h3 className="cms-text-primary font-medium text-sm mb-1 truncate">{file.name}</h3>
                      <p className="cms-text-tertiary text-xs mb-2">{formatFileSize(file.size)}</p>
                      <div className="flex items-center justify-center space-x-1">
                        {file.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-700 rounded text-xs cms-text-tertiary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFileSelection(file.id)}
                        className="rounded border-gray-600 text-amber-600 focus:ring-amber-500 bg-gray-800"
                      />
                      
                      <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={file.thumbnail} 
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="cms-text-primary font-medium truncate">{file.name}</h3>
                        <p className="cms-text-secondary text-sm">
                          {formatFileSize(file.size)} • {file.type} • {file.dimensions ? `${file.dimensions.width}×${file.dimensions.height}` : file.duration ? formatDuration(file.duration) : ''}
                        </p>
                        <p className="cms-text-tertiary text-xs">by {file.uploadedBy} • {new Date(file.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Eye}
                          onClick={(e) => {
                            e?.stopPropagation();
                            setPreviewFile(file);
                          }}
                          className="cms-btn-ghost-dark"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Download}
                          onClick={(e) => {
                            e?.stopPropagation();
                            // Handle download
                          }}
                          className="cms-btn-ghost-dark"
                        />
                        <div className="relative group">
                          <Button
                            size="sm"
                            variant="outline"
                            icon={MoreVertical}
                            className="cms-btn-ghost-dark"
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm cms-text-secondary hover:bg-gray-700 hover:text-white transition-colors">
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm cms-text-secondary hover:bg-gray-700 hover:text-white transition-colors">
                              <Copy className="w-4 h-4" />
                              <span>Duplicate</span>
                            </button>
                            <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm cms-text-secondary hover:bg-gray-700 hover:text-white transition-colors">
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="cms-card-dark text-center py-16 cms-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Image className="w-12 h-12 cms-text-secondary" />
            </div>
            <h3 className="cms-heading-lg text-white mb-2">
              {searchTerm ? 'No files found' : 'No media files yet'}
            </h3>
            <p className="cms-text-secondary mb-8 max-w-md mx-auto">
              {searchTerm 
                ? 'No files match your search criteria. Try adjusting your search terms or filters.'
                : 'Start building your media library by uploading your first files.'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowUploadModal(true)} 
                icon={Upload} 
                className="cms-btn-primary-dark"
              >
                Upload Your First File
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="cms-card-dark max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="cms-heading-md text-white">{previewFile.name}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  icon={X}
                  onClick={() => setPreviewFile(null)}
                  className="cms-btn-ghost-dark"
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-gray-800 rounded-lg overflow-hidden">
                    {previewFile.type === 'image' ? (
                      <img 
                        src={previewFile.url} 
                        alt={previewFile.name}
                        className="w-full h-auto"
                      />
                    ) : (
                      <div className="aspect-video flex items-center justify-center">
                        {React.createElement(getFileIcon(previewFile.type), {
                          className: "w-24 h-24 cms-text-tertiary"
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block cms-text-secondary text-sm font-medium mb-1">
                      File Details
                    </label>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="cms-text-tertiary">Size:</span>
                        <span className="cms-text-primary">{formatFileSize(previewFile.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="cms-text-tertiary">Type:</span>
                        <span className="cms-text-primary">{previewFile.type}</span>
                      </div>
                      {previewFile.dimensions && (
                        <div className="flex justify-between">
                          <span className="cms-text-tertiary">Dimensions:</span>
                          <span className="cms-text-primary">{previewFile.dimensions.width} × {previewFile.dimensions.height}</span>
                        </div>
                      )}
                      {previewFile.duration && (
                        <div className="flex justify-between">
                          <span className="cms-text-tertiary">Duration:</span>
                          <span className="cms-text-primary">{formatDuration(previewFile.duration)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="cms-text-tertiary">Uploaded:</span>
                        <span className="cms-text-primary">{new Date(previewFile.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="cms-text-tertiary">By:</span>
                        <span className="cms-text-primary">{previewFile.uploadedBy}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block cms-text-secondary text-sm font-medium mb-1">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {previewFile.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-700 rounded text-xs cms-text-secondary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block cms-text-secondary text-sm font-medium mb-1">
                      Alt Text
                    </label>
                    <p className="cms-text-primary text-sm">{previewFile.altText}</p>
                  </div>
                  
                  <div>
                    <label className="block cms-text-secondary text-sm font-medium mb-1">
                      Description
                    </label>
                    <p className="cms-text-primary text-sm">{previewFile.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="cms-card-dark max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="cms-heading-md text-white">Upload Files</h3>
                <Button
                  variant="outline"
                  size="sm"
                  icon={X}
                  onClick={() => setShowUploadModal(false)}
                  className="cms-btn-ghost-dark"
                />
              </div>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 cms-text-tertiary mx-auto mb-4" />
                  <h4 className="cms-text-primary mb-2">Drop files here or click to browse</h4>
                  <p className="cms-text-secondary text-sm mb-4">
                    {allowedTypes ? `Supported formats: ${allowedTypes.join(', ')}` : 'All file types supported'}
                  </p>
                  <input
                    type="file"
                    multiple
                    accept={allowedTypes?.map(type => {
                      switch (type) {
                        case 'image': return 'image/*';
                        case 'video': return 'video/*';
                        case 'audio': return 'audio/*';
                        case 'document': return '.pdf,.doc,.docx,.txt';
                        default: return '*';
                      }
                    }).join(',')}
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      // TODO: Implement file upload logic
                      console.log('Files selected:', e.target.files);
                      setShowUploadModal(false);
                    }}
                  />
                  <label htmlFor="file-upload" className="cms-btn-primary-dark cursor-pointer inline-flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalMediaLibrary;