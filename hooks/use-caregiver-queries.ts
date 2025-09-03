import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { getPatientsByCaregiver } from "@/lib/api/assignments";
import {
  getPatientsByCaregiverClient,
  getPatientByIdClient,
  getMedicationsClient,
  getMedicationAdministrationsClient,
} from "@/lib/api/client";
import { getPatientById } from "@/lib/api/patients";
import { getVitalSignsClient } from "@/lib/api/vitals-client";
import { getMedicalReviews } from "@/lib/api/medical-reviews-client";
import { getCareNotes } from "@/lib/api/care-notes-client";
import { authenticatedGet, authenticatedPost, authenticatedDelete, authenticatedPatch } from "@/lib/api/auth-headers";

// Query Keys - centralized for consistency
export const caregiverQueryKeys = {
  patients: {
    all: ['caregiver', 'patients'] as const,
    lists: () => [...caregiverQueryKeys.patients.all, 'list'] as const,
    list: (caregiverId: string) => [...caregiverQueryKeys.patients.lists(), caregiverId] as const,
    details: () => [...caregiverQueryKeys.patients.all, 'detail'] as const,
    detail: (id: string) => [...caregiverQueryKeys.patients.details(), id] as const,
  },
  dashboard: {
    all: ['caregiver', 'dashboard'] as const,
    stats: () => [...caregiverQueryKeys.dashboard.all, 'stats'] as const,
    activity: () => [...caregiverQueryKeys.dashboard.all, 'activity'] as const,
  },
  schedules: {
    all: ['caregiver', 'schedules'] as const,
    lists: () => [...caregiverQueryKeys.schedules.all, 'list'] as const,
    list: (caregiverId: string) => [...caregiverQueryKeys.schedules.lists(), caregiverId] as const,
  },
  serviceRequests: {
    all: ['caregiver', 'service-requests'] as const,
    lists: () => [...caregiverQueryKeys.serviceRequests.all, 'list'] as const,
    list: (caregiverId: string) => [...caregiverQueryKeys.serviceRequests.lists(), caregiverId] as const,
    details: () => [...caregiverQueryKeys.serviceRequests.all, 'detail'] as const,
    detail: (id: string) => [...caregiverQueryKeys.serviceRequests.details(), id] as const,
  },
  notifications: {
    all: ['caregiver', 'notifications'] as const,
    lists: () => [...caregiverQueryKeys.notifications.all, 'list'] as const,
    list: (filters: string) => [...caregiverQueryKeys.notifications.lists(), { filters }] as const,
  },
} as const;

// Patients Queries
export function useCaregiverPatients() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: caregiverQueryKeys.patients.list(user?.id || ''),
    queryFn: () => getPatientsByCaregiverClient(user!.id, user),
    enabled: !!user && user.role === 'caregiver',
    select: (data) => data || [],
    // Refresh patient data every 2 minutes
    refetchInterval: 2 * 60 * 1000,
    // Keep data fresh for 1 minute
    staleTime: 1 * 60 * 1000,
  });
}

export function useCaregiverPatient(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: caregiverQueryKeys.patients.detail(id),
    queryFn: () => getPatientByIdClient(id, user),
    enabled: !!id && !!user,
    // Keep patient details fresh for 30 seconds
    staleTime: 30 * 1000,
  });
}

// Patient Detail Medical Data Queries
export function useCaregiverPatientMedications(patientId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...caregiverQueryKeys.patients.detail(patientId), 'medications'],
    queryFn: () => getMedicationsClient(patientId, user),
    enabled: !!patientId && !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useCaregiverPatientAdministrations(patientId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...caregiverQueryKeys.patients.detail(patientId), 'administrations'],
    queryFn: () => getMedicationAdministrationsClient(patientId, user),
    enabled: !!patientId && !!user,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCaregiverPatientVitals(patientId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...caregiverQueryKeys.patients.detail(patientId), 'vitals'],
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

export function useCaregiverPatientMedicalReviews(patientId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...caregiverQueryKeys.patients.detail(patientId), 'medical-reviews'],
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

export function useCaregiverPatientCareNotes(patientId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...caregiverQueryKeys.patients.detail(patientId), 'care-notes'],
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

// Combined hook for patient detail page
export function useCaregiverPatientDetail(patientId: string) {
  const patientQuery = useCaregiverPatient(patientId);
  const medicationsQuery = useCaregiverPatientMedications(patientId);
  const administrationsQuery = useCaregiverPatientAdministrations(patientId);
  const vitalsQuery = useCaregiverPatientVitals(patientId);
  const medicalReviewsQuery = useCaregiverPatientMedicalReviews(patientId);
  const careNotesQuery = useCaregiverPatientCareNotes(patientId);

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
export function useCaregiverDashboardStats() {
  const { user } = useAuth();
  const patientsQuery = useCaregiverPatients();
  
  return useQuery({
    queryKey: caregiverQueryKeys.dashboard.stats(),
    queryFn: async () => {
      // Calculate stats from patient data
      const patients = patientsQuery.data || [];
      
      const stats = {
        activePatients: patients.length,
        todaysTasks: 0, // Mock data - would come from API
        hoursThisWeek: 0, // Mock data - would come from API
        notifications: 2, // Mock data - would come from API
        priorityCases: patients.filter(p => p.careLevel === 'high').length,
        criticalPatients: patients.filter(p => p.status === 'critical').length,
      };
      
      return stats;
    },
    enabled: !!user && user.role === 'caregiver' && !!patientsQuery.data,
    // Refresh stats every 30 seconds
    refetchInterval: 30 * 1000,
    // Keep stats fresh for 15 seconds
    staleTime: 15 * 1000,
  });
}

// Combined hook for caregiver dashboard
export function useCaregiverDashboard() {
  const patientsQuery = useCaregiverPatients();
  const statsQuery = useCaregiverDashboardStats();

  return {
    // Data
    patients: patientsQuery.data || [],
    stats: statsQuery.data || {
      activePatients: 0,
      todaysTasks: 0,
      hoursThisWeek: 0,
      notifications: 0,
      priorityCases: 0,
      criticalPatients: 0,
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
export function useCaregiverPatientManagement(filters?: {
  search?: string;
  careLevel?: string;
}) {
  const patientsQuery = useCaregiverPatients();
  
  return useQuery({
    queryKey: [...caregiverQueryKeys.patients.lists(), 'filtered', filters],
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

// Schedules Query
export function useCaregiverSchedules() {
  const { user } = useAuth();

  return useQuery({
    queryKey: caregiverQueryKeys.schedules.list(user?.id || ''),
    queryFn: async () => {
      const response = await authenticatedGet("/api/caregiver-schedules", user);
      if (!response.ok) {
        throw new Error("Failed to fetch schedules");
      }
      const data = await response.json();
      return data.schedules || [];
    },
    enabled: !!user && user.role === 'caregiver',
    select: (data) => data || [],
    // Refresh schedules every 5 minutes
    refetchInterval: 5 * 60 * 1000,
    // Keep data fresh for 2 minutes
    staleTime: 2 * 60 * 1000,
  });
}

// Schedule Mutations
export function useCaregiverScheduleMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const createScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const response = await authenticatedPost("/api/caregiver-schedules", user, scheduleData);
      if (!response.ok) {
        throw new Error("Failed to create schedule");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caregiverQueryKeys.schedules.all });
      toast({
        title: "Success",
        description: "Schedule created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create schedule",
        variant: "destructive",
      });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      const response = await authenticatedDelete(`/api/caregiver-schedules/${scheduleId}`, user);
      if (!response.ok) {
        throw new Error("Failed to delete schedule");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caregiverQueryKeys.schedules.all });
      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    },
  });

  return {
    createSchedule: createScheduleMutation.mutate,
    deleteSchedule: deleteScheduleMutation.mutate,
    isCreatingSchedule: createScheduleMutation.isPending,
    isDeletingSchedule: deleteScheduleMutation.isPending,
  };
}

// Notifications Query
export function useCaregiverNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: caregiverQueryKeys.notifications.list(user?.id || ''),
    queryFn: async () => {
      const response = await authenticatedGet("/api/notifications?limit=100", user);
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      return data.notifications || [];
    },
    enabled: !!user && user.role === 'caregiver',
    select: (data) => data || [],
    // Refresh notifications every 2 minutes
    refetchInterval: 2 * 60 * 1000,
    // Keep data fresh for 1 minute
    staleTime: 1 * 60 * 1000,
  });
}

// Notification Mutations
export function useCaregiverNotificationMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await authenticatedPatch(`/api/notifications/${notificationId}`, user, {
        isRead: true,
      });
      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caregiverQueryKeys.notifications.all });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await authenticatedDelete(`/api/notifications/${notificationId}`, user);
      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caregiverQueryKeys.notifications.all });
      toast({
        title: "Success",
        description: "Notification deleted successfully",
      });
    },
  });

  return {
    markAsRead: markAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
  };
}

// Service Requests Query
export function useCaregiverServiceRequests() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: caregiverQueryKeys.serviceRequests.list(user?.id || ''),
    queryFn: async () => {
      const response = await authenticatedGet("/api/service-requests", user);
      
      if (!response.ok) {
        throw new Error("Failed to fetch service requests");
      }
      
      const data = await response.json();
      return data.serviceRequests || [];
    },
    enabled: !!user && user.role === 'caregiver',
    select: (data) => data || [],
    // Refresh service requests every 30 seconds
    refetchInterval: 30 * 1000,
    // Keep data fresh for 15 seconds
    staleTime: 15 * 1000,
  });
}
