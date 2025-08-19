import { prisma } from '@/lib/database/postgresql';
import { NotificationType, NotificationStatus } from '@/lib/types/applications';

export interface SMSData {
  to: string;
  message: string;
}

export class SMSService {
  /**
   * Send SMS with credentials to approved applicant
   */
  static async sendCredentialsSMS(
    applicationId: string,
    phone: string,
    firstName: string,
    email: string,
    tempPassword: string,
    loginUrl: string = `${process.env.NEXT_PUBLIC_APP_URL}/login`
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const message = this.getCredentialsSMSTemplate(
        firstName,
        email,
        tempPassword,
        loginUrl
      );

      // Log notification attempt
      await this.logNotification(
        applicationId,
        'sms',
        phone,
        message,
        'pending'
      );

      // In a real implementation, you would integrate with an SMS service like:
      // - Twilio
      // - AWS SNS
      // - Africa's Talking
      // - Hubtel (for Ghana)
      // - Vodafone SMS API
      
      // For now, we'll simulate sending the SMS
      const success = await this.simulateSMSSend(message, phone);
      
      if (success) {
        await this.updateNotificationStatus(applicationId, phone, 'sent');
        console.log(`✅ SMS sent to ${phone}`);
        return { success: true };
      } else {
        await this.updateNotificationStatus(applicationId, phone, 'failed', 'Simulated failure');
        return { success: false, error: 'Failed to send SMS' };
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      await this.updateNotificationStatus(
        applicationId, 
        phone, 
        'failed', 
        error instanceof Error ? error.message : 'Unknown error'
      );
      return { success: false, error: 'SMS service error' };
    }
  }

  /**
   * Resend credentials SMS
   */
  static async resendCredentials(
    applicationId: string,
    phone: string,
    firstName: string,
    email: string,
    tempPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendCredentialsSMS(applicationId, phone, firstName, email, tempPassword);
  }

  /**
   * Send payment reminder SMS
   */
  static async sendPaymentReminder(
    applicationId: string,
    phone: string,
    firstName: string,
    amount: number,
    loginUrl: string = `${process.env.NEXT_PUBLIC_APP_URL}/login`
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const message = `Hi ${firstName}! Your Alpha Rescue Consult invoice of GHS ${amount.toFixed(2)} is ready for payment. Login to complete: ${loginUrl}`;

      await this.logNotification(applicationId, 'sms', phone, message, 'pending');
      const success = await this.simulateSMSSend(message, phone);
      
      if (success) {
        await this.updateNotificationStatus(applicationId, phone, 'sent');
        return { success: true };
      } else {
        await this.updateNotificationStatus(applicationId, phone, 'failed', 'Simulated failure');
        return { success: false, error: 'Failed to send SMS' };
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      return { success: false, error: 'SMS service error' };
    }
  }

  /**
   * Generate credentials SMS template
   */
  private static getCredentialsSMSTemplate(
    firstName: string,
    email: string,
    tempPassword: string,
    loginUrl: string
  ): string {
    return `Hi ${firstName}! Your Alpha Rescue Consult account is ready. Login: ${email} | Password: ${tempPassword} | ${loginUrl}`;
  }

  /**
   * Simulate SMS sending (replace with real SMS service)
   */
  private static async simulateSMSSend(message: string, phone: string): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate 90% success rate (SMS can be less reliable than email)
    const success = Math.random() > 0.1;
    
    if (success) {
      console.log(`📱 SMS sent to ${phone}: ${message.substring(0, 50)}...`);
    } else {
      console.log(`❌ Failed to send SMS to ${phone}`);
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
    content: string,
    status: NotificationStatus
  ): Promise<void> {
    await prisma.notificationHistory.create({
      data: {
        applicationId,
        type: type.toUpperCase() as any,
        recipient,
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
        type: 'SMS'
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

  /**
   * Format phone number for SMS (ensure proper format)
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 0, replace with country code (assuming Ghana +233)
    if (cleaned.startsWith('0')) {
      cleaned = '233' + cleaned.substring(1);
    }
    
    // If it doesn't start with country code, add it
    if (!cleaned.startsWith('233')) {
      cleaned = '233' + cleaned;
    }
    
    return '+' + cleaned;
  }

  /**
   * Validate phone number format
   */
  static isValidPhoneNumber(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);
    // Ghana phone numbers should be +233 followed by 9 digits
    return /^\+233\d{9}$/.test(formatted);
  }
}
