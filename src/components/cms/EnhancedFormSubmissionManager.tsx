import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, MessageSquare, Shield, Search, Eye, Edit, UserCheck, X } from 'lucide-react';
import { getUserPermissions, getUserRole } from '../../utils/permissions';
import { useToast } from '../../hooks/useToast';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ApplicationDetailsForm from './ApplicationDetailsForm';

interface EnhancedFormSubmissionManagerProps {
  currentUser?: { id: string; email?: string; [key: string]: unknown };
}

interface FormSubmission {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  status: string;
  submission_date: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

type FormSubmissions = Record<string, FormSubmission[]>;

const EnhancedFormSubmissionManager: React.FC<EnhancedFormSubmissionManagerProps> = ({ currentUser }) => {
  const { showToast } = useToast();
  const [submissions, setSubmissions] = useState<Record<string, FormSubmission[]>>({
    memberships: [],
    volunteers: [],
    partnerships: [],
    contacts: [],
    donations: [],
    philosophyCafe: [],
    leadershipEthics: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('memberships');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('submission_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Permissions
  const permissions = useMemo(() => getUserPermissions(currentUser), [currentUser]);
  const userRole = useMemo(() => getUserRole(currentUser), [currentUser]);

  // Assigned form tabs based on permissions
  const assignedFormTabs = useMemo(() => {
    if (!permissions.canManageForms) return [];

    // Super admin and membership managers get all forms
    if (userRole === 'Super Administrator' || userRole === 'Membership Manager') {
      return ['memberships', 'volunteers', 'partnerships', 'contacts', 'donations', 'philosophyCafe', 'leadershipEthics'];
    }
    // Content managers get all forms
    else if (userRole === 'Content Manager') {
      return ['memberships', 'volunteers', 'partnerships', 'contacts', 'donations', 'philosophyCafe', 'leadershipEthics'];
    }
    // Program coordinators get program-related forms
    else if (userRole === 'Program Coordinator') {
      return ['philosophyCafe', 'leadershipEthics'];
    }
    // Other roles get contact forms
    else {
      return ['contacts'];
    }
  }, [permissions.canManageForms, userRole]);

  // Helper function to get table name
  const getTableName = useCallback((formType: string) => {
    const tableMap: Record<string, string> = {
      'memberships': 'membership_applications',
      'volunteers': 'volunteer_applications', 
      'partnerships': 'partnership_applications',
      'contacts': 'contact_submissions',
      'donations': 'donations',
      'philosophyCafe': 'philosophy_cafe_applications',
      'leadershipEthics': 'leadership_ethics_workshop_registrations'
    };
    return tableMap[formType] || formType;
  }, []);

  // Load submissions function - moved before handlers that use it
  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Define form type configurations
      const formConfigs = [
        { tab: 'memberships', table: 'membership_applications', orderField: 'submission_date' },
        { tab: 'volunteers', table: 'volunteer_applications', orderField: 'submission_date' },
        { tab: 'partnerships', table: 'partnership_applications', orderField: 'submission_date' },
        { tab: 'contacts', table: 'contact_submissions', orderField: 'submission_date' },
        { tab: 'donations', table: 'donations', orderField: 'donation_date' },
        { tab: 'philosophyCafe', table: 'philosophy_cafe_applications', orderField: 'submission_date' },
        { tab: 'leadershipEthics', table: 'leadership_ethics_workshop_registrations', orderField: 'submission_date' }
      ];

      // Filter to only assigned form tabs
      const activeConfigs = formConfigs.filter(config => assignedFormTabs.includes(config.tab));

      // Create load promises with proper error handling
      const loadPromises = activeConfigs.map(async (config): Promise<{ type: string; data: FormSubmission[] }> => {
        try {
          const { data, error } = await supabase
            .from(config.table)
            .select('*')
            .order(config.orderField, { ascending: false });

          if (error) {
            console.error(`Error loading ${config.tab}:`, error);
            return { type: config.tab, data: [] };
          }

          return { type: config.tab, data: (data || []) as FormSubmission[] };
        } catch (error) {
          console.error(`Error loading ${config.tab}:`, error);
          return { type: config.tab, data: [] };
        }
      });

      // Wait for all promises to resolve
      const results = await Promise.all(loadPromises);

      // Create new submissions object without mutating state
      const newSubmissions: Record<string, FormSubmission[]> = {
        memberships: [],
        volunteers: [],
        partnerships: [],
        contacts: [],
        donations: [],
        philosophyCafe: [],
        leadershipEthics: []
      };
      
      results.forEach(result => {
        newSubmissions[result.type] = result.data;
      });

      setSubmissions(newSubmissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
      showToast('Error loading submissions', 'error');
    } finally {
      setLoading(false);
    }
  }, [assignedFormTabs, showToast]);

  // Event handlers
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDateRange({ start: '', end: '' });
    setSortBy('submission_date');
    setSortOrder('desc');
  }, []);

  const handleBulkStatusChange = useCallback(async (newStatus: string) => {
    if (selectedSubmissions.size === 0) return;

    try {
      // Update status for all selected submissions
      const promises = Array.from(selectedSubmissions).map(async (submissionId) => {
        // Find the submission in the appropriate array
        const formType = Object.keys(submissions).find(type => 
          submissions[type as keyof FormSubmissions]?.some(sub => sub.id === submissionId)
        );
        
        if (formType) {
          const { error } = await supabase
            .from(getTableName(formType))
            .update({ status: newStatus })
            .eq('id', submissionId);
          
          if (error) throw error;
        }
      });

      await Promise.all(promises);
      showToast(`Updated ${selectedSubmissions.size} submissions to ${newStatus}`, 'success');
      loadSubmissions();
      setSelectedSubmissions(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error updating submissions:', error);
      showToast('Error updating submissions', 'error');
    }
  }, [selectedSubmissions, submissions, showToast, loadSubmissions, getTableName]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = (submissions[activeTab] || []).map(item => item.id);
      setSelectedSubmissions(new Set(allIds));
      setShowBulkActions(true);
    } else {
      setSelectedSubmissions(new Set());
      setShowBulkActions(false);
    }
  }, [submissions, activeTab]);

  const handleSelectSubmission = useCallback((id: string, checked: boolean) => {
    setSelectedSubmissions(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      setShowBulkActions(newSet.size > 0);
      return newSet;
    });
  }, []);

  const handleBulkExport = useCallback(() => {
    // Implementation for bulk export
    showToast('Export functionality coming soon', 'info');
  }, [showToast]);

  const handleViewDetails = useCallback((item: FormSubmission) => {
    setSelectedSubmission(item);
    setShowDetailsModal(true);
    setIsViewOnly(true);
  }, []);

  const handleEdit = useCallback((item: FormSubmission) => {
    setSelectedSubmission(item);
    setShowDetailsModal(true);
    setIsViewOnly(false);
  }, []);

  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    try {
      const formType = Object.keys(submissions).find(type => 
        submissions[type as keyof FormSubmissions]?.some(sub => sub.id === id)
      );
      
      if (formType) {
        const { error } = await supabase
          .from(getTableName(formType))
          .update({ status: newStatus })
          .eq('id', id);
        
        if (error) throw error;
        
        showToast(`Status updated to ${newStatus}`, 'success');
        loadSubmissions();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Error updating status', 'error');
    }
  }, [submissions, showToast, loadSubmissions, getTableName]);

  const closeDetailsModal = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedSubmission(null);
    setIsViewOnly(false);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadSubmissions();
    // Set default tab to first assigned form
    if (assignedFormTabs.length > 0 && !assignedFormTabs.includes(activeTab)) {
      setActiveTab(assignedFormTabs[0]);
    }
  }, [loadSubmissions, assignedFormTabs, activeTab]);

  // Get status badge color - defined early to avoid Rules of Hooks violations
  const getStatusBadgeColor = useCallback((status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'under_review': 'bg-blue-100 text-blue-800',
      'completed': 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  }, []);

  // Filter and search submissions with enhanced filtering
  const getFilteredSubmissions = useCallback(() => {
    let filtered: FormSubmission[] = submissions[activeTab] || [];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const searchableText = [
          item.first_name || '',
          item.last_name || '',
          item.email || '',
          item.phone || '',
          item.organization_name || '',
          item.contact_person || '',
          item.subject || '',
          item.message || '',
          item.donor_name || ''
        ].join(' ').toLowerCase();
        return searchableText.includes(searchLower);
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Apply priority filter (if priority field exists)
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority_level === priorityFilter);
    }

    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      filtered = filtered.filter(item => {
        const submissionDate = new Date(item.submission_date || item.created_at);
        return submissionDate >= startDate && submissionDate <= endDate;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';

      // Handle date fields
      if (sortBy === 'submission_date' || sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      // Handle numeric fields
      if (sortBy === 'amount') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [submissions, activeTab, searchTerm, statusFilter, priorityFilter, dateRange, sortBy, sortOrder]);

  // Early returns are moved before hooks to prevent Rules of Hooks violations
  if (!permissions.canManageForms) {
    return (
      <Card className="text-center py-12">
        <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
        <p className="text-gray-500 mb-4">
          You don't have permission to view form submissions.
        </p>
        <p className="text-sm text-gray-400">
          Current role: {userRole}<br/>
          Contact admin@benirage.org for access.
        </p>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (assignedFormTabs.length === 0) {
    return (
      <Card className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Forms Assigned</h3>
        <p className="text-gray-500 mb-4">
          You don't have any forms assigned to manage.
        </p>
        <p className="text-sm text-gray-400">
          Current role: {userRole}<br/>
          Contact admin@benirage.org to get form assignments.
        </p>
      </Card>
    );
  }

  // Filter tabs based on user's assigned forms
  const allTabs = [
    { id: 'memberships', name: 'Memberships', count: submissions.memberships.length, icon: Users },
    { id: 'volunteers', name: 'Volunteers', count: submissions.volunteers.length, icon: Users },
    { id: 'partnerships', name: 'Partnerships', count: submissions.partnerships.length, icon: Users },
    { id: 'contacts', name: 'Contacts', count: submissions.contacts.length, icon: MessageSquare },
    { id: 'donations', name: 'Donations', count: submissions.donations.length, icon: Users },
    { id: 'philosophyCafe', name: 'Philosophy Cafe', count: submissions.philosophyCafe.length, icon: Users },
    { id: 'leadershipEthics', name: 'Leadership Ethics', count: submissions.leadershipEthics.length, icon: Users }
  ];
  
  const tabs = allTabs.filter(tab => assignedFormTabs.includes(tab.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Enhanced Form Submissions</h2>
            <p className="text-gray-600">
              Manage your assigned form submissions ({assignedFormTabs.length} form types)
            </p>
          </div>
        </div>

        {/* Enhanced Search and Filter Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search */}
            <div className="lg:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="under_review">Under Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="lg:col-span-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="lg:col-span-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Start date"
              />
            </div>

            <div className="lg:col-span-2">
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="End date"
              />
            </div>

            {/* Sort */}
            <div className="lg:col-span-1">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="submission_date-desc">Date ↓</option>
                <option value="submission_date-asc">Date ↑</option>
                <option value="status-asc">Status ↑</option>
                <option value="status-desc">Status ↓</option>
                <option value="email-asc">Email ↑</option>
                <option value="email-desc">Email ↓</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {getFilteredSubmissions().length} of {submissions[activeTab as keyof FormSubmissions]?.length || 0} submissions
            </div>
            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || dateRange.start || dateRange.end) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedSubmissions.size} submission{selectedSubmissions.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange('approved')}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    Approve Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange('rejected')}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Reject Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkExport}
                  >
                    Export Selected
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedSubmissions(new Set());
                  setShowBulkActions(false);
                }}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-gray-600 hover:text-blue-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {/* Select All Checkbox */}
        <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
          <input
            type="checkbox"
            checked={selectedSubmissions.size === getFilteredSubmissions().length && getFilteredSubmissions().length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <label className="text-sm text-gray-700">
            Select All ({getFilteredSubmissions().length} filtered submissions)
          </label>
        </div>

        {getFilteredSubmissions().length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || dateRange.start || dateRange.end ? 'No Matching Submissions' : 'No Submissions Yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || dateRange.start || dateRange.end
                ? 'Try adjusting your search or filter criteria'
                : activeTab === 'memberships' ? 'Membership applications will appear here' :
                  activeTab === 'volunteers' ? 'Volunteer applications will appear here' :
                  activeTab === 'partnerships' ? 'Partnership applications will appear here' :
                  activeTab === 'contacts' ? 'Contact messages will appear here' :
                  activeTab === 'donations' ? 'Donations will appear here' :
                  activeTab === 'philosophyCafe' ? 'Philosophy Cafe applications will appear here' :
                  'Leadership Ethics workshop registrations will appear here'}
            </p>
          </Card>
        ) : (
          getFilteredSubmissions().map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedSubmissions.has(item.id)}
                    onChange={(e) => handleSelectSubmission(item.id, e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900">
                      {item.first_name && item.last_name ? `${String(item.first_name)} ${String(item.last_name)}` :
                       (String(item.donor_name) || String(item.organization_name) || String(item.contact_person) || 'Unknown')}
                    </h3>
                    <p className="text-gray-600">{item.email}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span>Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <span>
                        Date: {new Date(item.submission_date || item.created_at).toLocaleDateString()}
                      </span>
                      {typeof item.amount === 'number' && item.amount > 0 && <span>Amount: ${item.amount}</span>}
                      {typeof item.age === 'number' && item.age > 0 && <span>Age: {item.age}</span>}
                      {item.phone && <span>Phone: {item.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(item)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {item.status !== 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(item.id, 'approved')}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <UserCheck className="w-4 h-4" />
                      </Button>
                    )}
                    {item.status !== 'rejected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(item.id, 'rejected')}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Enhanced Details Modal using ApplicationDetailsForm */}
      {showDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <div className="p-0">
              <ApplicationDetailsForm
                applicationId={selectedSubmission.id}
                applicationData={selectedSubmission}
                isViewOnly={isViewOnly}
                currentUser={currentUser}
                onClose={closeDetailsModal}
                onSave={() => {
                  loadSubmissions();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFormSubmissionManager;