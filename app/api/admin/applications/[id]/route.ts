import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';
import { ApplicationStatus } from '@/lib/types/applications';

// GET /api/admin/applications/[id] - Get specific application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = await prisma.application.findUnique({
      where: { id }
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

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: status.toUpperCase() as any, // Convert to uppercase for Prisma enum
        adminNotes: adminNotes || null,
        processedBy: processedBy || null,
        processedAt: ['approved', 'rejected'].includes(status.toLowerCase()) 
          ? new Date() 
          : null,
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