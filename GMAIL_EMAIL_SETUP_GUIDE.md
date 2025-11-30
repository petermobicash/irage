# Gmail Email Notification System Setup Guide

## Overview

The BENIRAGE Gmail Email Notification System allows administrators to send bulk email notifications to different user groups (membership, donors, volunteers, and partners) through Gmail integration.

## Features

- **Bulk Email Sending**: Send notifications to selected user groups
- **Template System**: Pre-built email templates (welcome, announcement, event, update)
- **User Group Targeting**: Filter by membership, volunteers, donors, partners
- **Delivery Tracking**: Monitor email delivery status and analytics
- **Personalization**: Custom recipient names in email content
- **Gmail Integration**: Uses Gmail API for reliable email delivery

## Prerequisites

1. Gmail account (nyirurugoclvr@gmail.com is pre-configured)
2. Google Cloud Platform account
3. Supabase project with proper database setup
4. BENIRAGE web application running

## Step 1: Google Cloud Console Setup

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "BENIRAGE Email Notifications"
4. Click "Create"

### 1.2 Enable Gmail API
1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on "Gmail API" and press "Enable"

### 1.3 Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type (unless you have Google Workspace)
3. Fill in required information:
   - App name: "BENIRAGE Email System"
   - User support email: nyirurugoclvr@gmail.com
   - Developer contact: nyirurugoclvr@gmail.com
4. Add scopes: `https://www.googleapis.com/auth/gmail.send`
5. Add test users: nyirurugoclvr@gmail.com

### 1.4 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Configure:
   - Name: "BENIRAGE Web Client"
   - Authorized JavaScript origins: 
     - http://localhost:3000 (for development)
     - https://your-domain.com (for production)
   - Authorized redirect URIs:
     - http://localhost:3000/auth/gmail/callback
     - https://your-domain.com/auth/gmail/callback
5. Click "Create"
6. Copy the Client ID and Client Secret

## Step 2: Environment Configuration

### 2.1 Update .env File
Add the following variables to your `.env` file:

```bash
# Gmail API Configuration
VITE_GMAIL_CLIENT_ID=your_actual_client_id_here
VITE_GMAIL_CLIENT_SECRET=your_actual_client_secret_here
VITE_GMAIL_API_KEY=your_api_key_here
VITE_GMAIL_REDIRECT_URI=http://localhost:3000/auth/gmail/callback

# Alternative SMTP Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=nyirurugoclvr@gmail.com
SMTP_PASS=your_app_password_here

# Email Configuration
GMAIL_SENDER_EMAIL=nyirurugoclvr@gmail.com
GMAIL_SENDER_NAME=BENIRAGE Organization
```

### 2.2 Gmail App Password Setup (Alternative to OAuth)
If you prefer using SMTP with app passwords instead of OAuth:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Go to "Security" → "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Enter "BENIRAGE Notification System"
6. Copy the generated password and add to `SMTP_PASS`

## Step 3: Database Setup

The system uses two main tables for email tracking:

1. **bulk_email_logs**: Tracks bulk email campaigns
2. **email_notifications**: Tracks individual email notifications

These tables are automatically created when you run the migrations:

```bash
# Apply database migrations
supabase db push --linked
```

## Step 4: Accessing the Email System

### 4.1 Admin Access
1. Log into the BENIRAGE admin panel
2. Navigate to "Bulk Email Notifications" or use the URL: `/admin?section=email`
3. The BulkNotificationCenter component will load

### 4.2 Using the Email System
1. **Compose Tab**: Create and send new email campaigns
2. **History Tab**: View recent email activity
3. **Analytics Tab**: Monitor email statistics and performance

## Step 5: Email Templates

### Available Templates

1. **Welcome**: For new member introductions
2. **Announcement**: General organizational announcements
3. **Event**: Event invitations and notifications
4. **Update**: Organization updates and news
5. **Custom**: Free-form messages with custom HTML

### Template Personalization
All templates support personalization with the `{{RECIPIENT_NAME}}` placeholder, which is automatically replaced with the recipient's actual name.

## User Groups

The system can target the following user groups:

- **Membership**: Approved membership applications
- **Volunteers**: Approved volunteer applications
- **Donors**: Completed donations
- **Partners**: Approved partnership applications
- **All Users**: Combined list from all groups

## Security Features

- **Row Level Security (RLS)**: Email logs are protected
- **Authentication Required**: Only authenticated admin users can access
- **Permission-based Access**: Role-based access control
- **Rate Limiting**: Prevents email abuse
- **Delivery Tracking**: All emails are logged for audit

## Troubleshooting

### Common Issues

1. **Gmail API Authentication Failed**
   - Verify OAuth credentials in Google Cloud Console
   - Check redirect URIs match exactly
   - Ensure Gmail API is enabled

2. **No Recipients Found**
   - Check user group tables have data
   - Verify user status is 'approved'
   - Confirm email addresses are not null

3. **SMTP Connection Failed**
   - Verify app password is correct
   - Check 2FA is enabled on Gmail account
   - Confirm SMTP settings

4. **Database Errors**
   - Ensure migrations are applied
   - Check RLS policies are properly configured
   - Verify service role key has correct permissions

### Debug Mode

Enable debug logging by checking browser console output. The system logs:
- Email sending attempts
- Authentication status
- Database queries
- Template generation

## Production Deployment

### 1. Environment Updates
- Update redirect URIs to production domain
- Configure production SMTP settings
- Set up SSL certificates

### 2. Google Cloud Console
- Move app from testing to production
- Verify domain ownership
- Update OAuth consent screen

### 3. Security Checklist
- ✅ Enable 2FA on Gmail account
- ✅ Use app-specific passwords
- ✅ Configure proper CORS settings
- ✅ Enable HTTPS everywhere
- ✅ Set up monitoring and alerts

## API Reference

### GmailNotificationService Methods

```typescript
// Get users by category
await gmailNotificationService.getUsersByCategory('membership');

// Send bulk notification
await gmailNotificationService.sendBulkNotification({
  subject: 'Welcome to BENIRAGE',
  message: 'Thank you for joining...',
  template: 'welcome',
  recipients: [...],
  priority: 'normal'
});

// Get email statistics
await gmailNotificationService.getEmailStats();
```

## Support

For technical support or questions:
- Email: nyirurugoclvr@gmail.com
- Documentation: Check browser console for detailed logs
- Database: Use Supabase dashboard to monitor email logs

---

**Last Updated**: November 25, 2025
**Version**: 1.0.0
**Status**: Ready for Production Use