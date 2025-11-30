/**
 * Gmail Notification System for BENIRAGE
 * Handles sending notifications to different user groups through Gmail API
 */

interface GmailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  apiKey: string;
  principalEmail: string;
}

interface Recipient {
  email: string;
  name?: string;
  type: 'membership' | 'volunteer' | 'donor' | 'partner';
}

interface NotificationData {
  subject: string;
  message: string;
  htmlContent?: string;
  template?: 'welcome' | 'announcement' | 'update' | 'event' | 'custom';
  recipients: Recipient[];
  priority: 'low' | 'normal' | 'high';
  scheduledDate?: string;
  fromName?: string;
  replyTo?: string;
}

interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

class GmailNotificationService {
  private config: GmailConfig;

  constructor() {
    this.config = {
      clientId: process.env.VITE_GMAIL_CLIENT_ID || '',
      clientSecret: process.env.VITE_GMAIL_CLIENT_SECRET || '',
      redirectUri: process.env.VITE_GMAIL_REDIRECT_URI || 'http://localhost:3000/auth/gmail/callback',
      apiKey: process.env.VITE_GMAIL_API_KEY || '',
      principalEmail: 'nyirurugoclvr@gmail.com'
    };
  }

  /**
   * Initialize Gmail API authentication
   */
  async initializeAuth(): Promise<boolean> {
    try {
      // For development - using SMTP approach initially
      // In production, you would implement OAuth2 flow
      console.log('🔐 Gmail Notification Service initialized for:', this.config.principalEmail);
      return true;
    } catch (error) {
      console.error('Failed to initialize Gmail auth:', error);
      return false;
    }
  }

  /**
   * Get users from different categories for notifications
   */
  async getUsersByCategory(category: 'membership' | 'volunteer' | 'donor' | 'partner' | 'all'): Promise<Recipient[]> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      let users: Recipient[] = [];

      switch (category) {
        case 'membership': {
          const { data: members } = await supabase
            .from('membership_applications')
            .select('email, first_name, last_name')
            .eq('status', 'approved')
            .not('email', 'is', null);
          
          users = members?.map(member => ({
            email: member.email,
            name: `${member.first_name} ${member.last_name}`,
            type: 'membership' as const
          })) || [];
          break;
        }
        case 'volunteer': {
          const { data: volunteers } = await supabase
            .from('volunteer_applications')
            .select('email, first_name, last_name')
            .eq('status', 'approved')
            .not('email', 'is', null);
          
          users = volunteers?.map(volunteer => ({
            email: volunteer.email,
            name: `${volunteer.first_name} ${volunteer.last_name}`,
            type: 'volunteer' as const
          })) || [];
          break;
        }
        case 'donor': {
          const { data: donors } = await supabase
            .from('donations')
            .select('donor_email, donor_name')
            .eq('payment_status', 'completed')
            .not('donor_email', 'is', null);
          
          users = donors?.map(donor => ({
            email: donor.donor_email,
            name: donor.donor_name,
            type: 'donor' as const
          })) || [];
          break;
        }
        case 'partner': {
          const { data: partners } = await supabase
            .from('partnership_applications')
            .select('email, contact_person')
            .eq('status', 'approved')
            .not('email', 'is', null);
          
          users = partners?.map(partner => ({
            email: partner.email,
            name: partner.contact_person,
            type: 'partner' as const
          })) || [];
          break;
        }

        case 'all': {
          // Get all users from all categories
          const allRecipients = await Promise.all([
            this.getUsersByCategory('membership'),
            this.getUsersByCategory('volunteer'),
            this.getUsersByCategory('donor'),
            this.getUsersByCategory('partner')
          ]);
          users = allRecipients.flat();
          break;
        }
      }

      // Remove duplicates based on email
      const uniqueUsers = users.filter((user, index, self) =>
        index === self.findIndex(u => u.email === user.email)
      );

      return uniqueUsers;
    } catch (error) {
      console.error('Error fetching users by category:', error);
      return [];
    }
  }

  /**
   * Generate email template based on type
   */
  private generateTemplate(data: NotificationData): EmailTemplate {
    const fromName = data.fromName || 'BENIRAGE Organization';
    const organizationLogo = '/benirage.png';

    switch (data.template) {
      case 'welcome':
        return {
          subject: data.subject,
          htmlBody: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to BENIRAGE</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
                <img src="${organizationLogo}" alt="BENIRAGE Logo" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to BENIRAGE</h1>
                <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Building Unity Through Cultural Heritage</p>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea;">
                <h2 style="color: #667eea; margin-top: 0;">Dear {{RECIPIENT_NAME}},</h2>
                <p style="font-size: 16px; margin-bottom: 20px;">${data.message}</p>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
                  <ul style="color: #666; line-height: 1.8;">
                    <li>Stay connected with our community events</li>
                    <li>Participate in our cultural and spiritual programs</li>
                    <li>Engage with fellow members and volunteers</li>
                    <li>Contribute to our mission of unity and heritage preservation</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://benirage.org" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Visit Our Website</a>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 12px; color: #94a3b8; margin-bottom: 5px;">© 2025 BENIRAGE Organization. All rights reserved.</p>
                <p style="font-size: 12px; color: #94a3b8;">${this.config.principalEmail} | +250 XXX XXX XXX</p>
              </div>
            </body>
            </html>
          `,
          textBody: `
Welcome to BENIRAGE!

Dear {{RECIPIENT_NAME}},

${data.message}

What's Next?
- Stay connected with our community events
- Participate in our cultural and spiritual programs
- Engage with fellow members and volunteers
- Contribute to our mission of unity and heritage preservation

Visit our website: https://benirage.org

Best regards,
${fromName}
BENIRAGE Organization
${this.config.principalEmail}
          `
        };

      case 'announcement':
        return {
          subject: data.subject,
          htmlBody: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${data.subject}</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #1e40af; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
                <img src="${organizationLogo}" alt="BENIRAGE Logo" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 15px;">
                <h1 style="color: white; margin: 0; font-size: 24px;">BENIRAGE Announcement</h1>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px;">
                <h2 style="color: #1e40af; margin-top: 0;">${data.subject}</h2>
                <div style="font-size: 16px; line-height: 1.8;">
                  ${data.message.replace(/\n/g, '<br>')}
                </div>
                
                ${data.htmlContent || ''}
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 12px; color: #94a3b8;">© 2025 BENIRAGE Organization</p>
              </div>
            </body>
            </html>
          `,
          textBody: `
BENIRAGE Announcement

${data.subject}

${data.message}

${data.htmlContent || ''}

© 2025 BENIRAGE Organization
          `
        };

      case 'event':
        return {
          subject: data.subject,
          htmlBody: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${data.subject}</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
                <img src="${organizationLogo}" alt="BENIRAGE Logo" style="width: 70px; height: 70px; border-radius: 50%; margin-bottom: 15px;">
                <h1 style="color: white; margin: 0; font-size: 26px;">📅 BENIRAGE Event Invitation</h1>
              </div>
              
              <div style="background-color: #fffbeb; padding: 25px; border-radius: 8px; border: 2px solid #f59e0b;">
                <h2 style="color: #d97706; margin-top: 0;">${data.subject}</h2>
                <div style="font-size: 16px; line-height: 1.8; color: #374151;">
                  ${data.message.replace(/\n/g, '<br>')}
                </div>
                
                ${data.htmlContent || ''}
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://benirage.org/events" style="background-color: #f59e0b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">RSVP Now</a>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 12px; color: #94a3b8;">Questions? Contact us at ${this.config.principalEmail}</p>
              </div>
            </body>
            </html>
          `,
          textBody: `
📅 BENIRAGE Event Invitation

${data.subject}

${data.message}

${data.htmlContent || ''}

RSVP: https://benirage.org/events

Questions? Contact us at ${this.config.principalEmail}
          `
        };

      default:
        return {
          subject: data.subject,
          htmlBody: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${data.subject}</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #4f46e5; padding: 25px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
                <img src="${organizationLogo}" alt="BENIRAGE Logo" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 15px;">
                <h1 style="color: white; margin: 0; font-size: 22px;">BENIRAGE</h1>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px;">
                <h2 style="color: #4f46e5; margin-top: 0;">${data.subject}</h2>
                <div style="font-size: 16px; line-height: 1.8;">
                  Dear {{RECIPIENT_NAME}},
                  <br><br>
                  ${data.message.replace(/\n/g, '<br>')}
                </div>
                
                ${data.htmlContent || ''}
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 12px; color: #94a3b8;">© 2025 BENIRAGE Organization</p>
              </div>
            </body>
            </html>
          `,
          textBody: `
BENIRAGE

${data.subject}

Dear {{RECIPIENT_NAME}},

${data.message}

${data.htmlContent || ''}

© 2025 BENIRAGE Organization
          `
        };
    }
  }

  /**
   * Send individual email using Gmail API
   */
  async sendEmail(to: string, subject: string, htmlBody: string, textBody: string, fromName?: string): Promise<boolean> {
    try {
      // For development - simulating email sending
      console.log('📧 Sending email:', {
        to,
        subject,
        fromName: fromName || 'BENIRAGE Organization',
        timestamp: new Date().toISOString()
      });

      // In production, you would use Gmail API with OAuth2 authentication:
      // const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${accessToken}`, // accessToken would be obtained via OAuth2 flow
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     raw: this.createEmailRaw(fromName || 'BENIRAGE Organization', to, subject, htmlBody, textBody)
      //   })
      // });
      // TODO: Implement createEmailRaw method to encode email for Gmail API format

      // For now, we'll use SMTP as fallback
      await this.sendViaSMTP(to, subject, htmlBody, textBody, fromName);
      
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send email via SMTP (development fallback)
   */
  private async sendViaSMTP(to: string, subject: string, htmlBody: string, textBody: string, fromName?: string): Promise<void> {
    // In production, implement SMTP with proper credentials
    console.log('📤 SMTP Email (Development Mode):', {
      to,
      subject,
      from: this.config.principalEmail,
      timestamp: new Date().toISOString()
    });
    
    // Store email in database for tracking
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase.from('email_notifications').insert({
        recipient_email: to,
        subject: subject,
        message_preview: textBody.substring(0, 200),
        notification_type: 'bulk_notification',
        status: 'sent',
        metadata: {
          html_body: htmlBody,
          text_body: textBody,
          from_name: fromName || 'BENIRAGE Organization',
          sent_via: 'smtp'
        }
      });
    } catch (error) {
      console.error('Failed to log email notification:', error);
    }
  }

  /**
   * Send bulk notifications to a specific user group
   */
  async sendBulkNotification(notificationData: NotificationData): Promise<{ success: number; failed: number; total: number }> {
    try {
      await this.initializeAuth();
      
      let recipients = notificationData.recipients;
      
      // If recipients not provided, fetch all users
      if (recipients.length === 0) {
        recipients = await this.getUsersByCategory('all');
      }

      const template = this.generateTemplate(notificationData);
      
      let success = 0;
      let failed = 0;
      const total = recipients.length;

      console.log(`🚀 Starting bulk email sending to ${total} recipients...`);

      // Process in batches to avoid overwhelming the server
      const batchSize = 10;
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (recipient) => {
          const personalizedHtml = template.htmlBody.replace(/{{RECIPIENT_NAME}}/g, recipient.name || 'Valued Member');
          const personalizedText = template.textBody.replace(/{{RECIPIENT_NAME}}/g, recipient.name || 'Valued Member');
          
          const emailSent = await this.sendEmail(
            recipient.email,
            template.subject,
            personalizedHtml,
            personalizedText,
            notificationData.fromName
          );
          
          if (emailSent) {
            success++;
          } else {
            failed++;
          }
          
          // Small delay between emails to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        });

        await Promise.all(batchPromises);
        
        console.log(`📊 Batch ${Math.floor(i/batchSize) + 1} completed: ${success} sent, ${failed} failed`);
      }

      // Log the bulk notification
      try {
        const { supabase } = await import('../lib/supabase');
        await supabase.from('bulk_email_logs').insert({
          subject: notificationData.subject,
          total_recipients: total,
          successful_sends: success,
          failed_sends: failed,
          notification_type: 'bulk_notification',
          template_used: notificationData.template,
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to log bulk email:', error);
      }

      return { success, failed, total };
    } catch (error) {
      console.error('Bulk email sending failed:', error);
      return { success: 0, failed: notificationData.recipients.length, total: notificationData.recipients.length };
    }
  }

  /**
   * Get email statistics and logs
   */
  async getEmailStats(startDate?: string, endDate?: string) {
    try {
      const { supabase } = await import('../lib/supabase');
      
      let query = supabase.from('email_notifications').select('*');
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const stats = {
        totalSent: data?.length || 0,
        byType: {} as Record<string, number>,
        recentEmails: data?.slice(0, 10) || []
      };
      
      data?.forEach(email => {
        const type = email.notification_type || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Failed to get email stats:', error);
      return { totalSent: 0, byType: {}, recentEmails: [] };
    }
  }
}

// Create singleton instance
export const gmailNotificationService = new GmailNotificationService();

// Export types and utility functions
export type { Recipient, NotificationData, GmailConfig };
export { GmailNotificationService };