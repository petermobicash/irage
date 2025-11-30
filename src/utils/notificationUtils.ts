// Notification utility functions and constants
export const NOTIFICATION_CONFIG = {
  MAX_NOTIFICATIONS: 50,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  DEBOUNCE_DELAY: 300
};

export const STATUS_MESSAGES: Record<string, string> = {
  'pending': 'Application submitted and pending review',
  'under_review': 'Application is now under review',
  'approved': 'Application has been approved',
  'rejected': 'Application has been rejected',
  'additional_info_required': 'Additional information required',
  'completed': 'Application process completed'
};

export const PAYMENT_MESSAGES: Record<string, string> = {
  'pending': 'Payment is being processed',
  'completed': 'Payment has been completed successfully',
  'failed': 'Payment failed - please try again',
  'refunded': 'Payment has been refunded'
};

export const generateNotificationId = (): string => {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};