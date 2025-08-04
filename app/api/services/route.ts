import { NextRequest, NextResponse } from 'next/server';
import { getAllServices, createService } from '@/lib/api/services-sqlite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    const services = getAllServices(includeInactive);
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Get services API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const serviceData = await request.json();

    if (!serviceData.name || !serviceData.slug || !serviceData.displayName || !serviceData.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const service = createService(serviceData);
    return NextResponse.json({ service });
  } catch (error) {
    console.error('Create service API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
