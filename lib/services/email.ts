import { prisma } from '@/lib/database/postgresql';
import { NotificationType, NotificationStatus } from '@/lib/types/applications';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  /**
   * Send welcome email with credentials to approved applicant
   */
  static async sendWelcomeEmail(
    applicationId: string,
    email: string,
    firstName: string,
    lastName: string,
    tempPassword: string,
    loginUrl: string = `${process.env.NEXT_PUBLIC_APP_URL}/login`
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const template = this.getWelcomeEmailTemplate(
        firstName,
        lastName,
        email,
        tempPassword,
        loginUrl
      );

      // Log notification attempt
      await this.logNotification(
        applicationId,
        'email',
        email,
        template.subject,
        template.html,
        'pending'
      );

      // In a real implementation, you would integrate with an email service like:
      // - SendGrid
      // - AWS SES
      // - Mailgun
      // - Nodemailer with SMTP
      
      // For now, we'll simulate sending the email
      const success = await this.simulateEmailSend(template, email);
      
      if (success) {
        await this.updateNotificationStatus(applicationId, email, 'sent');
        console.log(`✅ Welcome email sent to ${email}`);
        return { success: true };
      } else {
        await this.updateNotificationStatus(applicationId, email, 'failed', 'Simulated failure');
        return { success: false, error: 'Failed to send email' };
      }
    } catch (error) {
      console.error('Email sending error:', error);
      await this.updateNotificationStatus(
        applicationId, 
        email, 
        'failed', 
        error instanceof Error ? error.message : 'Unknown error'
      );
      return { success: false, error: 'Email service error' };
    }
  }

  /**
   * Resend credentials email
   */
  static async resendCredentials(
    applicationId: string,
    email: string,
    firstName: string,
    lastName: string,
    tempPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendWelcomeEmail(applicationId, email, firstName, lastName, tempPassword);
  }

  /**
   * Generate welcome email template
   */
  private static getWelcomeEmailTemplate(
    firstName: string,
    lastName: string,
    email: string,
    tempPassword: string,
    loginUrl: string
  ): EmailTemplate {
    const subject = `Welcome to Alpha Rescue Consult - Your Account is Ready!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Alpha Rescue Consult</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .credentials { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Alpha Rescue Consult!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName} ${lastName},</h2>
            <p>Congratulations! Your application has been approved and your account has been created.</p>
            
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>
            
            <p>You can now log in to view your invoice and complete your payment to access your dashboard.</p>
            
            <a href="${loginUrl}" class="button">Login to Your Account</a>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Click the login button above or visit our website</li>
              <li>Log in with your credentials</li>
              <li>Review your invoice details</li>
              <li>Complete your payment via Mobile Money</li>
              <li>Access your full dashboard and services</li>
            </ol>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Welcome aboard!</p>
            <p>The Alpha Rescue Consult Team</p>
          </div>
          <div class="footer">
            <p>© 2025 Alpha Rescue Consult. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome to Alpha Rescue Consult!

Hello ${firstName} ${lastName},

Congratulations! Your application has been approved and your account has been created.

Your Login Credentials:
Email: ${email}
Temporary Password: ${tempPassword}

You can now log in to view your invoice and complete your payment to access your dashboard.

Login URL: ${loginUrl}

Next Steps:
1. Visit our website and log in with your credentials
2. Review your invoice details
3. Complete your payment via Mobile Money
4. Access your full dashboard and services

If you have any questions or need assistance, please contact our support team.

Welcome aboard!
The Alpha Rescue Consult Team

© 2025 Alpha Rescue Consult. All rights reserved.
    `;

    return { subject, html, text };
  }

  /**
   * Simulate email sending (replace with real email service)
   */
  private static async simulateEmailSend(template: EmailTemplate, email: string): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    
    if (success) {
      console.log(`📧 Email sent to ${email}: ${template.subject}`);
    } else {
      console.log(`❌ Failed to send email to ${email}`);
    }
    
    return success;
  }

  /**
   * Log notification attempt to database
   */
  private static async logNotification(
    applicationId: string,
    type: NotificationType,
    recipient: string,
    subject: string,
    content: string,
    status: NotificationStatus
  ): Promise<void> {
    await prisma.notificationHistory.create({
      data: {
        applicationId,
        type: type.toUpperCase() as any,
        recipient,
        subject,
        content,
        status: status.toUpperCase() as any,
        sentAt: status === 'sent' ? new Date() : null,
      }
    });
  }

  /**
   * Update notification status in database
   */
  private static async updateNotificationStatus(
    applicationId: string,
    recipient: string,
    status: NotificationStatus,
    errorMessage?: string
  ): Promise<void> {
    const latestNotification = await prisma.notificationHistory.findFirst({
      where: {
        applicationId,
        recipient,
        type: 'EMAIL'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (latestNotification) {
      await prisma.notificationHistory.update({
        where: { id: latestNotification.id },
        data: {
          status: status.toUpperCase() as any,
          sentAt: status === 'sent' ? new Date() : latestNotification.sentAt,
          deliveredAt: status === 'delivered' ? new Date() : null,
          errorMessage: errorMessage || null,
        }
      });
    }
  }
}
