import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { ApplicationStatus } from "@/lib/types/applications";
import { authenticateRequest } from "@/lib/api/auth";

// GET /api/admin/applications - Get all applications
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Only admins can view applications
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can view applications" },
        { status: 403 }
      );
    }
    const applications = await prisma.application.findMany({
      include: {
        selectedFeatures: true,
        invoices: {
          include: {
            items: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
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
      selectedFeatures:
        app.selectedFeatures?.map((feature: any) => ({
          id: feature.id,
          applicationId: feature.applicationId,
          featureId: feature.featureId,
          featureName: feature.featureName,
          featureType: feature.featureType,
          isSelected: feature.isSelected,
          createdAt: feature.createdAt.toISOString(),
        })) || [],
      invoices:
        app.invoices?.map((invoice: any) => ({
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
          items:
            invoice.items?.map((item: any) => ({
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
    }));

    return NextResponse.json({ applications: transformedApplications });
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
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
      preferredContact,
      selectedOptionalFeatures,
    } = body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !serviceId ||
      !serviceName
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
        status: "PENDING",
        submittedAt: new Date(),
      },
    });

    // Create selected optional features if any
    if (
      selectedOptionalFeatures &&
      Array.isArray(selectedOptionalFeatures) &&
      selectedOptionalFeatures.length > 0
    ) {
      // First, get the feature details from the pricing items
      const pricingItems = await prisma.serviceItem.findMany({
        where: {
          id: {
            in: selectedOptionalFeatures,
          },
        },
      });

      // Create application features
      const applicationFeatures = pricingItems.map((item) => ({
        applicationId: newApplication.id,
        featureId: item.id,
        featureName: item.name,
        featureType: "feature", // Default to 'feature' since ServiceItem doesn't have type field
        isSelected: true,
      }));

      if (applicationFeatures.length > 0) {
        await prisma.applicationFeature.createMany({
          data: applicationFeatures,
        });
      }
    }

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

    return NextResponse.json(
      { application: transformedApplication },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
