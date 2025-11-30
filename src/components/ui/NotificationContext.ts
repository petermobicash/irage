import { createContext } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'email' | 'status_change' | 'payment' | 'document';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  sendEmailNotification: (emailData: EmailNotificationData) => Promise<void>;
  createStatusChangeNotification: (applicationId: string, oldStatus: string, newStatus: string, userEmail: string) => Promise<void>;
  createPaymentNotification: (applicationId: string, paymentStatus: string, userEmail: string) => Promise<void>;
}

export interface EmailNotificationData {
  to: string | string[];
  subject: string;
  template: 'application_status_change' | 'payment_confirmation' | 'document_received' | 'application_submitted' | 'general';
  data: Record<string, unknown>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);