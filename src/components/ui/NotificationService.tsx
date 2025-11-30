import React, { useState, useCallback, useEffect } from 'react';
import { 
  Bell, Mail, CheckCircle, AlertTriangle, 
  Info, X, Clock, DollarSign, FileText 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { STATUS_MESSAGES, PAYMENT_MESSAGES, generateNotificationId } from '../../utils/notificationUtils';
import { useNotifications } from './useNotifications';
import { NotificationContext, EmailNotificationData, Notification } from './NotificationContext';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Generate notification ID
  const generateId = useCallback(() => generateNotificationId(), []);

  // Save notification to Supabase
  const saveNotificationToDatabase = useCallback(async (notification: Notification) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .insert([{
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timestamp: notification.timestamp,
          read: notification.read,
          action_url: notification.actionUrl,
          action_label: notification.actionLabel,
          metadata: notification.metadata,
          priority: notification.priority
        }]);

      if (error) {
        console.error('Error saving notification:', error);
      }
    } catch (error) {
      console.error('Error saving notification to database:', error);
    }
  }, []);

  // Update notification read status in database
  const updateNotificationReadStatus = useCallback(async (notificationId: string, read: boolean) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read })
        .eq('id', notificationId);

      if (error) {
        console.error('Error updating notification read status:', error);
      }
    } catch (error) {
      console.error('Error updating notification read status:', error);
    }
  }, []);

  // Mark all notifications as read in database
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  // Delete notification from database
  const deleteNotificationFromDatabase = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
      }
    } catch (error) {
      console.error('Error deleting notification from database:', error);
    }
  }, []);

  // Add notification to state and potentially save to database
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Save to database for persistence
    saveNotificationToDatabase(newNotification);
  }, [generateId, saveNotificationToDatabase]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );

    // Update in database
    updateNotificationReadStatus(notificationId, true);
  }, [updateNotificationReadStatus]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Update all in database
    markAllNotificationsAsRead();
  }, [markAllNotificationsAsRead]);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    deleteNotificationFromDatabase(notificationId);
  }, [deleteNotificationFromDatabase]);

  // Send email notification
  const sendEmailNotification = useCallback(async (emailData: EmailNotificationData) => {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      if (error) {
        console.error('Error sending email notification:', error);
        throw error;
      }

      // Add email notification to in-app notifications
      addNotification({
        type: 'email',
        title: 'Email Sent',
        message: `Email sent to ${Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to}`,
        priority: 'normal'
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
      addNotification({
        type: 'error',
        title: 'Email Failed',
        message: 'Failed to send email notification',
        priority: 'high'
      });
    }
  }, [addNotification]);

  // Create status change notification
  const createStatusChangeNotification = useCallback(async (
    applicationId: string, 
    oldStatus: string, 
    newStatus: string, 
    userEmail: string
  ) => {
    const message = STATUS_MESSAGES[newStatus] || `Application status changed from ${oldStatus} to ${newStatus}`;

    // Add in-app notification
    addNotification({
      type: 'status_change',
      title: 'Application Status Updated',
      message,
      priority: 'normal',
      metadata: { applicationId, oldStatus, newStatus }
    });

    // Send email notification
    await sendEmailNotification({
      to: userEmail,
      subject: `Application Status Update - ${newStatus.toUpperCase()}`,
      template: 'application_status_change',
      data: {
        applicationId,
        oldStatus,
        newStatus,
        message,
        timestamp: new Date().toISOString()
      }
    });
  }, [addNotification, sendEmailNotification]);

  // Create payment notification
  const createPaymentNotification = useCallback(async (
    applicationId: string, 
    paymentStatus: string, 
    userEmail: string
  ) => {
    const message = PAYMENT_MESSAGES[paymentStatus] || `Payment status updated to ${paymentStatus}`;

    // Add in-app notification
    addNotification({
      type: 'payment',
      title: 'Payment Status Update',
      message,
      priority: paymentStatus === 'failed' ? 'high' : 'normal',
      metadata: { applicationId, paymentStatus }
    });

    // Send email notification for payment updates
    if (['completed', 'failed', 'refunded'].includes(paymentStatus)) {
      await sendEmailNotification({
        to: userEmail,
        subject: `Payment ${paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}`,
        template: 'payment_confirmation',
        data: {
          applicationId,
          paymentStatus,
          message,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [addNotification, sendEmailNotification]);

  const loadNotificationsFromDatabase = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      if (data) {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notifications from database:', error);
    }
  }, []);

  // Load notifications from database on mount
  useEffect(() => {
    loadNotificationsFromDatabase();
  }, [loadNotificationsFromDatabase]);

  // Subscribe to real-time notifications
  useEffect(() => {
    const channel = supabase
      .channel('user_notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'user_notifications' 
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const contextValue = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    sendEmailNotification,
    createStatusChangeNotification,
    createPaymentNotification
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Notification Display Component
interface NotificationDisplayProps {
  className?: string;
}

export const NotificationDisplay: React.FC<NotificationDisplayProps> = ({ className = '' }) => {
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = useCallback((type: Notification['type']) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      case 'email': return Mail;
      case 'status_change': return FileText;
      case 'payment': return DollarSign;
      case 'document': return FileText;
      default: return Info;
    }
  }, []);

  const getNotificationColor = useCallback((type: Notification['type']) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'email': return 'text-blue-600 bg-blue-100';
      case 'status_change': return 'text-purple-600 bg-purple-100';
      case 'payment': return 'text-green-600 bg-green-100';
      case 'document': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-1 rounded ${getNotificationColor(notification.type)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-1">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(notification.timestamp).toLocaleString()}</span>
                            </div>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};