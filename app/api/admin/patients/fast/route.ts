import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';

// Ultra-fast endpoint for admin patients page
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Cap at 100
    const skip = (page - 1) * limit;

    // Use Promise.all for parallel queries
    const [totalCount, patients, staffCounts] = await Promise.all([
      // Quick count query
      prisma.patient.count(),
      
      // Optimized patient query with minimal data
      prisma.patient.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          careLevel: true,
          assignedDate: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true,
            }
          },
          // Only get the most recent active assignments
          caregiverAssignments: {
            where: { isActive: true },
            select: {
              caregiver: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                }
              }
            },
            take: 1,
            orderBy: { assignedAt: 'desc' }
          },
          reviewerAssignments: {
            where: { isActive: true },
            select: {
              reviewer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                }
              }
            },
            take: 1,
            orderBy: { assignedAt: 'desc' }
          }
        },
        orderBy: { assignedDate: 'desc' }
      }),
      
      // Quick staff counts for stats
      Promise.all([
        prisma.user.count({ where: { role: 'CAREGIVER' } }),
        prisma.user.count({ where: { role: 'REVIEWER' } })
      ])
    ]);

    // Transform data efficiently
    const transformedPatients = patients.map((patient: any) => ({
      id: patient.id,
      firstName: patient.user.firstName,
      lastName: patient.user.lastName,
      email: patient.user.email,
      status: patient.status,
      careLevel: patient.careLevel,
      assignedCaregiver: patient.caregiverAssignments[0]?.caregiver ? {
        id: patient.caregiverAssignments[0].caregiver.id,
        name: `${patient.caregiverAssignments[0].caregiver.firstName} ${patient.caregiverAssignments[0].caregiver.lastName}`
      } : null,
      assignedReviewer: patient.reviewerAssignments[0]?.reviewer ? {
        id: patient.reviewerAssignments[0].reviewer.id,
        name: `${patient.reviewerAssignments[0].reviewer.firstName} ${patient.reviewerAssignments[0].reviewer.lastName}`
      } : null,
      createdAt: patient.user.createdAt.toISOString(),
      assignedDate: patient.assignedDate?.toISOString() || null,
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      patients: transformedPatients,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats: {
        totalPatients: totalCount,
        totalCaregivers: staffCounts[0],
        totalReviewers: staffCounts[1],
      },
      meta: {
        loadTime: processingTime,
        cached: false,
        mode: 'fast'
      }
    });

  } catch (error) {
    console.error('Fast patients API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load patients',
      patients: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      stats: {
        totalPatients: 0,
        totalCaregivers: 0,
        totalReviewers: 0,
      }
    }, { status: 500 });
  }
}

// Optimized for speed
export const dynamic = 'force-dynamic';
export const revalidate = 30; // Cache for 30 seconds
