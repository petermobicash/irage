/**
 * Bulk Email Notification Center for BENIRAGE
 * Admin interface for sending notifications to membership, donors, volunteers, and partners
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Users, Send, Clock, CheckCircle, AlertCircle, Settings, Eye, BarChart3 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { 
  gmailNotificationService, 
  NotificationData, 
  Recipient 
} from '../../utils/gmailNotifications';
import { useToast } from '../../hooks/useToast';

interface EmailStats {
  totalSent: number;
  byType: Record<string, number>;
  recentEmails: Array<{
    id: string;
    recipient_email: string;
    subject: string;
    notification_type: string;
    created_at: string;
    status: string;
  }>;
}

interface FormDataType {
  subject: string;
  message: string;
  template: 'welcome' | 'announcement' | 'update' | 'event' | 'custom';
  priority: 'low' | 'normal' | 'high';
  fromName: string;
  replyTo: string;
  scheduleDate: string;
  recipientGroups: string[];
  customHtml: string;
}

const BulkNotificationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compose' | 'history' | 'analytics'>('compose');
  const [isLoading, setIsLoading] = useState(false);
  const [availableRecipients, setAvailableRecipients] = useState<Record<string, number>>({});
  const [emailStats, setEmailStats] = useState<EmailStats>({ 
    totalSent: 0, 
    byType: {}, 
    recentEmails: [] 
  });
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState<FormDataType>({
    subject: '',
    message: '',
    template: 'custom',
    priority: 'normal',
    fromName: 'BENIRAGE Organization',
    replyTo: 'nyirurugoclvr@gmail.com',
    scheduleDate: '',
    recipientGroups: [],
    customHtml: ''
  });

  const { showToast } = useToast();

  const loadRecipientCounts = useCallback(async (): Promise<void> => {
    try {
      const categories = ['membership', 'volunteer', 'donor', 'partner'] as const;
      const counts: Record<string, number> = {};

      for (const category of categories) {
        const recipients = await gmailNotificationService.getUsersByCategory(category);
        counts[category] = recipients?.length || 0;
      }

      const allRecipients = await gmailNotificationService.getUsersByCategory('all');
      counts['all'] = allRecipients?.length || 0;

      setAvailableRecipients(counts);
    } catch (error) {
      console.error('Failed to load recipient counts:', error);
      showToast('Failed to load recipient counts', 'error');
    }
  }, [showToast]);

  const loadEmailStats = useCallback(async (): Promise<void> => {
    try {
      const stats = await gmailNotificationService.getEmailStats();
      setEmailStats(stats || { totalSent: 0, byType: {}, recentEmails: [] });
    } catch (error) {
      console.error('Failed to load email stats:', error);
      showToast('Failed to load email statistics', 'error');
    }
  }, [showToast]);

  // Load recipient counts and email stats
  useEffect(() => {
    void loadRecipientCounts();
    void loadEmailStats();
  }, [loadRecipientCounts, loadEmailStats]);

  const handleGroupSelection = (group: string, selected: boolean): void => {
    if (selected) {
      setSelectedGroups(prev => [...prev, group]);
    } else {
      setSelectedGroups(prev => prev.filter(g => g !== group));
    }
  };

  const handleSendNotification = async (): Promise<void> => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      showToast('Please fill in subject and message fields', 'error');
      return;
    }

    if (selectedGroups.length === 0) {
      showToast('Please select at least one recipient group', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      // Get recipients for selected groups
      let allRecipients: Recipient[] = [];
      
      for (const group of selectedGroups) {
        const recipients = await gmailNotificationService.getUsersByCategory(
          group as 'membership' | 'volunteer' | 'donor' | 'partner' | 'all'
        );
        if (recipients && recipients.length > 0) {
          allRecipients = [...allRecipients, ...recipients];
        }
      }

      // Remove duplicates
      const uniqueRecipients = allRecipients.filter((user, index, self) =>
        index === self.findIndex(u => u.email === user.email)
      );

      if (uniqueRecipients.length === 0) {
        throw new Error('No valid recipients found');
      }

      const notificationData: NotificationData = {
        subject: formData.subject,
        message: formData.message,
        template: formData.template,
        priority: formData.priority,
        fromName: formData.fromName,
        recipients: uniqueRecipients,
        htmlContent: formData.customHtml,
        replyTo: formData.replyTo,
        scheduledDate: formData.scheduleDate || undefined
      };

      const result = await gmailNotificationService.sendBulkNotification(notificationData);
      
      if (result && result.total > 0) {
        showToast(
          `✅ Successfully sent ${result.success} emails${result.failed > 0 ? ` (${result.failed} failed)` : ''}`, 
          'success'
        );
        await loadEmailStats(); // Refresh stats
        
        // Reset form
        setFormData(prev => ({
          ...prev,
          subject: '',
          message: '',
          customHtml: ''
        }));
        setSelectedGroups([]);
      } else {
        throw new Error('No recipients found');
      }
    } catch (error) {
      console.error('Failed to send notifications:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to send notifications. Please try again.', 
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalSelectedRecipients = (): number => {
    return selectedGroups.reduce((total, group) => {
      return total + (availableRecipients[group] || 0);
    }, 0);
  };

  const renderComposeTab = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(availableRecipients)
          .filter(([, count]) => count > 0)
          .map(([group, count]) => (
          <Card 
            key={group} 
            className={`p-4 cursor-pointer transition-all ${
              selectedGroups.includes(group) 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`} 
            onClick={() => handleGroupSelection(group, !selectedGroups.includes(group))}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{count}</div>
              <div className="text-sm text-gray-600 capitalize">
                {group === 'all' ? 'Total' : `${group.replace('_', ' ')}s`}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recipient Selection */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Select Recipient Groups ({getTotalSelectedRecipients()} selected)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(availableRecipients)
            .filter(([, count]) => count > 0)
            .map(([group, count]) => (
            <label 
              key={group} 
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedGroups.includes(group)}
                onChange={(e) => handleGroupSelection(group, e.target.checked)}
                className="rounded"
              />
              <div className="flex-1">
                <div className="font-medium capitalize">
                  {group === 'all' ? 'All Users' : `${group.replace('_', ' ')}s`}
                </div>
                <div className="text-sm text-gray-600">
                  {count} {count === 1 ? 'recipient' : 'recipients'}
                </div>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {/* Email Form */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Compose Email
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="From Name"
              type="text"
              value={formData.fromName}
              onChange={(value) => setFormData({ ...formData, fromName: String(value) })}
              placeholder="BENIRAGE Organization"
            />
            <FormField
              label="Reply To"
              type="email"
              value={formData.replyTo}
              onChange={(value) => setFormData({ ...formData, replyTo: String(value) })}
              placeholder="nyirurugoclvr@gmail.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Email Template"
              type="select"
              value={formData.template}
              onChange={(value) => setFormData({ 
                ...formData, 
                template: value as FormDataType['template']
              })}
              options={[
                { value: 'custom', label: 'Custom Message' },
                { value: 'welcome', label: 'Welcome Message' },
                { value: 'announcement', label: 'General Announcement' },
                { value: 'event', label: 'Event Invitation' },
                { value: 'update', label: 'Organization Update' }
              ]}
            />
            <FormField
              label="Priority"
              type="select"
              value={formData.priority}
              onChange={(value) => setFormData({ 
                ...formData, 
                priority: value as FormDataType['priority']
              })}
              options={[
                { value: 'low', label: 'Low Priority' },
                { value: 'normal', label: 'Normal Priority' },
                { value: 'high', label: 'High Priority' }
              ]}
            />
            <FormField
              label="Schedule Date (Optional)"
              type="text"
              value={formData.scheduleDate}
              onChange={(value) => {
                const dateValue = String(value);
                // Basic date format validation
                if (dateValue === '' || /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dateValue)) {
                  setFormData({ ...formData, scheduleDate: dateValue });
                }
              }}
              placeholder="YYYY-MM-DD HH:MM"
            />
          </div>

          <FormField
            label="Subject"
            type="text"
            value={formData.subject}
            onChange={(value) => setFormData({ ...formData, subject: String(value) })}
            placeholder="Enter email subject..."
            required
          />

          <FormField
            label="Message"
            type="textarea"
            value={formData.message}
            onChange={(value) => setFormData({ ...formData, message: String(value) })}
            placeholder="Enter your message..."
            rows={6}
            required
          />

          {formData.template === 'custom' && (
            <FormField
              label="Custom HTML Content (Optional)"
              type="textarea"
              value={formData.customHtml}
              onChange={(value) => setFormData({ ...formData, customHtml: String(value) })}
              placeholder="<div>Custom HTML content...</div>"
              rows={4}
            />
          )}

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>

          {showPreview && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-2">Email Preview</h4>
              <div className="text-sm space-y-2">
                <div>
                  <strong>From:</strong> {formData.fromName} &lt;{formData.replyTo}&gt;
                </div>
                <div><strong>Subject:</strong> {formData.subject}</div>
                <div>
                  <strong>Recipients:</strong> {getTotalSelectedRecipients()} users ({selectedGroups.join(', ')})
                </div>
                <div><strong>Template:</strong> {formData.template}</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Send Button */}
      <div className="flex justify-end space-x-4">
        <Button
          onClick={handleSendNotification}
          disabled={
            isLoading || 
            !formData.subject.trim() || 
            !formData.message.trim() || 
            selectedGroups.length === 0
          }
          className="flex items-center"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Sending...
            </div>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send to {getTotalSelectedRecipients()} Recipients
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Recent Email Activity
        </h3>
        
        {emailStats.recentEmails && emailStats.recentEmails.length > 0 ? (
          <div className="space-y-3">
            {emailStats.recentEmails.map((email) => (
              <div key={email.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{email.subject}</div>
                  <div className="text-sm text-gray-600">{email.recipient_email}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(email.created_at).toLocaleString()} • {email.notification_type}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {email.status === 'sent' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm capitalize">{email.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No email history found</p>
          </div>
        )}
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{emailStats.totalSent}</div>
            <div className="text-gray-600">Total Emails Sent</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {(() => {
                const totalRecipients = Object.values(availableRecipients).reduce((a, b) => a + b, 0);
                return totalRecipients > 0 
                  ? Math.round((emailStats.totalSent / totalRecipients) * 100) 
                  : 0;
              })()}%
            </div>
            <div className="text-gray-600">Coverage Rate</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {Object.keys(emailStats.byType || {}).length}
            </div>
            <div className="text-gray-600">Email Types Used</div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Email Types Distribution
        </h3>
        
        {emailStats.byType && Object.keys(emailStats.byType).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(emailStats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="capitalize">{type.replace('_', ' ')}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${
                          emailStats.totalSent > 0 
                            ? (count / emailStats.totalSent) * 100 
                            : 0
                        }%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No email analytics available yet</p>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Recipient Database Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(availableRecipients).map(([group, count]) => (
            <div key={group} className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{count}</div>
              <div className="text-sm text-gray-600 capitalize">
                {group === 'all' ? 'Total Users' : `${group.replace('_', ' ')}s`}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Email Notifications</h1>
          <p className="text-gray-600">
            Send notifications to membership, donors, volunteers, and partners
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              void loadRecipientCounts();
            }}
          >
            🔄 Refresh
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'compose', label: 'Compose', icon: Mail },
            { id: 'history', label: 'History', icon: Clock },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'compose' | 'history' | 'analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'compose' && renderComposeTab()}
      {activeTab === 'history' && renderHistoryTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
    </div>
  );
};

export default BulkNotificationCenter;