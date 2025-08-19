import { EmailService } from './email';
import { SMSService } from './sms';
import { prisma } from '@/lib/database/postgresql';

export interface NotificationResult {
  email: { success: boolean; error?: string };
  sms: { success: boolean; error?: string };
}

export class NotificationService {
  /**
   * Send welcome notifications (both email and SMS) to approved applicant
   */
  static async sendWelcomeNotifications(
    applicationId: string,
    email: string,
    phone: string,
    firstName: string,
    lastName: string,
    tempPassword: string
  ): Promise<NotificationResult> {
    console.log(`📢 Sending welcome notifications for application ${applicationId}`);
    
    // Send email and SMS in parallel
    const [emailResult, smsResult] = await Promise.allSettled([
      EmailService.sendWelcomeEmail(applicationId, email, firstName, lastName, tempPassword),
      SMSService.sendCredentialsSMS(applicationId, phone, firstName, email, tempPassword)
    ]);

    const result: NotificationResult = {
      email: emailResult.status === 'fulfilled' 
        ? emailResult.value 
        : { success: false, error: 'Email service failed' },
      sms: smsResult.status === 'fulfilled' 
        ? smsResult.value 
        : { success: false, error: 'SMS service failed' }
    };

    // Update application notification status
    await this.updateApplicationNotificationStatus(
      applicationId,
      result.email.success,
      result.sms.success
    );

    console.log(`📊 Notification results for ${applicationId}:`, {
      email: result.email.success ? '✅' : '❌',
      sms: result.sms.success ? '✅' : '❌'
    });

    return result;
  }

  /**
   * Resend credentials to applicant
   */
  static async resendCredentials(
    applicationId: string,
    email: string,
    phone: string,
    firstName: string,
    lastName: string,
    tempPassword: string,
    method: 'email' | 'sms' | 'both' = 'both'
  ): Promise<NotificationResult> {
    console.log(`🔄 Resending credentials for application ${applicationId} via ${method}`);

    const result: NotificationResult = {
      email: { success: true },
      sms: { success: true }
    };

    if (method === 'email' || method === 'both') {
      result.email = await EmailService.resendCredentials(
        applicationId, email, firstName, lastName, tempPassword
      );
    }

    if (method === 'sms' || method === 'both') {
      result.sms = await SMSService.resendCredentials(
        applicationId, phone, firstName, email, tempPassword
      );
    }

    // Update application notification status if both were attempted
    if (method === 'both') {
      await this.updateApplicationNotificationStatus(
        applicationId,
        result.email.success,
        result.sms.success
      );
    }

    return result;
  }

  /**
   * Send payment reminder notifications
   */
  static async sendPaymentReminder(
    applicationId: string,
    email: string,
    phone: string,
    firstName: string,
    amount: number
  ): Promise<NotificationResult> {
    console.log(`💰 Sending payment reminder for application ${applicationId}`);

    // For payment reminders, we'll primarily use SMS as it's more immediate
    const smsResult = await SMSService.sendPaymentReminder(
      applicationId, phone, firstName, amount
    );

    return {
      email: { success: true }, // Not sending email reminder for now
      sms: smsResult
    };
  }

  /**
   * Update application notification status in database
   */
  private static async updateApplicationNotificationStatus(
    applicationId: string,
    emailSent: boolean,
    smsSent: boolean
  ): Promise<void> {
    try {
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          emailSent,
          smsSent,
          credentialsSentAt: emailSent || smsSent ? new Date() : null,
        }
      });
    } catch (error) {
      console.error('Failed to update application notification status:', error);
    }
  }

  /**
   * Get notification history for an application
   */
  static async getNotificationHistory(applicationId: string) {
    return await prisma.notificationHistory.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get notification statistics for admin dashboard
   */
  static async getNotificationStats() {
    const [totalNotifications, sentNotifications, failedNotifications] = await Promise.all([
      prisma.notificationHistory.count(),
      prisma.notificationHistory.count({
        where: { status: 'SENT' }
      }),
      prisma.notificationHistory.count({
        where: { status: 'FAILED' }
      })
    ]);

    return {
      total: totalNotifications,
      sent: sentNotifications,
      failed: failedNotifications,
      successRate: totalNotifications > 0 ? (sentNotifications / totalNotifications) * 100 : 0
    };
  }

  /**
   * Retry failed notifications
   */
  static async retryFailedNotifications(applicationId: string): Promise<NotificationResult> {
    const failedNotifications = await prisma.notificationHistory.findMany({
      where: {
        applicationId,
        status: 'FAILED'
      },
      include: {
        application: true
      }
    });

    if (failedNotifications.length === 0) {
      return {
        email: { success: true },
        sms: { success: true }
      };
    }

    const application = failedNotifications[0].application;
    if (!application || !application.tempPassword) {
      return {
        email: { success: false, error: 'Application or credentials not found' },
        sms: { success: false, error: 'Application or credentials not found' }
      };
    }

    // Determine which notifications to retry
    const hasFailedEmail = failedNotifications.some(n => n.type === 'EMAIL');
    const hasFailedSMS = failedNotifications.some(n => n.type === 'SMS');

    const result: NotificationResult = {
      email: { success: true },
      sms: { success: true }
    };

    if (hasFailedEmail) {
      result.email = await EmailService.resendCredentials(
        applicationId,
        application.email,
        application.firstName,
        application.lastName,
        application.tempPassword
      );
    }

    if (hasFailedSMS) {
      result.sms = await SMSService.resendCredentials(
        applicationId,
        application.phone,
        application.firstName,
        application.email,
        application.tempPassword
      );
    }

    return result;
  }
}
