 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { getPatientsByReviewer } from "@/lib/api/assignments";
import { getPatientById } from "@/lib/api/patients";
import {
  getPatientByIdClient,
  getMedicationsClient,
  getMedicationAdministrationsClient,
} from "@/lib/api/client";
import { getVitalSignsClient } from "@/lib/api/vitals-client";
import { getMedicalReviews } from "@/lib/api/medical-reviews-client";
import { getCareNotes } from "@/lib/api/care-notes-client";
import { authenticatedGet } from "@/lib/api/auth-headers";
import { Patient } from "@/lib/types/patients";
import { User } from "@/lib/auth";

// Query Keys - centralized for consistency
export const reviewerQueryKeys = {
  patients: {
    all: ['reviewer', 'patients'] as const,
    lists: () => [...reviewerQueryKeys.patients.all, 'list'] as const,
    list: (reviewerId: string) => [...reviewerQueryKeys.patients.lists(), reviewerId] as const,
    details: () => [...reviewerQueryKeys.patients.all, 'detail'] as const,
    detail: (id: string) => [...reviewerQueryKeys.patients.details(), id] as const,
  },
  dashboard: {
    all: ['reviewer', 'dashboard'] as const,
    stats: () => [...reviewerQueryKeys.dashboard.all, 'stats'] as const,
    activity: () => [...reviewerQueryKeys.dashboard.all, 'activity'] as const,
  },
  serviceRequests: {
    all: ['reviewer', 'service-requests'] as const,
    lists: () => [...reviewerQueryKeys.serviceRequests.all, 'list'] as const,
    list: (reviewerId: string) => [...reviewerQueryKeys.serviceRequests.lists(), reviewerId] as const,
    details: () => [...reviewerQueryKeys.serviceRequests.all, 'detail'] as const,
    detail: (id: string) => [...reviewerQueryKeys.serviceRequests.details(), id] as const,
  },
  notifications: {
    all: ['reviewer', 'notifications'] as const,
    lists: () => [...reviewerQueryKeys.notifications.all, 'list'] as const,
    list: (reviewerId: string) => [...reviewerQueryKeys.notifications.lists(), reviewerId] as const,
  },
} as const;

// Patients Queries
export function useReviewerPatients() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: reviewerQueryKeys.patients.list(user?.id || ''),
    queryFn: () => getPatientsByReviewer(user!.id),
    enabled: !!user && user.role === 'reviewer',
    select: (data) => data || [],
    // Refresh patient data every 2 minutes
    refetchInterval: 2 * 60 * 1000,
    // Keep data fresh for 1 minute
    staleTime: 1 * 60 * 1000,
  });
}

export function useReviewerPatient(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: reviewerQueryKeys.patients.detail(id),
    queryFn: () => getPatientByIdClient(id, user),
    enabled: !!id && !!user,
    // Keep patient details fresh for 30 seconds
    staleTime: 30 * 1000,
  });
}

// Patient Detail Medical Data Queries
export function useReviewerPatientMedications(patientId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...reviewerQueryKeys.patients.detail(patientId), 'medications'],
    queryFn: () => getMedicationsClient(patientId, user),
    enabled: !!patientId && !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useReviewerPatientAdministrations(patientId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...reviewerQueryKeys.patients.detail(patientId), 'administrations'],
    queryFn: () => getMedicationAdministrationsClient(patientId, user),
    enabled: !!patientId && !!user,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useReviewerPatientVitals(patientId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...reviewerQueryKeys.patients.detail(patientId), 'vitals'],
    queryFn: async () => {
      const vitals = await getVitalSignsClient(patientId, user);
      // Transform vitals to match expected VitalSigns interface
      return vitals.map(vital => ({
        id: vital.id,
        patientId: vital.patientId,
        caregiverId: vital.recordedById, // Map recordedById to caregiverId
        recordedAt: vital.recordedDate, // Map recordedDate to recordedAt
        bloodPressure: vital.systolicBp && vital.diastolicBp ? {
          systolic: vital.systolicBp,
          diastolic: vital.diastolicBp,
        } : undefined,
        heartRate: vital.heartRate || undefined,
        temperature: vital.temperature ? Number(vital.temperature) : undefined,
        oxygenSaturation: vital.oxygenSaturation || undefined,
        weight: vital.weightKg ? Number(vital.weightKg) : undefined,
        bloodSugar: vital.bloodSugar ? Number(vital.bloodSugar) : undefined,
        notes: vital.notes || undefined,
        isAlerted: false, // TODO: Implement alert checking from database
        alertedValues: [],
        createdAt: vital.recordedDate,
        updatedAt: vital.recordedDate,
      }));
    },
    enabled: !!patientId && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useReviewerPatientMedicalReviews(patientId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...reviewerQueryKeys.patients.detail(patientId), 'medical-reviews'],
    queryFn: async () => {
      const reviewsData = await getMedicalReviews(patientId, user?.id);
      // Transform MedicalReviewData[] to MedicalReview[] to match component expectations
      return reviewsData.map(review => ({
        id: review.id,
        patientId: review.patientId,
        reviewerId: review.reviewerId || review.createdById,
        reviewerName: review.reviewer ?
          `${review.reviewer.firstName} ${review.reviewer.lastName}` :
          `${review.createdBy.firstName} ${review.createdBy.lastName}`,
        type: review.reviewType.toLowerCase() as any, // Convert ROUTINE -> routine
        title: review.title,
        findings: review.findings || '',
        assessment: review.description, // Map description to assessment
        recommendations: review.recommendations || '',
        treatmentPlan: review.recommendations || '', // Use recommendations as treatment plan
        followUpRequired: review.followUpRequired,
        followUpDate: review.followUpDate,
        priority: review.priority.toLowerCase() as any, // Convert HIGH -> high
        status: review.status.toLowerCase() as any, // Convert PENDING -> pending
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        reviewedDate: review.updatedAt.split('T')[0], // Use updatedAt as reviewedDate
        vitalsReviewed: [], // Not available in current API
        medicationsReviewed: [], // Not available in current API
        symptomsAddressed: [], // Not available in current API
        attachments: [], // Not available in current API
        notes: review.findings || '', // Use findings as notes
        isConfidential: false, // Default value
        sharedWith: [], // Not available in current API
      }));
    },
    enabled: !!patientId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useReviewerPatientCareNotes(patientId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...reviewerQueryKeys.patients.detail(patientId), 'care-notes'],
    queryFn: async () => {
      const notes = await getCareNotes(patientId, undefined, user);
      // Separate caregiver and reviewer notes
      const caregiverNotes = notes.filter(note => note.authorRole === 'caregiver');
      const reviewerNotes = notes.filter(note => note.authorRole === 'reviewer');
      return { caregiverNotes, reviewerNotes };
    },
    enabled: !!patientId && !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Combined hook for reviewer patient detail page
export function useReviewerPatientDetail(patientId: string) {
  const patientQuery = useReviewerPatient(patientId);
  const medicationsQuery = useReviewerPatientMedications(patientId);
  const administrationsQuery = useReviewerPatientAdministrations(patientId);
  const vitalsQuery = useReviewerPatientVitals(patientId);
  const medicalReviewsQuery = useReviewerPatientMedicalReviews(patientId);
  const careNotesQuery = useReviewerPatientCareNotes(patientId);

  return {
    // Data
    patient: patientQuery.data || null,
    medications: medicationsQuery.data || [],
    administrations: administrationsQuery.data || [],
    vitals: vitalsQuery.data || [],
    medicalReviews: medicalReviewsQuery.data || [],
    caregiverNotes: careNotesQuery.data?.caregiverNotes || [],
    reviewerNotes: careNotesQuery.data?.reviewerNotes || [],

    // Loading states
    isLoading: patientQuery.isLoading,
    isMedicalDataLoading: medicationsQuery.isLoading || administrationsQuery.isLoading ||
                         vitalsQuery.isLoading || medicalReviewsQuery.isLoading ||
                         careNotesQuery.isLoading,

    // Error states
    error: patientQuery.error || medicationsQuery.error || administrationsQuery.error ||
           vitalsQuery.error || medicalReviewsQuery.error || careNotesQuery.error,

    // Refetch functions
    refetchPatient: patientQuery.refetch,
    refetchMedications: medicationsQuery.refetch,
    refetchAdministrations: administrationsQuery.refetch,
    refetchVitals: vitalsQuery.refetch,
    refetchMedicalReviews: medicalReviewsQuery.refetch,
    refetchCareNotes: careNotesQuery.refetch,
    refetchAll: () => {
      patientQuery.refetch();
      medicationsQuery.refetch();
      administrationsQuery.refetch();
      vitalsQuery.refetch();
      medicalReviewsQuery.refetch();
      careNotesQuery.refetch();
    },
  };
}

// Dashboard Stats Query
export function useReviewerDashboardStats() {
  const { user } = useAuth();
  const patientsQuery = useReviewerPatients();
  
  return useQuery({
    queryKey: reviewerQueryKeys.dashboard.stats(),
    queryFn: async () => {
      // Calculate stats from patient data
      const patients = patientsQuery.data || [];
      
      const stats = {
        assignedPatients: patients.length,
        pendingReviews: patients.filter(p => p.status === 'critical' || p.status === 'declining').length || 3, // Critical/declining patients need review
        reviewsThisWeek: 12, // Mock data - would come from API
        priorityCases: patients.filter(p => p.careLevel === 'high').length || 1,
      };
      
      return stats;
    },
    enabled: !!user && user.role === 'reviewer' && !!patientsQuery.data,
    // Refresh stats every 30 seconds
    refetchInterval: 30 * 1000,
    // Keep stats fresh for 15 seconds
    staleTime: 15 * 1000,
  });
}

// Combined hook for reviewer dashboard
export function useReviewerDashboard() {
  const patientsQuery = useReviewerPatients();
  const statsQuery = useReviewerDashboardStats();

  return {
    // Data
    patients: patientsQuery.data || [],
    stats: statsQuery.data || {
      assignedPatients: 0,
      pendingReviews: 0,
      reviewsThisWeek: 0,
      priorityCases: 0,
    },
    
    // Loading states
    isLoading: patientsQuery.isLoading || statsQuery.isLoading,
    isPatientsLoading: patientsQuery.isLoading,
    isStatsLoading: statsQuery.isLoading,
    
    // Error states
    error: patientsQuery.error || statsQuery.error,
    patientsError: patientsQuery.error,
    statsError: statsQuery.error,
    
    // Refetch functions
    refetchPatients: patientsQuery.refetch,
    refetchStats: statsQuery.refetch,
    refetchAll: () => {
      patientsQuery.refetch();
      statsQuery.refetch();
    },
  };
}

// Patient Management Hook with Filtering
export function useReviewerPatientManagement(filters?: {
  search?: string;
  careLevel?: string;
}) {
  const patientsQuery = useReviewerPatients();

  return useQuery({
    queryKey: [...reviewerQueryKeys.patients.lists(), 'filtered', filters],
    queryFn: () => {
      const patients = patientsQuery.data || [];

      let filteredPatients = patients;

      // Apply search filter
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredPatients = filteredPatients.filter(patient =>
          patient.firstName.toLowerCase().includes(searchTerm) ||
          patient.lastName.toLowerCase().includes(searchTerm) ||
          patient.email.toLowerCase().includes(searchTerm) ||
          (patient.medicalRecordNumber &&
           patient.medicalRecordNumber.toLowerCase().includes(searchTerm))
        );
      }

      // Apply care level filter
      if (filters?.careLevel && filters.careLevel !== 'all') {
        filteredPatients = filteredPatients.filter(patient =>
          patient.careLevel === filters.careLevel
        );
      }

      return filteredPatients;
    },
    enabled: !!patientsQuery.data,
    select: (data) => data || [],
  });
}

// Service Request Types
interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  customDescription?: string;
  priority: string;
  status: string;
  requestedDate: string;
  preferredDate?: string;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  caregiverNotes?: string;
  reviewerNotes?: string;
  outcome?: string;
  requiresApproval: boolean;
  patient: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  caregiver: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  serviceType?: {
    id: string;
    name: string;
    description: string;
  };
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Service Requests Queries
export function useReviewerServiceRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: reviewerQueryKeys.serviceRequests.list(user?.id || ''),
    queryFn: async () => {
      const response = await authenticatedGet("/api/service-requests", user);

      if (!response.ok) {
        throw new Error("Failed to fetch service requests");
      }

      const data = await response.json();
      return data.serviceRequests as ServiceRequest[];
    },
    enabled: !!user && user.role === 'reviewer',
    select: (data) => data || [],
    // Refresh service requests every 30 seconds
    refetchInterval: 30 * 1000,
    // Keep data fresh for 15 seconds
    staleTime: 15 * 1000,
  });
}

// Service Request Mutations
export function useServiceRequestMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Approve service request mutation
  const approveServiceRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "APPROVED",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve request");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch service requests
      queryClient.invalidateQueries({
        queryKey: reviewerQueryKeys.serviceRequests.lists()
      });

      toast({
        title: "Success",
        description: "Service request approved",
      });
    },
    onError: (error) => {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      });
    },
  });

  // Reject service request mutation
  const rejectServiceRequestMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "REJECTED",
          rejectionReason: reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject request");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch service requests
      queryClient.invalidateQueries({
        queryKey: reviewerQueryKeys.serviceRequests.lists()
      });

      toast({
        title: "Success",
        description: "Service request rejected",
      });
    },
    onError: (error) => {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    },
  });

  return {
    approveServiceRequest: approveServiceRequestMutation.mutate,
    rejectServiceRequest: rejectServiceRequestMutation.mutate,
    isApprovingServiceRequest: approveServiceRequestMutation.isPending,
    isRejectingServiceRequest: rejectServiceRequestMutation.isPending,
  };
}

// Notifications Query
export function useReviewerNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: reviewerQueryKeys.notifications.list(user?.id || ''),
    queryFn: async () => {
      const response = await authenticatedGet("/api/notifications", user);

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      return data.notifications || [];
    },
    enabled: !!user && user.role === 'reviewer',
    select: (data) => data || [],
    // Refresh notifications every 30 seconds
    refetchInterval: 30 * 1000,
    // Keep data fresh for 15 seconds
    staleTime: 15 * 1000,
  });
}
