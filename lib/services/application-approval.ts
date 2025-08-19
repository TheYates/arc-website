import { prisma } from '@/lib/database/postgresql';
import { generateTempPassword, hashPassword } from '@/lib/utils/password';
import { NotificationService } from './notifications';
import { ApplicationData } from '@/lib/types/applications';

export interface ApprovalResult {
  success: boolean;
  application?: ApplicationData;
  user?: {
    id: string;
    email: string;
    tempPassword: string;
  };
  notifications?: {
    email: { success: boolean; error?: string };
    sms: { success: boolean; error?: string };
  };
  error?: string;
}

export class ApplicationApprovalService {
  /**
   * Approve application with full user creation and notification flow
   */
  static async approveApplication(
    applicationId: string,
    adminNotes: string,
    processedBy: string
  ): Promise<ApprovalResult> {
    console.log(`🔄 Starting approval process for application ${applicationId}`);

    try {
      // Get the application
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          selectedFeatures: true,
          invoices: true
        }
      });

      if (!application) {
        return { success: false, error: 'Application not found' };
      }

      if (application.status !== 'PENDING') {
        return { success: false, error: 'Application is not pending approval' };
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: application.email }
      });

      if (existingUser) {
        return { success: false, error: 'A user with this email already exists' };
      }

      // Generate temporary password
      const tempPassword = generateTempPassword(application.firstName);
      const hashedPassword = await hashPassword(tempPassword);

      // Create user and update application in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user account
        const user = await tx.user.create({
          data: {
            email: application.email,
            username: this.generateUsername(application.firstName, application.lastName),
            passwordHash: hashedPassword,
            firstName: application.firstName,
            lastName: application.lastName,
            phone: application.phone,
            address: application.address,
            role: 'PATIENT',
            isEmailVerified: false,
            isActive: true,
            profileComplete: true,
            mustChangePassword: false, // As per requirements, no forced password change
          }
        });

        // Create patient record
        const patient = await tx.patient.create({
          data: {
            userId: user.id,
            careLevel: 'MEDIUM',
            status: 'STABLE',
            assignedDate: new Date(),
            medicalRecordNumber: `ARC-PAT-${Date.now()}`, // Simple MRN generation
          }
        });

        // Update application status and link to user
        const updatedApplication = await tx.application.update({
          where: { id: applicationId },
          data: {
            status: 'APPROVED',
            adminNotes,
            processedBy,
            processedAt: new Date(),
            userId: user.id,
            tempPassword, // Store for potential resending
            paymentStatus: 'PENDING',
            updatedAt: new Date(),
          },
          include: {
            selectedFeatures: true,
            invoices: true,
            user: true,
          }
        });

        return { user, patient, application: updatedApplication };
      });

      console.log(`✅ User created and application approved for ${result.user.email}`);

      // Send welcome notifications
      const notifications = await NotificationService.sendWelcomeNotifications(
        applicationId,
        result.user.email,
        result.user.phone || application.phone,
        result.user.firstName,
        result.user.lastName,
        tempPassword
      );

      // Transform application data for response
      const transformedApplication = this.transformApplicationData(result.application);

      return {
        success: true,
        application: transformedApplication,
        user: {
          id: result.user.id,
          email: result.user.email,
          tempPassword
        },
        notifications
      };

    } catch (error) {
      console.error('Application approval error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Resend credentials to approved applicant
   */
  static async resendCredentials(
    applicationId: string,
    method: 'email' | 'sms' | 'both' = 'both'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { user: true }
      });

      if (!application) {
        return { success: false, error: 'Application not found' };
      }

      if (application.status !== 'APPROVED' || !application.user || !application.tempPassword) {
        return { success: false, error: 'Application not approved or credentials not available' };
      }

      const notifications = await NotificationService.resendCredentials(
        applicationId,
        application.user.email,
        application.user.phone || application.phone,
        application.user.firstName,
        application.user.lastName,
        application.tempPassword,
        method
      );

      const success = method === 'both' 
        ? (notifications.email.success || notifications.sms.success)
        : method === 'email' 
          ? notifications.email.success 
          : notifications.sms.success;

      return { success };

    } catch (error) {
      console.error('Resend credentials error:', error);
      return { success: false, error: 'Failed to resend credentials' };
    }
  }

  /**
   * Generate unique username from name
   */
  private static generateUsername(firstName: string, lastName: string): string {
    const base = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z.]/g, '');
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
    return `${base}.${timestamp}`;
  }

  /**
   * Transform Prisma application data to ApplicationData interface
   */
  private static transformApplicationData(application: any): ApplicationData {
    return {
      id: application.id,
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone,
      address: application.address,
      serviceId: application.serviceId,
      serviceName: application.serviceName,
      startDate: application.startDate,
      duration: application.duration,
      careNeeds: application.careNeeds,
      preferredContact: application.preferredContact,
      submittedAt: application.submittedAt.toISOString(),
      status: application.status.toLowerCase(),
      adminNotes: application.adminNotes,
      processedBy: application.processedBy,
      processedAt: application.processedAt?.toISOString(),
      userId: application.userId,
      tempPassword: application.tempPassword,
      credentialsSentAt: application.credentialsSentAt?.toISOString(),
      emailSent: application.emailSent,
      smsSent: application.smsSent,
      paymentStatus: application.paymentStatus?.toLowerCase(),
      paymentMethod: application.paymentMethod,
      paymentReference: application.paymentReference,
      paymentCompletedAt: application.paymentCompletedAt?.toISOString(),
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
      selectedFeatures: application.selectedFeatures?.map((feature: any) => ({
        id: feature.id,
        applicationId: feature.applicationId,
        featureId: feature.featureId,
        featureName: feature.featureName,
        featureType: feature.featureType,
        isSelected: feature.isSelected,
        createdAt: feature.createdAt.toISOString(),
      })) || [],
      invoices: application.invoices?.map((invoice: any) => ({
        id: invoice.id,
        applicationId: invoice.applicationId,
        invoiceNumber: invoice.invoiceNumber,
        basePrice: parseFloat(invoice.basePrice.toString()),
        totalAmount: parseFloat(invoice.totalAmount.toString()),
        currency: invoice.currency,
        status: invoice.status.toLowerCase(),
        dueDate: invoice.dueDate?.toISOString(),
        paidDate: invoice.paidDate?.toISOString(),
        paymentMethod: invoice.paymentMethod,
        notes: invoice.notes,
        createdBy: invoice.createdBy,
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
        items: invoice.items || [],
      })) || [],
    };
  }

  /**
   * Get approval statistics for admin dashboard
   */
  static async getApprovalStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: 'PENDING' } }),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      prisma.application.count({ where: { status: 'REJECTED' } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      approvalRate: total > 0 ? (approved / total) * 100 : 0,
    };
  }
}
