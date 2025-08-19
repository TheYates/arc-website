import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';

// POST /api/admin/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      applicationId,
      invoiceNumber,
      basePrice,
      totalAmount,
      currency,
      status,
      dueDate,
      notes,
      items
    } = body;

    // Validate required fields
    if (!applicationId || !invoiceNumber || totalAmount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create invoice with items in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the invoice
      const newInvoice = await tx.invoice.create({
        data: {
          applicationId,
          invoiceNumber,
          basePrice: basePrice || 0,
          totalAmount,
          currency: currency || 'GHS',
          status: status || 'PENDING',
          dueDate: dueDate ? new Date(dueDate) : null,
          notes: notes || null,
          createdBy: 'admin', // TODO: Get from auth context
        }
      });

      // Create invoice items if provided
      if (items && Array.isArray(items) && items.length > 0) {
        const invoiceItems = items.map((item: any, index: number) => ({
          invoiceId: newInvoice.id,
          itemType: item.itemType || 'addon',
          itemId: item.itemId || null,
          itemName: item.itemName,
          description: item.description || null,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          totalPrice: item.totalPrice || (item.quantity * item.unitPrice),
          sortOrder: item.sortOrder !== undefined ? item.sortOrder : index,
        }));

        await tx.invoiceItem.createMany({
          data: invoiceItems
        });
      }

      // Return the complete invoice with items
      return await tx.invoice.findUnique({
        where: { id: newInvoice.id },
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
      items: result!.items.map((item: any) => ({
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

    return NextResponse.json({ invoice: transformedInvoice }, { status: 201 });
  } catch (error) {
    console.error('Failed to create invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

// GET /api/admin/invoices - Get all invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    const whereClause = applicationId ? { applicationId } : {};

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        items: {
          orderBy: { sortOrder: 'asc' }
        },
        application: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            serviceName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data
    const transformedInvoices = invoices.map((invoice: any) => ({
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
      application: invoice.application,
      items: invoice.items.map((item: any) => ({
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
    }));

    return NextResponse.json({ invoices: transformedInvoices });
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
