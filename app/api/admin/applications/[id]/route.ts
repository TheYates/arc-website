import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';
import { ApplicationStatus } from '@/lib/types/applications';
import { ApplicationApprovalService } from '@/lib/services/application-approval';

// GET /api/admin/applications/[id] - Get specific application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        selectedFeatures: true,
        invoices: {
          include: {
            items: {
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Transform the data
    const transformedApplication = {
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
      status: application.status.toLowerCase() as ApplicationStatus,
      adminNotes: application.adminNotes,
      processedBy: application.processedBy,
      processedAt: application.processedAt?.toISOString(),

      // User account fields
      userId: application.userId,
      tempPassword: application.tempPassword,
      credentialsSentAt: application.credentialsSentAt?.toISOString(),
      emailSent: application.emailSent,
      smsSent: application.smsSent,

      // Payment tracking fields
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
        items: invoice.items?.map((item: any) => ({
          id: item.id,
          invoiceId: item.invoiceId,
          itemType: item.itemType,
          itemId: item.itemId,
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice.toString()),
          totalPrice: parseFloat(item.totalPrice.toString()),
          sortOrder: item.sortOrder,
        })) || [],
      })) || [],
    };

    return NextResponse.json({ application: transformedApplication });
  } catch (error) {
    console.error('Failed to fetch application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/applications/[id] - Update application (mainly for status changes)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, adminNotes, processedBy } = body;

    // Validate required fields for status updates
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id }
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Handle approval with enhanced flow
    if (status.toLowerCase() === 'approved') {
      const approvalResult = await ApplicationApprovalService.approveApplication(
        id,
        adminNotes || '',
        processedBy || 'admin'
      );

      if (!approvalResult.success) {
        return NextResponse.json(
          { error: approvalResult.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        application: approvalResult.application,
        user: approvalResult.user,
        notifications: approvalResult.notifications
      });
    }

    // Handle rejection (existing logic)
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: status.toUpperCase() as any,
        adminNotes: adminNotes || null,
        processedBy: processedBy || null,
        processedAt: new Date(),
        updatedAt: new Date(),
      }
    });

    // Transform the response
    const transformedApplication = {
      id: updatedApplication.id,
      firstName: updatedApplication.firstName,
      lastName: updatedApplication.lastName,
      email: updatedApplication.email,
      phone: updatedApplication.phone,
      address: updatedApplication.address,
      serviceId: updatedApplication.serviceId,
      serviceName: updatedApplication.serviceName,
      startDate: updatedApplication.startDate,
      duration: updatedApplication.duration,
      careNeeds: updatedApplication.careNeeds,
      preferredContact: updatedApplication.preferredContact,
      submittedAt: updatedApplication.submittedAt.toISOString(),
      status: updatedApplication.status.toLowerCase() as ApplicationStatus,
      adminNotes: updatedApplication.adminNotes,
      processedBy: updatedApplication.processedBy,
      processedAt: updatedApplication.processedAt?.toISOString(),
    };

    return NextResponse.json({ application: transformedApplication });
  } catch (error) {
    console.error('Failed to update application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/applications/[id] - Delete application (soft delete - mark as cancelled)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id }
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // For applications, we might want to actually delete them if they're pending
    // or mark them as cancelled if they're processed
    if (existingApplication.status === 'PENDING') {
      // Hard delete for pending applications
      await prisma.application.delete({
        where: { id }
      });
    } else {
      // Soft delete by updating status for processed applications
      await prisma.application.update({
        where: { id },
        data: {
          adminNotes: `${existingApplication.adminNotes ? existingApplication.adminNotes + ' | ' : ''}Application cancelled by admin`,
          updatedAt: new Date(),
        }
      });
    }

    return NextResponse.json({ 
      message: 'Application deleted successfully',
      applicationId: id 
    });
  } catch (error) {
    console.error('Failed to delete application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}