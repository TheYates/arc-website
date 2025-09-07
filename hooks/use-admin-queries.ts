import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  getPatients, 
  getPatientById,
  updatePatient,
  deletePatient 
} from "@/lib/api/patients";
import { 
  getAvailableStaff, 
  assignPatientToCaregiver,
  assignPatientToReviewer,
  removeAssignment,
  getWorkloadStats 
} from "@/lib/api/assignments";
import { Patient } from "@/lib/types/patients";
import { User } from "@/lib/auth";

// Query Keys - centralized for consistency
export const adminQueryKeys = {
  patients: {
    all: ['admin', 'patients'] as const,
    lists: () => [...adminQueryKeys.patients.all, 'list'] as const,
    list: (page: number, limit: number) => [...adminQueryKeys.patients.lists(), page, limit] as const,
    details: () => [...adminQueryKeys.patients.all, 'detail'] as const,
    detail: (id: string) => [...adminQueryKeys.patients.details(), id] as const,
  },
  staff: {
    all: ['admin', 'staff'] as const,
    available: () => [...adminQueryKeys.staff.all, 'available'] as const,
    workload: () => [...adminQueryKeys.staff.all, 'workload'] as const,
  },
} as const;

// Patients Queries
export function usePatients(page = 1, limit = 50) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: adminQueryKeys.patients.list(page, limit),
    queryFn: () => getPatients(page, limit, user),
    enabled: !!user,
    select: (data) => ({
      patients: data.patients || [],
      pagination: data.pagination,
    }),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: adminQueryKeys.patients.detail(id),
    queryFn: () => getPatientById(id),
    enabled: !!id,
  });
}

// Staff Queries
export function useAvailableStaff() {
  return useQuery({
    queryKey: adminQueryKeys.staff.available(),
    queryFn: getAvailableStaff,
    select: (data) => ({
      caregivers: data.caregivers || [],
      reviewers: data.reviewers || [],
    }),
  });
}

export function useWorkloadStats() {
  return useQuery({
    queryKey: adminQueryKeys.staff.workload(),
    queryFn: getWorkloadStats,
    select: (data) => ({
      caregivers: data.caregivers || [],
      reviewers: data.reviewers || [],
    }),
  });
}

// Combined hook for patient management page
export function usePatientManagement(page = 1, limit = 50) {
  const patientsQuery = usePatients(page, limit);
  const staffQuery = useAvailableStaff();
  const workloadQuery = useWorkloadStats();

  return {
    // Data
    patients: patientsQuery.data?.patients || [],
    pagination: patientsQuery.data?.pagination,
    availableStaff: staffQuery.data || { caregivers: [], reviewers: [] },
    workloadStats: workloadQuery.data || { caregivers: [], reviewers: [] },

    // Loading states
    isLoading: patientsQuery.isLoading || staffQuery.isLoading || workloadQuery.isLoading,
    isPatientsLoading: patientsQuery.isLoading,
    isStaffLoading: staffQuery.isLoading,
    isWorkloadLoading: workloadQuery.isLoading,

    // Error states
    error: patientsQuery.error || staffQuery.error || workloadQuery.error,
    patientsError: patientsQuery.error,
    staffError: staffQuery.error,
    workloadError: workloadQuery.error,

    // Refetch functions
    refetchPatients: patientsQuery.refetch,
    refetchStaff: staffQuery.refetch,
    refetchWorkload: workloadQuery.refetch,
    refetchAll: () => {
      patientsQuery.refetch();
      staffQuery.refetch();
      workloadQuery.refetch();
    },
  };
}

// Optimized hook for patient management page with fast endpoints
export function useOptimizedPatientManagement(page = 1, limit = 50) {
  const { user } = useAuth();

  // Single optimized query that fetches patients and staff data together
  const fastQuery = useQuery({
    queryKey: ['admin', 'patients', 'fast', page, limit],
    queryFn: async () => {
      const [patientsResponse, staffResponse] = await Promise.all([
        fetch(`/api/admin/patients/fast?page=${page}&limit=${limit}`),
        fetch('/api/admin/staff/fast')
      ]);

      const [patientsData, staffData] = await Promise.all([
        patientsResponse.json(),
        staffResponse.json()
      ]);

      return {
        patients: patientsData.patients || [],
        pagination: patientsData.pagination,
        stats: patientsData.stats,
        availableStaff: {
          caregivers: staffData.caregivers || [],
          reviewers: staffData.reviewers || []
        },
        loadTime: Math.max(patientsData.meta?.loadTime || 0, staffData.meta?.loadTime || 0)
      };
    },
    enabled: !!user,
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  return {
    // Data
    patients: fastQuery.data?.patients || [],
    pagination: fastQuery.data?.pagination,
    availableStaff: fastQuery.data?.availableStaff || { caregivers: [], reviewers: [] },
    stats: fastQuery.data?.stats,
    loadTime: fastQuery.data?.loadTime,

    // Loading states
    isLoading: fastQuery.isLoading,

    // Error states
    error: fastQuery.error,

    // Refetch functions
    refetchAll: fastQuery.refetch,
  };
}

// Mutations for patient management
export function usePatientMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Assign patient to caregiver
  const assignCaregiver = useMutation({
    mutationFn: ({ patientId, caregiverId }: { patientId: string; caregiverId: string }) =>
      assignPatientToCaregiver(patientId, caregiverId, user?.id || 'system'),
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.patients.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.staff.workload() });
      
      toast({
        title: "Success",
        description: "Patient assigned to caregiver successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign patient to caregiver.",
        variant: "destructive",
      });
    },
  });

  // Assign patient to reviewer
  const assignReviewer = useMutation({
    mutationFn: ({ patientId, reviewerId }: { patientId: string; reviewerId: string }) =>
      assignPatientToReviewer(patientId, reviewerId, user?.id || 'system'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.patients.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.staff.workload() });
      
      toast({
        title: "Success",
        description: "Patient assigned to reviewer successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign patient to reviewer.",
        variant: "destructive",
      });
    },
  });

  // Remove assignment
  const removePatientAssignment = useMutation({
    mutationFn: ({ patientId, type }: { patientId: string; type: 'caregiver' | 'reviewer' }) =>
      removeAssignment(patientId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.patients.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.staff.workload() });
      
      toast({
        title: "Success",
        description: "Assignment removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove assignment.",
        variant: "destructive",
      });
    },
  });

  // Update patient
  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) =>
      updatePatient(id, data),
    onSuccess: (data, variables) => {
      // Update the specific patient in cache
      queryClient.setQueryData(
        adminQueryKeys.patients.detail(variables.id),
        data
      );
      // Invalidate patients list to reflect changes
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.patients.lists() });
      
      toast({
        title: "Success",
        description: "Patient updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update patient.",
        variant: "destructive",
      });
    },
  });

  // Delete patient
  const deletePatientMutation = useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: (data, patientId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: adminQueryKeys.patients.detail(patientId) });
      // Invalidate patients list
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.patients.lists() });
      
      toast({
        title: "Success",
        description: "Patient deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete patient.",
        variant: "destructive",
      });
    },
  });

  return {
    assignCaregiver,
    assignReviewer,
    removePatientAssignment,
    updatePatient: updatePatientMutation,
    deletePatient: deletePatientMutation,

    // Loading states
    isAssigningCaregiver: assignCaregiver.isPending,
    isAssigningReviewer: assignReviewer.isPending,
    isRemovingAssignment: removePatientAssignment.isPending,
    isUpdatingPatient: updatePatientMutation.isPending,
    isDeletingPatient: deletePatientMutation.isPending,
  };
}

// Optimized hook for patient details page
export function useOptimizedPatientDetails(patientId: string) {
  const { user } = useAuth();

  // Single optimized query that fetches patient details and staff data together
  const fastQuery = useQuery({
    queryKey: ['admin', 'patients', 'details', 'fast', patientId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/patients/${patientId}/fast`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch patient details');
      }

      return {
        patient: data.patient,
        availableStaff: data.availableStaff || { caregivers: [], reviewers: [] },
        stats: data.stats,
        loadTime: data.meta?.loadTime || 0
      };
    },
    enabled: !!user && !!patientId,
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  return {
    // Data
    patient: fastQuery.data?.patient || null,
    availableStaff: fastQuery.data?.availableStaff || { caregivers: [], reviewers: [] },
    stats: fastQuery.data?.stats,
    loadTime: fastQuery.data?.loadTime,

    // Loading states
    isLoading: fastQuery.isLoading,

    // Error states
    error: fastQuery.error,

    // Refetch functions
    refetch: fastQuery.refetch,
  };
}
