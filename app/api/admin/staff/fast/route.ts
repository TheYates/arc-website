import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';

// Ultra-fast endpoint for staff data
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parallel queries for staff data
    const [caregivers, reviewers] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'CAREGIVER' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
        orderBy: [
          { firstName: 'asc' },
          { lastName: 'asc' }
        ],
        take: 100 // Reasonable limit
      }),

      prisma.user.findMany({
        where: { role: 'REVIEWER' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
        orderBy: [
          { firstName: 'asc' },
          { lastName: 'asc' }
        ],
        take: 100 // Reasonable limit
      })
    ]);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      caregivers,
      reviewers,
      meta: {
        loadTime: processingTime,
        cached: false,
        mode: 'fast'
      }
    });

  } catch (error) {
    console.error('Fast staff API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load staff',
      caregivers: [],
      reviewers: []
    }, { status: 500 });
  }
}

// Optimized for speed
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 1 minute (staff changes less frequently)
