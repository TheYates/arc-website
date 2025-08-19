import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';

// POST /api/admin/applications/[id]/create-invoice - Create invoice for approved application
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { basePrice = 500, currency = 'GHS', dueDate } = body;

    // Check if application exists and is approved
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        selectedFeatures: true,
        invoices: true
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Application must be approved to create invoice' },
        { status: 400 }
      );
    }

    // Check if invoice already exists
    if (application.invoices.length > 0) {
      return NextResponse.json(
        { error: 'Invoice already exists for this application' },
        { status: 400 }
      );
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${application.id.slice(-6).toUpperCase()}`;

    // Calculate total amount (base price + selected features)
    let totalAmount = basePrice;
    const invoiceItems = [];

    // Add base service item
    invoiceItems.push({
      itemType: 'service',
      itemName: application.serviceName,
      description: `Base service package for ${application.serviceName}`,
      quantity: 1,
      unitPrice: basePrice,
      totalPrice: basePrice,
      sortOrder: 0
    });

    // Add selected features (if any)
    if (application.selectedFeatures && application.selectedFeatures.length > 0) {
      application.selectedFeatures.forEach((feature, index) => {
        const featurePrice = 50; // Default feature price
        totalAmount += featurePrice;
        
        invoiceItems.push({
          itemType: feature.featureType,
          itemName: feature.featureName,
          description: `Additional feature: ${feature.featureName}`,
          quantity: 1,
          unitPrice: featurePrice,
          totalPrice: featurePrice,
          sortOrder: index + 1
        });
      });
    }

    // Create invoice with items in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create invoice
      const invoice = await tx.invoice.create({
        data: {
          applicationId: application.id,
          invoiceNumber,
          basePrice,
          totalAmount,
          currency,
          status: 'PENDING',
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          createdBy: 'system',
        }
      });

      // Create invoice items
      await tx.invoiceItem.createMany({
        data: invoiceItems.map(item => ({
          invoiceId: invoice.id,
          ...item
        }))
      });

      // Get the complete invoice with items
      return await tx.invoice.findUnique({
        where: { id: invoice.id },
        include: {
          items: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      });
    });

    // Transform the response
    const transformedInvoice = {
      id: result!.id,
      applicationId: result!.applicationId,
      invoiceNumber: result!.invoiceNumber,
      basePrice: parseFloat(result!.basePrice.toString()),
      totalAmount: parseFloat(result!.totalAmount.toString()),
      currency: result!.currency,
      status: result!.status.toLowerCase(),
      dueDate: result!.dueDate?.toISOString(),
      paidDate: result!.paidDate?.toISOString(),
      paymentMethod: result!.paymentMethod,
      notes: result!.notes,
      createdBy: result!.createdBy,
      createdAt: result!.createdAt.toISOString(),
      updatedAt: result!.updatedAt.toISOString(),
      items: result!.items.map(item => ({
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
      }))
    };

    return NextResponse.json({
      success: true,
      invoice: transformedInvoice,
      message: `Invoice ${invoiceNumber} created successfully`
    });

  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
