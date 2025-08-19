import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = id;

    // Fetch all invoices for this application
    const invoices = await prisma.invoice.findMany({
      where: {
        applicationId: applicationId
      },
      include: {
        items: {
          orderBy: {
            sortOrder: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the response to match frontend expectations
    const transformedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      applicationId: invoice.applicationId,
      invoiceNumber: invoice.invoiceNumber,
      basePrice: parseFloat(invoice.basePrice.toString()),
      totalAmount: parseFloat(invoice.totalAmount.toString()),
      currency: invoice.currency,
      status: invoice.status.toLowerCase(), // Convert to lowercase for frontend
      dueDate: invoice.dueDate?.toISOString(),
      paidDate: invoice.paidDate?.toISOString(),
      paymentMethod: invoice.paymentMethod,
      notes: invoice.notes,
      createdBy: invoice.createdBy,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      items: invoice.items.map(item => ({
        id: item.id,
        invoiceId: item.invoiceId,
        itemType: item.itemType,
        itemId: item.itemId,
        itemName: item.itemName,
        description: item.description,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
        totalPrice: parseFloat(item.totalPrice.toString()),
        sortOrder: item.sortOrder
      }))
    }));

    return NextResponse.json(transformedInvoices);
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
