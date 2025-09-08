"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

// Import existing API functions
import { getPatientByIdClient, getMedicationsClient, getMedicationAdministrationsClient } from "@/lib/api/client";
import { getVitalSignsClient } from "@/lib/api/vitals-client";
import { getMedicalReviews } from "@/lib/api/medical-reviews-client";
import { getCareNotes } from "@/lib/api/care-notes-client";

// Types
import { Patient } from "@/lib/types/patients";
import { Medication, MedicationAdministration } from "@/lib/types/medications";
import { VitalSigns } from "@/lib/types/vitals";
import { MedicalReview } from "@/lib/types/medical-reviews";
import { CareNote } from "@/lib/types/care-notes";

// Query keys for consistent caching
export const patientTabQueryKeys = {
  patient: (id: string) => ['patient', id],
  overview: (id: string) => ['patient', id, 'overview'],
  medications: (id: string) => ['patient', id, 'medications'],
  administrations: (id: string) => ['patient', id, 'administrations'],
  vitals: (id: string) => ['patient', id, 'vitals'],
  medicalReviews: (id: string) => ['patient', id, 'medical-reviews'],
  careNotes: (id: string) => ['patient', id, 'care-notes'],
};

// Tab loading priorities for prefetching
export const TAB_PREFETCH_MAP = {
  overview: ['medications', 'vitals'], // Most likely next tabs from overview
  medications: ['vitals', 'care-notes'],
  vitals: ['medications', 'medical-reviews'],
  'medical-reviews': ['care-notes', 'medications'],
  'care-notes': ['medications', 'vitals'],
  'reviewer-notes': ['care-notes', 'medications'],
  'caregiver-notes': ['medications', 'vitals'],
  tasks: ['overview', 'care-notes'],
};

// 1. CORE PATIENT DATA (Always loaded)
export function usePatientBasicInfo(patientId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: patientTabQueryKeys.patient(patientId),
    queryFn: () => getPatientByIdClient(patientId, user),
    enabled: !!patientId && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });
}

// 2. OVERVIEW TAB DATA (Basic summary data)
export function usePatientOverviewData(patientId: string, enabled: boolean = true) {
  const { user } = useAuth();
  
  // For overview, we need basic patient info + recent summary data
  const patientQuery = usePatientBasicInfo(patientId);
  
  // Get recent medications (last 5) for overview
  const recentMedicationsQuery = useQuery({
    queryKey: [...patientTabQueryKeys.overview(patientId), 'recent-medications'],
    queryFn: async () => {
      const allMeds = await getMedicationsClient(patientId, user);
      return allMeds.slice(0, 5); // Only recent 5 for overview
    },
    enabled: enabled && !!patientId && !!user,
    staleTime: 1 * 60 * 1000,
  });

  // Get recent vitals (last 3) for overview
  const recentVitalsQuery = useQuery({
    queryKey: [...patientTabQueryKeys.overview(patientId), 'recent-vitals'],
    queryFn: async () => {
      const allVitals = await getVitalSignsClient(patientId, user);
      // Transform and get only recent 3 for overview
      const transformedVitals = allVitals.map((vital: any) => ({
        id: vital.id,
        patientId: vital.patientId,
        caregiverId: vital.recordedById,
        recordedAt: vital.recordedDate,
        bloodPressure: vital.systolicBp && vital.diastolicBp ? {
          systolic: vital.systolicBp,
          diastolic: vital.diastolicBp
        } : undefined,
        heartRate: vital.heartRate,
        temperature: vital.temperature,
        oxygenSaturation: vital.oxygenSaturation,
        weight: vital.weightKg,
        bloodSugar: vital.bloodSugar,
        notes: vital.notes,
        isAlerted: false,
        alertedValues: [],
        createdAt: vital.recordedDate,
        updatedAt: vital.recordedDate,
      }));
      return transformedVitals.slice(0, 3); // Only recent 3 for overview
    },
    enabled: enabled && !!patientId && !!user,
    staleTime: 1 * 60 * 1000,
  });

  return {
    patient: patientQuery.data || null,
    recentMedications: recentMedicationsQuery.data || [],
    recentVitals: recentVitalsQuery.data || [],
    isLoading: patientQuery.isLoading || recentMedicationsQuery.isLoading || recentVitalsQuery.isLoading,
    error: patientQuery.error || recentMedicationsQuery.error || recentVitalsQuery.error,
    refetch: () => {
      patientQuery.refetch();
      recentMedicationsQuery.refetch();
      recentVitalsQuery.refetch();
    },
  };
}

// 3. MEDICATIONS TAB DATA (Full medications + administrations)
export function usePatientMedicationsData(patientId: string, enabled: boolean = true) {
  const { user } = useAuth();
  
  const medicationsQuery = useQuery({
    queryKey: patientTabQueryKeys.medications(patientId),
    queryFn: () => getMedicationsClient(patientId, user),
    enabled: enabled && !!patientId && !!user,
    staleTime: 1 * 60 * 1000,
  });

  const administrationsQuery = useQuery({
    queryKey: patientTabQueryKeys.administrations(patientId),
    queryFn: () => getMedicationAdministrationsClient(patientId, user),
    enabled: enabled && !!patientId && !!user,
    staleTime: 30 * 1000, // More frequent updates for administrations
  });

  return {
    medications: medicationsQuery.data || [],
    administrations: administrationsQuery.data || [],
    isLoading: medicationsQuery.isLoading || administrationsQuery.isLoading,
    error: medicationsQuery.error || administrationsQuery.error,
    refetch: () => {
      medicationsQuery.refetch();
      administrationsQuery.refetch();
    },
  };
}

// 4. VITALS TAB DATA
export function usePatientVitalsData(patientId: string, enabled: boolean = true) {
  const { user } = useAuth();

  const vitalsQuery = useQuery({
    queryKey: patientTabQueryKeys.vitals(patientId),
    queryFn: async () => {
      const vitalsData = await getVitalSignsClient(patientId, user);
      // Transform VitalSignsResponse[] to VitalSigns[]
      return vitalsData.map((vital: any) => ({
        id: vital.id,
        patientId: vital.patientId,
        caregiverId: vital.recordedById, // Map recordedById to caregiverId
        recordedAt: vital.recordedDate, // Map recordedDate to recordedAt
        bloodPressure: vital.systolicBp && vital.diastolicBp ? {
          systolic: vital.systolicBp,
          diastolic: vital.diastolicBp
        } : undefined,
        heartRate: vital.heartRate,
        temperature: vital.temperature,
        oxygenSaturation: vital.oxygenSaturation,
        weight: vital.weightKg,
        bloodSugar: vital.bloodSugar,
        notes: vital.notes,
        isAlerted: false, // Default value
        alertedValues: [], // Default value
        createdAt: vital.recordedDate, // Use recordedDate as createdAt
        updatedAt: vital.recordedDate, // Use recordedDate as updatedAt
      }));
    },
    enabled: enabled && !!patientId && !!user,
    staleTime: 1 * 60 * 1000,
  });

  return {
    vitals: vitalsQuery.data || [],
    isLoading: vitalsQuery.isLoading,
    error: vitalsQuery.error,
    refetch: vitalsQuery.refetch,
  };
}

// 5. MEDICAL REVIEWS TAB DATA
export function usePatientMedicalReviewsData(patientId: string, enabled: boolean = true) {
  const { user } = useAuth();

  const reviewsQuery = useQuery({
    queryKey: patientTabQueryKeys.medicalReviews(patientId),
    queryFn: async () => {
      const reviewsData = await getMedicalReviews(patientId);
      // Transform raw data to MedicalReview format
      return reviewsData.map((review: any) => ({
        id: review.id,
        patientId: review.patientId,
        reviewerId: review.reviewerId || review.createdById,
        reviewerName: review.reviewer
          ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
          : "Unknown",
        type: review.reviewType?.toLowerCase() || "routine",
        title: review.title,
        findings: review.findings || "",
        assessment: review.description || review.assessment || "",
        recommendations: review.recommendations || "",
        treatmentPlan: review.treatmentPlan || "",
        followUpRequired: review.followUpRequired || false,
        followUpDate: review.followUpDate,
        priority: review.priority?.toLowerCase() || "medium",
        status: review.status?.toLowerCase() || "pending",
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        reviewedDate: review.createdAt,
        isConfidential: review.isConfidential || false,
      }));
    },
    enabled: enabled && !!patientId && !!user,
    staleTime: 2 * 60 * 1000, // Reviews change less frequently
  });

  return {
    medicalReviews: reviewsQuery.data || [],
    isLoading: reviewsQuery.isLoading,
    error: reviewsQuery.error,
    refetch: reviewsQuery.refetch,
  };
}

// 6. CARE NOTES TAB DATA
export function usePatientCareNotesData(patientId: string, enabled: boolean = true) {
  const { user } = useAuth();

  const careNotesQuery = useQuery({
    queryKey: patientTabQueryKeys.careNotes(patientId),
    queryFn: () => getCareNotes(patientId, undefined, user),
    enabled: enabled && !!patientId && !!user,
    staleTime: 30 * 1000, // Notes update frequently
  });

  // Filter notes by author role
  const allNotes = careNotesQuery.data || [];
  const caregiverNotes = allNotes.filter(note => note.authorRole === 'caregiver');
  const reviewerNotes = allNotes.filter(note => note.authorRole === 'reviewer');

  return {
    caregiverNotes,
    reviewerNotes,
    isLoading: careNotesQuery.isLoading,
    error: careNotesQuery.error,
    refetch: careNotesQuery.refetch,
  };
}

// 7. SMART PREFETCHING HOOK
export function useTabPrefetching(patientId: string, activeTab: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!patientId || !user || !activeTab) return;

    const tabsToPrefetch = TAB_PREFETCH_MAP[activeTab as keyof typeof TAB_PREFETCH_MAP] || [];
    
    // Prefetch likely next tabs with a small delay to not interfere with current tab
    const prefetchTimer = setTimeout(() => {
      tabsToPrefetch.forEach((tabName) => {
        switch (tabName) {
          case 'medications':
            queryClient.prefetchQuery({
              queryKey: patientTabQueryKeys.medications(patientId),
              queryFn: () => getMedicationsClient(patientId, user),
              staleTime: 1 * 60 * 1000,
            });
            break;
          case 'vitals':
            queryClient.prefetchQuery({
              queryKey: patientTabQueryKeys.vitals(patientId),
              queryFn: async () => {
                const vitalsData = await getVitalSignsClient(patientId, user);
                return vitalsData.map((vital: any) => ({
                  id: vital.id,
                  patientId: vital.patientId,
                  caregiverId: vital.recordedById,
                  recordedAt: vital.recordedDate,
                  bloodPressure: vital.systolicBp && vital.diastolicBp ? {
                    systolic: vital.systolicBp,
                    diastolic: vital.diastolicBp
                  } : undefined,
                  heartRate: vital.heartRate,
                  temperature: vital.temperature,
                  oxygenSaturation: vital.oxygenSaturation,
                  weight: vital.weightKg,
                  bloodSugar: vital.bloodSugar,
                  notes: vital.notes,
                  isAlerted: false,
                  alertedValues: [],
                  createdAt: vital.recordedDate,
                  updatedAt: vital.recordedDate,
                }));
              },
              staleTime: 1 * 60 * 1000,
            });
            break;
          case 'care-notes':
            queryClient.prefetchQuery({
              queryKey: patientTabQueryKeys.careNotes(patientId),
              queryFn: () => getCareNotes(patientId, undefined, user),
              staleTime: 30 * 1000,
            });
            break;
          case 'medical-reviews':
            queryClient.prefetchQuery({
              queryKey: patientTabQueryKeys.medicalReviews(patientId),
              queryFn: () => getMedicalReviews(patientId),
              staleTime: 2 * 60 * 1000,
            });
            break;
        }
      });
    }, 500); // 500ms delay to let current tab load first

    return () => clearTimeout(prefetchTimer);
  }, [activeTab, patientId, user, queryClient]);
}

// 8. COMBINED HOOK FOR EASY MIGRATION (Optional - for gradual migration)
export function usePatientDetailLazy(patientId: string, activeTab: string) {
  // Always load basic patient info
  const basicInfo = usePatientBasicInfo(patientId);
  
  // Load tab-specific data based on active tab
  const overviewData = usePatientOverviewData(patientId, activeTab === 'overview');
  const medicationsData = usePatientMedicationsData(patientId, activeTab === 'medications');
  const vitalsData = usePatientVitalsData(patientId, activeTab === 'vitals');
  const medicalReviewsData = usePatientMedicalReviewsData(patientId, activeTab === 'medical-reviews');
  const careNotesData = usePatientCareNotesData(patientId, activeTab === 'care-notes' || activeTab === 'reviewer-notes' || activeTab === 'caregiver-notes');
  
  // Enable smart prefetching
  useTabPrefetching(patientId, activeTab);

  return {
    // Basic patient info (always available)
    patient: basicInfo.data || null,
    isPatientLoading: basicInfo.isLoading,
    
    // Tab-specific data
    overview: overviewData,
    medications: medicationsData,
    vitals: vitalsData,
    medicalReviews: medicalReviewsData,
    careNotes: careNotesData,
    
    // Global refetch
    refetchAll: () => {
      basicInfo.refetch();
      if (activeTab === 'overview') overviewData.refetch();
      if (activeTab === 'medications') medicationsData.refetch();
      if (activeTab === 'vitals') vitalsData.refetch();
      if (activeTab === 'medical-reviews') medicalReviewsData.refetch();
      if (activeTab.includes('notes')) careNotesData.refetch();
    },
  };
}
