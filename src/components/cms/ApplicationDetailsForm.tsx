import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, Printer, FileDown, Eye, User, Phone, 
  Briefcase, CreditCard, FileText, Clock, AlertCircle,
  CheckCircle, History, Settings, ChevronDown, ChevronUp, Info, AlertTriangle,
  Heart, Edit3, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getUserPermissions } from '../../utils/permissions';
import { useToast } from '../../hooks/useToast';
import { useNotifications } from '../ui/useNotifications';
import { 
  InlineLoader, ToastLoader, AnimatedCounter, PulseHighlight 
} from '../ui/LoadingStates';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import RichTextEditor from '../ui/RichTextEditor';
import FileUpload from '../ui/FileUpload';

interface ApplicationDetailsFormProps {
  applicationId?: string;
  applicationData?: Record<string, unknown>;
  onClose?: () => void;
  onSave?: (data: Record<string, unknown>) => void;
  isViewOnly?: boolean;
  currentUser?: { id: string; email?: string; [key: string]: unknown };
}

interface ApplicationDetails {
  id: string;
  applicationReferenceNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review' | 'additional_info_required' | 'completed';
  submissionDate: string;
  lastModified: string;
  modifiedBy: string;
  
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  photoUrl?: string;
  
  // Contact Information
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Details
  preferredContactMethod: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  emergencyContactRelationship: string;
  
  // Professional/Background Information
  occupation: string;
  organization: string;
  educationLevel: string;
  workExperience: string;
  skills: string[];
  interests: string[];
  
  // Payment Information
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash' | 'cheque';
  transactionReference: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  amountPaid: number;
  paymentDate: string;
  receiptNumber: string;
  
  // Additional Information
  howDidYouHear: 'website' | 'referral' | 'social_media' | 'advertisement' | 'other';
  referralCode: string;
  specialRequirements: string;
  termsAccepted: boolean;
  termsAcceptedDate: string;
  privacyAccepted: boolean;
  privacyAcceptedDate: string;
  
  // Documents & Attachments
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedDate: string;
    size: number;
  }>;
  
  // Admin Notes (Internal Use Only)
  adminNotes: string;
  reviewHistory: Array<{
    id: string;
    action: string;
    oldValue?: string;
    newValue?: string;
    changedBy: string;
    timestamp: string;
    comment?: string;
  }>;
  assignedTo: string;
  priorityLevel: 'low' | 'normal' | 'high' | 'urgent';
  followUpDate: string;
  
  // Audit Trail
  createdBy: string;
  createdDate: string;
  createdIp: string;
  applicationVersion: string;
  dataValidationStatus: 'complete' | 'incomplete' | 'invalid';
}

const ApplicationDetailsForm: React.FC<ApplicationDetailsFormProps> = ({
  applicationId,
  applicationData,
  onClose,
  onSave,
  isViewOnly = false,
  currentUser
}) => {
  const { showToast } = useToast();
  const { createStatusChangeNotification, createPaymentNotification } = useNotifications();
  
  // State management
  const [application, setApplication] = useState<ApplicationDetails>({
    id: applicationId || '',
    applicationReferenceNumber: '',
    status: 'pending',
    submissionDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    modifiedBy: currentUser?.email || '',
    
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    photoUrl: '',
    
    // Contact Information
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Rwanda',
    
    // Details
    preferredContactMethod: 'email',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactEmail: '',
    emergencyContactRelationship: '',
    
    // Professional/Background Information
    occupation: '',
    organization: '',
    educationLevel: '',
    workExperience: '',
    skills: [],
    interests: [],
    
    // Payment Information
    paymentMethod: 'credit_card',
    transactionReference: '',
    paymentStatus: 'pending',
    amountPaid: 0,
    paymentDate: '',
    receiptNumber: '',
    
    // Additional Information
    howDidYouHear: 'website',
    referralCode: '',
    specialRequirements: '',
    termsAccepted: false,
    termsAcceptedDate: '',
    privacyAccepted: false,
    privacyAcceptedDate: '',
    
    // Documents & Attachments
    documents: [],
    
    // Admin Notes
    adminNotes: '',
    reviewHistory: [],
    assignedTo: currentUser?.id || '',
    priorityLevel: 'normal',
    followUpDate: '',
    
    // Audit Trail
    createdBy: '',
    createdDate: '',
    createdIp: '',
    applicationVersion: '1.0',
    dataValidationStatus: 'incomplete'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveProgress, setSaveProgress] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showToastLoader, setShowToastLoader] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personalInfo: true,
    contactInfo: false,
    professionalInfo: false,
    emergencyContact: false,
    paymentInfo: false,
    additionalInfo: false,
    documents: false,
    adminNotes: false
  });

  // Auto-save functionality
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const originalDataRef = useRef<ApplicationDetails>(application);

  // Permissions
  const permissions = useCallback(() => getUserPermissions(currentUser), [currentUser]);

  // Load application data
  const loadApplication = useCallback(async () => {
    setIsLoading(true);
    try {
      if (applicationData) {
        setApplication(prev => {
          const updatedApplication = { ...prev, ...applicationData };
          originalDataRef.current = updatedApplication;
          return updatedApplication;
        });
        setIsLoading(false);
        return;
      }

      if (applicationId) {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('id', applicationId)
          .single();

        if (error) throw error;

        if (data) {
          setApplication(prev => {
            const updatedApplication = { ...prev, ...data };
            originalDataRef.current = updatedApplication;
            return updatedApplication;
          });
        }
      }
    } catch (error) {
      console.error('Error loading application:', error);
      showToast('Error loading application data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, applicationData, showToast]);

  // Check for unsaved changes
  const checkUnsavedChanges = useCallback((current: ApplicationDetails, original: ApplicationDetails) => {
    const hasChanges = JSON.stringify(current) !== JSON.stringify(original);
    setHasUnsavedChanges(hasChanges);
  }, [setHasUnsavedChanges]);

  // Auto-save functionality
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }

    autoSaveTimeout.current = setTimeout(async () => {
      if (hasUnsavedChanges && !isViewOnly && permissions().canManageForms) {
        try {
          const updatedApplication = {
            ...application,
            lastModified: new Date().toISOString(),
            modifiedBy: currentUser?.email || ''
          };

          if (applicationId) {
            const { error } = await supabase
              .from('applications')
              .update(updatedApplication)
              .eq('id', applicationId);
            if (error) throw error;
          }

          originalDataRef.current = { ...updatedApplication };
          setHasUnsavedChanges(false);
          showToast('Changes saved automatically', 'success');
        } catch (error) {
          console.error('Auto-save error:', error);
        }
      }
    }, 30000); // Auto-save every 30 seconds
  }, [hasUnsavedChanges, isViewOnly, application, applicationId, currentUser, permissions, showToast]);

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof ApplicationDetails, value: unknown) => {
    setApplication(prev => {
      const updated = { ...prev, [field]: value };
      checkUnsavedChanges(updated, originalDataRef.current);
      return updated;
    });
    triggerAutoSave();
  }, [checkUnsavedChanges, triggerAutoSave]);

  // Handle save
  const handleSave = useCallback(async (changeStatus: boolean = false, newStatus?: string) => {
    if (!permissions().canManageForms && !isViewOnly) {
      showToast('You do not have permission to save applications', 'error');
      return;
    }

    setIsSaving(true);
    setSaveProgress(0);
    setShowToastLoader(true);

    try {
      const oldStatus = application.status;
      const updatedApplication = {
        ...application,
        lastModified: new Date().toISOString(),
        modifiedBy: currentUser?.email || '',
        ...(changeStatus && newStatus && { status: newStatus as ApplicationDetails['status'] })
      };

      // Simulate progress steps
      setSaveProgress(25);

      // Save to database
      if (applicationId) {
        const { error } = await supabase
          .from('applications')
          .update(updatedApplication)
          .eq('id', applicationId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('applications')
          .insert([updatedApplication])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setApplication(prev => ({ ...prev, id: data.id }));
        }
      }

      setSaveProgress(50);

      // Add to review history
      const reviewEntry = {
        id: `review_${Date.now()}`,
        action: changeStatus && newStatus ? `Status changed to ${newStatus}` : 'Application updated',
        changedBy: currentUser?.email || '',
        timestamp: new Date().toISOString(),
        comment: changeStatus && newStatus ? `Status updated by ${currentUser?.email}` : 'Manual update'
      };

      setApplication(prev => ({
        ...prev,
        reviewHistory: [...prev.reviewHistory, reviewEntry]
      }));

      setSaveProgress(75);

      // Send notifications with proper error handling
      if (changeStatus && newStatus && newStatus !== oldStatus) {
        try {
          await createStatusChangeNotification(
            applicationId || 'new',
            oldStatus,
            newStatus,
            application.email
          );
        } catch (error) {
          console.error('Error creating status change notification:', error);
        }
      }

      if (application.paymentStatus === 'completed' && changeStatus) {
        try {
          await createPaymentNotification(
            applicationId || 'new',
            application.paymentStatus,
            application.email
          );
        } catch (error) {
          console.error('Error creating payment notification:', error);
        }
      }

      originalDataRef.current = { ...updatedApplication };
      setHasUnsavedChanges(false);
      setSaveProgress(100);
      
      setTimeout(() => {
        showToast('Application saved successfully', 'success');
        onSave?.(updatedApplication);
      }, 500);
    } catch (error) {
      console.error('Error saving application:', error);
      showToast('Error saving application', 'error');
    } finally {
      setTimeout(() => {
        setIsSaving(false);
        setSaveProgress(0);
        setShowToastLoader(false);
      }, 1000);
    }
  }, [application, applicationId, currentUser, permissions, isViewOnly, onSave, showToast, createStatusChangeNotification, createPaymentNotification]);

  // Handle export to PDF
  const handleExportPDF = useCallback(() => {
    // Implementation for PDF export
    showToast('Exporting to PDF...', 'info');
    // This would typically use a library like jsPDF or Puppeteer
  }, [showToast]);

  // Handle print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // File upload handling
  const handleFilesSelected = useCallback((files: File[]) => {
    const newDocuments = files.map(file => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedDate: new Date().toISOString(),
      size: file.size
    }));

    setApplication(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));

    // Show file upload success notification with fallback
    showToast(`${files.length} file(s) uploaded successfully`, 'success');

    setHasUnsavedChanges(true);
    triggerAutoSave();
  }, [triggerAutoSave, showToast]);

  const handleFileRemove = useCallback((fileId: string) => {
    setApplication(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== fileId)
    }));
    setHasUnsavedChanges(true);
    triggerAutoSave();
  }, [triggerAutoSave]);

  const handleFileDownload = useCallback((fileId: string) => {
    const file = application.documents.find(doc => doc.id === fileId);
    if (file?.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [application.documents]);

  const handleFilePreview = useCallback((fileId: string) => {
    const file = application.documents.find(doc => doc.id === fileId);
    if (file?.url) {
      window.open(file.url, '_blank');
    }
  }, [application.documents]);

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Get status badge color
  const getStatusBadgeColor = useCallback((status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
      'under_review': 'bg-blue-100 text-blue-800 border-blue-200',
      'additional_info_required': 'bg-orange-100 text-orange-800 border-orange-200',
      'completed': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  }, []);

  // Get priority badge color
  const getPriorityBadgeColor = useCallback((priority: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800',
      'normal': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  }, []);

  // Load data on mount
  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  // Check for unsaved changes when application data changes
  useEffect(() => {
    checkUnsavedChanges(application, originalDataRef.current);
  }, [application, checkUnsavedChanges]);

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, []);

  // Inject shimmer animation CSS
  useEffect(() => {
    const shimmerKeyframes = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;

    // Inject the CSS if it doesn't exist
    if (!document.querySelector('#shimmer-styles')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles';
      style.textContent = shimmerKeyframes;
      document.head.appendChild(style);
    }
  }, []);

  // Cleanup shimmer styles on unmount
  useEffect(() => {
    return () => {
      const shimmerStyles = document.querySelector('#shimmer-styles');
      if (shimmerStyles) {
        shimmerStyles.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <ToastLoader isVisible={showToastLoader} message={`Saving application... ${saveProgress}%`} />
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading application details...</p>
        </div>
      ) : (
        <>
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Application Details - {application.applicationReferenceNumber || 'New Application'}
                </h1>
                <PulseHighlight isActive={hasUnsavedChanges} className="mt-2">
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(application.status)}`}>
                      {(application.status || 'pending').replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      Submitted: {application.submissionDate ? new Date(application.submissionDate).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className="text-sm text-gray-500">
                      Last Modified: {application.lastModified ? new Date(application.lastModified).toLocaleDateString() : 'N/A'} by {application.modifiedBy || 'N/A'}
                    </span>
                  </div>
                </PulseHighlight>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {hasUnsavedChanges && (
                <div className="flex items-center space-x-2 text-orange-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Unsaved Changes</span>
                </div>
              )}
              
              {!isViewOnly && (
                <Button
                  onClick={() => handleSave()}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="bg-blue-600 hover:bg-blue-700 relative"
                >
                  <div className="flex items-center space-x-2">
                    {isSaving ? (
                      <>
                        <InlineLoader size="sm" />
                        <span>Saving... {saveProgress > 0 && `${saveProgress}%`}</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </div>
                  {isSaving && saveProgress > 0 && (
                    <div className="absolute bottom-0 left-0 h-1 bg-blue-300 transition-all duration-300"
                         style={{ width: `${saveProgress}%` }} />
                  )}
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleExportPDF}
                className="flex items-center space-x-2"
              >
                <FileDown className="w-4 h-4" />
                <span>Export PDF</span>
              </Button>
              
              {onClose && (
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </Button>
              )}
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Form Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Personal Information Section */}
            <Card className="overflow-hidden">
              <div 
                className="flex items-center justify-between p-6 bg-gray-50 border-b cursor-pointer"
                onClick={() => toggleSection('personalInfo')}
              >
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                </div>
                {expandedSections.personalInfo ? 
                  <ChevronUp className="w-5 h-5 text-gray-600" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                }
              </div>
              
              {expandedSections.personalInfo && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="First Name"
                      type="text"
                      value={application.firstName}
                      onChange={(value) => handleFieldChange('firstName', value)}
                      required
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Last Name"
                      type="text"
                      value={application.lastName}
                      onChange={(value) => handleFieldChange('lastName', value)}
                      required
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Date of Birth"
                      type="date"
                      value={application.dateOfBirth}
                      onChange={(value) => handleFieldChange('dateOfBirth', value)}
                      required
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Gender"
                      type="select"
                      value={application.gender}
                      onChange={(value) => handleFieldChange('gender', value)}
                      options={['Male', 'Female', 'Other', 'Prefer not to say']}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Nationality"
                      type="text"
                      value={application.nationality}
                      onChange={(value) => handleFieldChange('nationality', value)}
                      required
                      disabled={isViewOnly}
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Contact Information Section */}
            <Card className="overflow-hidden">
              <div 
                className="flex items-center justify-between p-6 bg-gray-50 border-b cursor-pointer"
                onClick={() => toggleSection('contactInfo')}
              >
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                </div>
                {expandedSections.contactInfo ? 
                  <ChevronUp className="w-5 h-5 text-gray-600" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                }
              </div>
              
              {expandedSections.contactInfo && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Email Address"
                      type="email"
                      value={application.email}
                      onChange={(value) => handleFieldChange('email', value)}
                      required
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Phone Number"
                      type="tel"
                      value={application.phone}
                      onChange={(value) => handleFieldChange('phone', value)}
                      required
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Address"
                      type="text"
                      value={application.address}
                      onChange={(value) => handleFieldChange('address', value)}
                      required
                      disabled={isViewOnly}
                      className="md:col-span-2"
                    />
                    
                    <FormField
                      label="City"
                      type="text"
                      value={application.city}
                      onChange={(value) => handleFieldChange('city', value)}
                      required
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="State/Province"
                      type="text"
                      value={application.state}
                      onChange={(value) => handleFieldChange('state', value)}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="ZIP/Postal Code"
                      type="text"
                      value={application.zipCode}
                      onChange={(value) => handleFieldChange('zipCode', value)}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Country"
                      type="text"
                      value={application.country}
                      onChange={(value) => handleFieldChange('country', value)}
                      required
                      disabled={isViewOnly}
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Professional/Background Information Section */}
            <Card className="overflow-hidden">
              <div 
                className="flex items-center justify-between p-6 bg-gray-50 border-b cursor-pointer"
                onClick={() => toggleSection('professionalInfo')}
              >
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Professional/Background Information</h2>
                </div>
                {expandedSections.professionalInfo ? 
                  <ChevronUp className="w-5 h-5 text-gray-600" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                }
              </div>
              
              {expandedSections.professionalInfo && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Occupation"
                      type="text"
                      value={application.occupation}
                      onChange={(value) => handleFieldChange('occupation', value)}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Organization"
                      type="text"
                      value={application.organization}
                      onChange={(value) => handleFieldChange('organization', value)}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Education Level"
                      type="select"
                      value={application.educationLevel}
                      onChange={(value) => handleFieldChange('educationLevel', value)}
                      options={[
                        'Primary School',
                        'Secondary School',
                        'High School Diploma',
                        'Associate Degree',
                        'Bachelor\'s Degree',
                        'Master\'s Degree',
                        'Doctorate',
                        'Other'
                      ]}
                      disabled={isViewOnly}
                    />
                  </div>
                  
                  <FormField
                    label="Work Experience"
                    type="textarea"
                    value={application.workExperience}
                    onChange={(value) => handleFieldChange('workExperience', value)}
                    rows={4}
                    disabled={isViewOnly}
                  />
                </div>
              )}
            </Card>

            {/* Emergency Contact Section */}
            <Card className="overflow-hidden">
              <div 
                className="flex items-center justify-between p-6 bg-gray-50 border-b cursor-pointer"
                onClick={() => toggleSection('emergencyContact')}
              >
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Emergency Contact</h2>
                </div>
                {expandedSections.emergencyContact ? 
                  <ChevronUp className="w-5 h-5 text-gray-600" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                }
              </div>
              
              {expandedSections.emergencyContact && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Emergency Contact Name"
                      type="text"
                      value={application.emergencyContactName}
                      onChange={(value) => handleFieldChange('emergencyContactName', value)}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Emergency Contact Phone"
                      type="tel"
                      value={application.emergencyContactPhone}
                      onChange={(value) => handleFieldChange('emergencyContactPhone', value)}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Emergency Contact Email"
                      type="email"
                      value={application.emergencyContactEmail}
                      onChange={(value) => handleFieldChange('emergencyContactEmail', value)}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Relationship"
                      type="text"
                      value={application.emergencyContactRelationship}
                      onChange={(value) => handleFieldChange('emergencyContactRelationship', value)}
                      disabled={isViewOnly}
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Payment Information Section */}
            <Card className="overflow-hidden">
              <div 
                className="flex items-center justify-between p-6 bg-gray-50 border-b cursor-pointer"
                onClick={() => toggleSection('paymentInfo')}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
                </div>
                {expandedSections.paymentInfo ? 
                  <ChevronUp className="w-5 h-5 text-gray-600" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                }
              </div>
              
              {expandedSections.paymentInfo && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Payment Method"
                      type="select"
                      value={application.paymentMethod}
                      onChange={(value) => handleFieldChange('paymentMethod', value)}
                      options={['Credit Card', 'Bank Transfer', 'Cash', 'Cheque']}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Transaction Reference"
                      type="text"
                      value={application.transactionReference}
                      onChange={(value) => handleFieldChange('transactionReference', value)}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Payment Status"
                      type="select"
                      value={application.paymentStatus}
                      onChange={(value) => handleFieldChange('paymentStatus', value)}
                      options={['Pending', 'Completed', 'Failed', 'Refunded']}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Amount Paid"
                      type="number"
                      value={application.amountPaid}
                      onChange={(value) => handleFieldChange('amountPaid', value)}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Payment Date"
                      type="date"
                      value={application.paymentDate}
                      onChange={(value) => handleFieldChange('paymentDate', value)}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Receipt Number"
                      type="text"
                      value={application.receiptNumber}
                      onChange={(value) => handleFieldChange('receiptNumber', value)}
                      disabled={isViewOnly}
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Additional Information Section */}
            <Card className="overflow-hidden">
              <div 
                className="flex items-center justify-between p-6 bg-gray-50 border-b cursor-pointer"
                onClick={() => toggleSection('additionalInfo')}
              >
                <div className="flex items-center space-x-3">
                  <Info className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
                </div>
                {expandedSections.additionalInfo ? 
                  <ChevronUp className="w-5 h-5 text-gray-600" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                }
              </div>
              
              {expandedSections.additionalInfo && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="How did you hear about us?"
                      type="select"
                      value={application.howDidYouHear}
                      onChange={(value) => handleFieldChange('howDidYouHear', value)}
                      options={['Website', 'Referral', 'Social Media', 'Advertisement', 'Other']}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Referral Code/Name"
                      type="text"
                      value={application.referralCode}
                      onChange={(value) => handleFieldChange('referralCode', value)}
                      disabled={isViewOnly}
                    />
                  </div>
                  
                  <FormField
                    label="Special Requirements"
                    type="textarea"
                    value={application.specialRequirements}
                    onChange={(value) => handleFieldChange('specialRequirements', value)}
                    rows={3}
                    disabled={isViewOnly}
                  />
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={application.termsAccepted}
                        onChange={(e) => handleFieldChange('termsAccepted', e.target.checked)}
                        disabled={isViewOnly}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-sm text-gray-700">
                        I accept the Terms & Conditions
                        {application.termsAcceptedDate && (
                          <span className="text-gray-500 ml-2">
                            (Accepted: {application.termsAcceptedDate ? new Date(application.termsAcceptedDate).toLocaleDateString() : 'N/A'})
                          </span>
                        )}
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={application.privacyAccepted}
                        onChange={(e) => handleFieldChange('privacyAccepted', e.target.checked)}
                        disabled={isViewOnly}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-sm text-gray-700">
                        I accept the Privacy Policy
                        {application.privacyAcceptedDate && (
                          <span className="text-gray-500 ml-2">
                            (Accepted: {application.privacyAcceptedDate ? new Date(application.privacyAcceptedDate).toLocaleDateString() : 'N/A'})
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Documents & Attachments Section */}
            <Card className="overflow-hidden">
              <div 
                className="flex items-center justify-between p-6 bg-gray-50 border-b cursor-pointer"
                onClick={() => toggleSection('documents')}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Documents & Attachments</h2>
                </div>
                {expandedSections.documents ? 
                  <ChevronUp className="w-5 h-5 text-gray-600" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                }
              </div>
              
              {expandedSections.documents && (
                <div className="p-6">
                  <FileUpload
                    onFilesSelected={handleFilesSelected}
                    acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif']}
                    maxFileSize={10 * 1024 * 1024} // 10MB
                    maxFiles={5}
                    currentFiles={application.documents}
                    onFileRemove={handleFileRemove}
                    onFileDownload={handleFileDownload}
                    onFilePreview={handleFilePreview}
                    disabled={isViewOnly}
                  />
                </div>
              )}
            </Card>

            {/* Admin Notes Section */}
            <Card className="overflow-hidden">
              <div 
                className="flex items-center justify-between p-6 bg-gray-50 border-b cursor-pointer"
                onClick={() => toggleSection('adminNotes')}
              >
                <div className="flex items-center space-x-3">
                  <Edit3 className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Admin Notes (Internal Use Only)</h2>
                </div>
                {expandedSections.adminNotes ? 
                  <ChevronUp className="w-5 h-5 text-gray-600" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                }
              </div>
              
              {expandedSections.adminNotes && (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Internal Comments (Rich Text)
                    </label>
                    <RichTextEditor
                      value={application.adminNotes}
                      onChange={(value) => handleFieldChange('adminNotes', value)}
                      placeholder="Add internal notes about this application..."
                      disabled={isViewOnly}
                      height="200px"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Assigned To"
                      type="select"
                      value={application.assignedTo}
                      onChange={(value) => handleFieldChange('assignedTo', value)}
                      options={['Admin 1', 'Admin 2', 'Manager']}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Priority Level"
                      type="select"
                      value={application.priorityLevel}
                      onChange={(value) => handleFieldChange('priorityLevel', value)}
                      options={['Low', 'Normal', 'High', 'Urgent']}
                      disabled={isViewOnly}
                    />
                    
                    <FormField
                      label="Follow-up Date"
                      type="date"
                      value={application.followUpDate}
                      onChange={(value) => handleFieldChange('followUpDate', value)}
                      disabled={isViewOnly}
                    />
                  </div>
                  
                  {/* Review History */}
                  <div className="mt-6">
                    <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <History className="w-4 h-4 mr-2" />
                      Review History
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {application.reviewHistory.length === 0 ? (
                        <p className="text-gray-500 text-sm">No review history available</p>
                      ) : (
                        application.reviewHistory.map((entry) => (
                          <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                              <p className="text-xs text-gray-500">
                                {entry.changedBy} • {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A'}
                              </p>
                              {entry.comment && (
                                <p className="text-xs text-gray-600 mt-1">{entry.comment}</p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Status Management */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Status Management
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(application.status)}`}>
                      {(application.status || 'pending').replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  {!isViewOnly && (
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleSave(true, 'approved')}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={application.status === 'approved'}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Application
                      </Button>
                      
                      <Button
                        onClick={() => handleSave(true, 'rejected')}
                        className="w-full bg-red-600 hover:bg-red-700"
                        disabled={application.status === 'rejected'}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject Application
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => handleSave(true, 'under_review')}
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Mark Under Review
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Quick Stats
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Application ID</span>
                    <span className="text-sm font-medium text-gray-900">{application.applicationReferenceNumber}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Priority</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(application.priorityLevel)}`}>
                      {(application.priorityLevel || 'normal').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Data Validation</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      (application.dataValidationStatus || 'incomplete') === 'complete' ? 'bg-green-100 text-green-800' :
                      (application.dataValidationStatus || 'incomplete') === 'incomplete' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {(application.dataValidationStatus || 'incomplete').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Documents</span>
                    <span className="text-sm font-medium text-gray-900">
                      <AnimatedCounter value={application.documents.length} />
                    </span>
                  </div>
                </div>
              </Card>

              {/* Unsaved Changes Warning */}
              {hasUnsavedChanges && !isViewOnly && (
                <Card className="p-6 border-orange-200 bg-orange-50">
                  <div className="flex items-center space-x-2 text-orange-800">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="text-sm font-medium">Unsaved Changes</h3>
                  </div>
                  <p className="text-sm text-orange-700 mt-2">
                    You have unsaved changes. The application will auto-save in 30 seconds, or click "Save Changes" to save manually.
                  </p>
                  <Button
                    onClick={() => handleSave()}
                    disabled={isSaving}
                    className="w-full mt-3 bg-orange-600 hover:bg-orange-700"
                  >
                    {isSaving ? 'Saving...' : 'Save Now'}
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 print:hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-6">
              <div>
                <span className="font-medium">Created By:</span> {application.createdBy || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Created Date:</span> {application.createdDate ? new Date(application.createdDate).toLocaleDateString() : 'N/A'}
              </div>
              <div>
                <span className="font-medium">IP Address:</span> {application.createdIp || 'N/A'}
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div>
                <span className="font-medium">Application Version:</span> {application.applicationVersion}
              </div>
              <div>
                <span className="font-medium">Data Validation Status:</span> {application.dataValidationStatus}
              </div>
              <div>
                <span className="font-medium">Last Modified By:</span> {application.modifiedBy || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Last Modified Date:</span> {application.lastModified ? new Date(application.lastModified).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default ApplicationDetailsForm;