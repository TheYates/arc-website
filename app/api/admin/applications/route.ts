import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';
import { ApplicationStatus } from '@/lib/types/applications';

// GET /api/admin/applications - Get all applications
export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // Transform the data to match our ApplicationData type
    const transformedApplications = applications.map((app: any) => ({
      id: app.id,
      firstName: app.firstName,
      lastName: app.lastName,
      email: app.email,
      phone: app.phone,
      address: app.address,
      serviceId: app.serviceId,
      serviceName: app.serviceName,
      startDate: app.startDate,
      duration: app.duration,
      careNeeds: app.careNeeds,
      preferredContact: app.preferredContact,
      submittedAt: app.submittedAt.toISOString(),
      status: app.status.toLowerCase() as ApplicationStatus,
      adminNotes: app.adminNotes,
      processedBy: app.processedBy,
      processedAt: app.processedAt?.toISOString(),
    }));

    return NextResponse.json({ applications: transformedApplications });
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST /api/admin/applications - Create new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      address, 
      serviceId, 
      serviceName, 
      startDate, 
      duration, 
      careNeeds, 
      preferredContact 
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !serviceId || !serviceName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create application
    const newApplication = await prisma.application.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address: address || null,
        serviceId,
        serviceName,
        startDate: startDate || null,
        duration: duration || null,
        careNeeds: careNeeds || null,
        preferredContact: preferredContact || null,
        status: 'PENDING',
        submittedAt: new Date(),
      }
    });

    // Transform the response
    const transformedApplication = {
      id: newApplication.id,
      firstName: newApplication.firstName,
      lastName: newApplication.lastName,
      email: newApplication.email,
      phone: newApplication.phone,
      address: newApplication.address,
      serviceId: newApplication.serviceId,
      serviceName: newApplication.serviceName,
      startDate: newApplication.startDate,
      duration: newApplication.duration,
      careNeeds: newApplication.careNeeds,
      preferredContact: newApplication.preferredContact,
      submittedAt: newApplication.submittedAt.toISOString(),
      status: newApplication.status.toLowerCase() as ApplicationStatus,
      adminNotes: newApplication.adminNotes,
      processedBy: newApplication.processedBy,
      processedAt: newApplication.processedAt?.toISOString(),
    };

    return NextResponse.json({ application: transformedApplication }, { status: 201 });
  } catch (error) {
    console.error('Failed to create application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}