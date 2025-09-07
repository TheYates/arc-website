import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';

// Ultra-fast endpoint for patient details page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  
  try {
    const { id } = await params;

    // Use Promise.all for parallel queries
    const [patient, staffCounts, workloadData] = await Promise.all([
      // Optimized patient query with all needed data
      prisma.patient.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          careLevel: true,
          assignedDate: true,
          dateOfBirth: true,
          gender: true,
          bloodType: true,
          heightCm: true,
          weightKg: true,
          emergencyContactName: true,
          emergencyContactRelationship: true,
          emergencyContactPhone: true,
          medicalRecordNumber: true,
          insuranceProvider: true,
          insurancePolicyNumber: true,
          primaryPhysician: true,
          allergies: true,
          chronicConditions: true,
          currentMedications: true,
          medicalHistory: true,
          specialInstructions: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              address: true,
              createdAt: true,
            }
          },
          // Only get the most recent active assignments
          caregiverAssignments: {
            where: { isActive: true },
            select: {
              id: true,
              assignedAt: true,
              caregiver: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            },
            take: 1,
            orderBy: { assignedAt: 'desc' }
          },
          reviewerAssignments: {
            where: { isActive: true },
            select: {
              id: true,
              assignedAt: true,
              reviewer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            },
            take: 1,
            orderBy: { assignedAt: 'desc' }
          }
        }
      }),
      
      // Quick staff counts
      Promise.all([
        prisma.user.count({ where: { role: 'CAREGIVER' } }),
        prisma.user.count({ where: { role: 'REVIEWER' } })
      ]),
      
      // Workload stats for assignment recommendations
      Promise.all([
        prisma.user.findMany({
          where: { role: 'CAREGIVER' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            _count: {
              select: {
                caregiverAssignments: {
                  where: { isActive: true }
                }
              }
            }
          },
          take: 20 // Limit for performance
        }),
        prisma.user.findMany({
          where: { role: 'REVIEWER' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            _count: {
              select: {
                reviewerAssignments: {
                  where: { isActive: true }
                }
              }
            }
          },
          take: 20 // Limit for performance
        })
      ])
    ]);

    if (!patient) {
      return NextResponse.json({
        success: false,
        error: 'Patient not found'
      }, { status: 404 });
    }

    // Transform data efficiently
    const transformedPatient = {
      id: patient.id,
      firstName: patient.user.firstName,
      lastName: patient.user.lastName,
      email: patient.user.email,
      phone: patient.user.phone,
      address: patient.user.address,
      status: patient.status,
      careLevel: patient.careLevel,
      dateOfBirth: patient.dateOfBirth?.toISOString(),
      gender: patient.gender,
      bloodType: patient.bloodType,
      heightCm: patient.heightCm,
      weightKg: patient.weightKg?.toString(),
      emergencyContactName: patient.emergencyContactName,
      emergencyContactRelationship: patient.emergencyContactRelationship,
      emergencyContactPhone: patient.emergencyContactPhone,
      medicalRecordNumber: patient.medicalRecordNumber,
      insuranceProvider: patient.insuranceProvider,
      insurancePolicyNumber: patient.insurancePolicyNumber,
      primaryPhysician: patient.primaryPhysician,
      allergies: patient.allergies,
      chronicConditions: patient.chronicConditions,
      currentMedications: patient.currentMedications,
      medicalHistory: patient.medicalHistory,
      specialInstructions: patient.specialInstructions,
      assignedCaregiver: patient.caregiverAssignments[0]?.caregiver ? {
        id: patient.caregiverAssignments[0].caregiver.id,
        name: `${patient.caregiverAssignments[0].caregiver.firstName} ${patient.caregiverAssignments[0].caregiver.lastName}`,
        email: patient.caregiverAssignments[0].caregiver.email,
        assignedAt: patient.caregiverAssignments[0].assignedAt.toISOString()
      } : null,
      assignedReviewer: patient.reviewerAssignments[0]?.reviewer ? {
        id: patient.reviewerAssignments[0].reviewer.id,
        name: `${patient.reviewerAssignments[0].reviewer.firstName} ${patient.reviewerAssignments[0].reviewer.lastName}`,
        email: patient.reviewerAssignments[0].reviewer.email,
        assignedAt: patient.reviewerAssignments[0].assignedAt.toISOString()
      } : null,
      createdAt: patient.user.createdAt.toISOString(),
      assignedDate: patient.assignedDate?.toISOString() || null,
    };

    // Transform workload data
    const availableStaff = {
      caregivers: workloadData[0].map((caregiver: any) => ({
        id: caregiver.id,
        firstName: caregiver.firstName,
        lastName: caregiver.lastName,
        email: caregiver.email,
        patientCount: caregiver._count.caregiverAssignments
      })),
      reviewers: workloadData[1].map((reviewer: any) => ({
        id: reviewer.id,
        firstName: reviewer.firstName,
        lastName: reviewer.lastName,
        email: reviewer.email,
        patientCount: reviewer._count.reviewerAssignments
      }))
    };

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      patient: transformedPatient,
      availableStaff,
      stats: {
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
    console.error('Fast patient details API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load patient details',
      patient: null,
      availableStaff: { caregivers: [], reviewers: [] },
      stats: { totalCaregivers: 0, totalReviewers: 0 }
    }, { status: 500 });
  }
}

// Optimized for speed
export const dynamic = 'force-dynamic';
export const revalidate = 30; // Cache for 30 seconds
