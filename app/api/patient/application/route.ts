import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';

// GET /api/patient/application - Get current user's application and payment status
export async function GET(request: NextRequest) {
  try {
    // Get user ID from headers (you'll need to implement auth middleware)
    // For now, we'll get it from query params for testing
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find the user's application
    // For testing, if userId is "test-user-id", find any approved application
    // For real users, try to find their application (any status for now)
    const whereClause = userId === 'test-user-id'
      ? { status: 'APPROVED' as const }
      : { userId: userId };

    let application = await prisma.application.findFirst({
      where: whereClause,
      include: {
        selectedFeatures: true,
        invoices: {
          include: {
            items: true
          }
        },
        paymentAttempts: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        notificationHistory: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        user: {
          include: {
            patient: {
              include: {
                caregiverAssignments: {
                  where: {
                    isActive: true
                  },
                  include: {
                    caregiver: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                      }
                    }
                  }
                },
                reviewerAssignments: {
                  where: {
                    isActive: true
                  },
                  include: {
                    reviewer: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // If no application found for real user, fall back to test data for demo purposes
    if (!application && userId !== 'test-user-id') {
      const testApplication = await prisma.application.findFirst({
        where: { status: 'APPROVED' as const },
        include: {
          selectedFeatures: true,
          invoices: {
            include: {
              items: true
            }
          },
          paymentAttempts: {
            orderBy: {
              createdAt: "desc"
            },
            take: 5
          },
          notificationHistory: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 10
          },
          user: {
            include: {
              patient: {
                include: {
                  caregiverAssignments: {
                    where: {
                      isActive: true
                    },
                    include: {
                      caregiver: {
                        select: {
                          id: true,
                          firstName: true,
                          lastName: true,
                          email: true,
                        }
                      }
                    }
                  },
                  reviewerAssignments: {
                    where: {
                      isActive: true
                    },
                    include: {
                      reviewer: {
                        select: {
                          id: true,
                          firstName: true,
                          lastName: true,
                          email: true,
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (testApplication) {
        application = testApplication;
      }
    }

    if (!application) {
      return NextResponse.json(
        { error: 'No approved application found for this user' },
        { status: 404 }
      );
    }

    // Get patient assignment data
    const patient = application.user?.patient;
    const assignedCaregiver = patient?.caregiverAssignments?.[0];
    const assignedReviewer = patient?.reviewerAssignments?.[0];

    // Transform the data for the frontend
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
      status: application.status.toLowerCase(),
      adminNotes: application.adminNotes,
      processedBy: application.processedBy,
      processedAt: application.processedAt?.toISOString(),

      // User account fields
      userId: application.userId,
      credentialsSentAt: application.credentialsSentAt?.toISOString(),
      emailSent: application.emailSent,
      smsSent: application.smsSent,

      // Payment tracking fields
      paymentStatus: application.paymentStatus?.toLowerCase(),
      paymentMethod: application.paymentMethod,
      paymentReference: application.paymentReference,
      paymentCompletedAt: application.paymentCompletedAt?.toISOString(),

      // Assignment data
      assignedCaregiver: assignedCaregiver ? {
        id: assignedCaregiver.caregiver.id,
        name: `${assignedCaregiver.caregiver.firstName} ${assignedCaregiver.caregiver.lastName}`,
        email: assignedCaregiver.caregiver.email,
        assignedAt: assignedCaregiver.assignedAt.toISOString(),
      } : undefined,

      assignedReviewer: assignedReviewer ? {
        id: assignedReviewer.reviewer.id,
        name: `${assignedReviewer.reviewer.firstName} ${assignedReviewer.reviewer.lastName}`,
        email: assignedReviewer.reviewer.email,
        assignedAt: assignedReviewer.assignedAt.toISOString(),
      } : undefined,

      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
      
      selectedFeatures: application.selectedFeatures?.map((feature) => ({
        id: feature.id,
        applicationId: feature.applicationId,
        featureId: feature.featureId,
        featureName: feature.featureName,
        featureType: feature.featureType,
        isSelected: feature.isSelected,
        createdAt: feature.createdAt.toISOString(),
      })) || [],
      
      invoices: application.invoices?.map((invoice) => ({
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
        items: invoice.items?.map((item) => ({
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
      
      paymentAttempts: application.paymentAttempts?.map((attempt) => ({
        id: attempt.id,
        applicationId: attempt.applicationId,
        invoiceId: attempt.invoiceId,
        amount: parseFloat(attempt.amount.toString()),
        currency: attempt.currency,
        paymentMethod: attempt.paymentMethod,
        paymentProvider: attempt.paymentProvider,
        providerReference: attempt.providerReference,
        status: attempt.status.toLowerCase(),
        failureReason: attempt.failureReason,
        metadata: attempt.metadata,
        initiatedAt: attempt.initiatedAt.toISOString(),
        completedAt: attempt.completedAt?.toISOString(),
        createdAt: attempt.createdAt.toISOString(),
        updatedAt: attempt.updatedAt.toISOString(),
      })) || [],
      
      notificationHistory: application.notificationHistory?.map((notification) => ({
        id: notification.id,
        applicationId: notification.applicationId,
        type: notification.type.toLowerCase(),
        recipient: notification.recipient,
        subject: notification.subject,
        content: notification.content,
        status: notification.status.toLowerCase(),
        sentAt: notification.sentAt?.toISOString(),
        deliveredAt: notification.deliveredAt?.toISOString(),
        errorMessage: notification.errorMessage,
        retryCount: notification.retryCount,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
      })) || [],
    };

    // Determine if user needs to complete payment
    const needsPayment = application.paymentStatus === 'PENDING' && 
                        application.invoices.length > 0 && 
                        !application.invoices.some(inv => inv.status === 'PAID');

    return NextResponse.json({
      success: true,
      application: transformedApplication,
      needsPayment,
      hasInvoice: application.invoices.length > 0,
      paymentStatus: application.paymentStatus?.toLowerCase() || 'pending'
    });

  } catch (error) {
    console.error('Failed to get patient application:', error);

    // Handle specific connection timeout errors
    if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('connection pool'))) {
      return NextResponse.json(
        { error: 'Database connection timeout. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get application data' },
      { status: 500 }
    );
  }
}

// POST /api/patient/application - Create new application (public endpoint)
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
      status: newApplication.status.toLowerCase(),
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
