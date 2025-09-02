import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

// Types for applications (you may need to adjust these based on your actual types)
export interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  serviceName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Query Keys for Applications
export const adminApplicationQueryKeys = {
  applications: {
    all: ['admin', 'applications'] as const,
    lists: () => [...adminApplicationQueryKeys.applications.all, 'list'] as const,
    list: (filters?: { status?: string; service?: string; search?: string }) => 
      [...adminApplicationQueryKeys.applications.lists(), filters] as const,
    details: () => [...adminApplicationQueryKeys.applications.all, 'detail'] as const,
    detail: (id: string) => [...adminApplicationQueryKeys.applications.details(), id] as const,
  },
} as const;

// Fetch all applications
async function fetchApplications(): Promise<Application[]> {
  const response = await fetch("/api/admin/applications");
  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }
  
  const data = await response.json();
  return data.applications || [];
}

// Approve application
async function approveApplication(applicationId: string, notes?: string): Promise<Application> {
  const response = await fetch(`/api/admin/applications/${applicationId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ notes }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to approve application");
  }
  
  const data = await response.json();
  return data.application;
}

// Reject application
async function rejectApplication(applicationId: string, notes?: string): Promise<Application> {
  const response = await fetch(`/api/admin/applications/${applicationId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ notes }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to reject application");
  }
  
  const data = await response.json();
  return data.application;
}

// Delete application
async function deleteApplication(applicationId: string): Promise<void> {
  const response = await fetch(`/api/admin/applications/${applicationId}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete application");
  }
}

// Applications Query Hook
export function useApplications(filters?: { status?: string; service?: string; search?: string }) {
  return useQuery({
    queryKey: adminApplicationQueryKeys.applications.list(filters),
    queryFn: fetchApplications,
    select: (data) => {
      let filteredApplications = data;
      
      // Apply status filter
      if (filters?.status && filters.status !== "all") {
        filteredApplications = filteredApplications.filter(app => app.status === filters.status);
      }
      
      // Apply service filter
      if (filters?.service && filters.service !== "all") {
        filteredApplications = filteredApplications.filter(app => app.serviceName === filters.service);
      }
      
      // Apply search filter
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredApplications = filteredApplications.filter(app => 
          app.firstName.toLowerCase().includes(searchTerm) ||
          app.lastName.toLowerCase().includes(searchTerm) ||
          app.email.toLowerCase().includes(searchTerm) ||
          app.serviceName.toLowerCase().includes(searchTerm)
        );
      }
      
      return filteredApplications;
    },
  });
}

// Application Mutations Hook
export function useApplicationMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Approve application mutation
  const approveApplicationMutation = useMutation({
    mutationFn: ({ applicationId, notes }: { applicationId: string; notes?: string }) =>
      approveApplication(applicationId, notes),
    onSuccess: (updatedApplication, variables) => {
      // Update in cache
      queryClient.setQueryData(
        adminApplicationQueryKeys.applications.lists(),
        (oldData: Application[] | undefined) => {
          return oldData?.map(app => 
            app.id === variables.applicationId ? updatedApplication : app
          ) || [];
        }
      );
      
      // Invalidate to refetch with filters
      queryClient.invalidateQueries({ queryKey: adminApplicationQueryKeys.applications.lists() });
      
      toast({
        title: "Application Approved",
        description: `Application for ${updatedApplication.firstName} ${updatedApplication.lastName} has been approved.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error Approving Application",
        description: error instanceof Error ? error.message : "Failed to approve application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reject application mutation
  const rejectApplicationMutation = useMutation({
    mutationFn: ({ applicationId, notes }: { applicationId: string; notes?: string }) =>
      rejectApplication(applicationId, notes),
    onSuccess: (updatedApplication, variables) => {
      // Update in cache
      queryClient.setQueryData(
        adminApplicationQueryKeys.applications.lists(),
        (oldData: Application[] | undefined) => {
          return oldData?.map(app => 
            app.id === variables.applicationId ? updatedApplication : app
          ) || [];
        }
      );
      
      // Invalidate to refetch with filters
      queryClient.invalidateQueries({ queryKey: adminApplicationQueryKeys.applications.lists() });
      
      toast({
        title: "Application Rejected",
        description: `Application for ${updatedApplication.firstName} ${updatedApplication.lastName} has been rejected.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error Rejecting Application",
        description: error instanceof Error ? error.message : "Failed to reject application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete application mutation
  const deleteApplicationMutation = useMutation({
    mutationFn: (applicationId: string) => deleteApplication(applicationId),
    onSuccess: (_, applicationId) => {
      // Remove from cache
      queryClient.setQueryData(
        adminApplicationQueryKeys.applications.lists(),
        (oldData: Application[] | undefined) => {
          return oldData?.filter(app => app.id !== applicationId) || [];
        }
      );
      
      // Invalidate to refetch with filters
      queryClient.invalidateQueries({ queryKey: adminApplicationQueryKeys.applications.lists() });
      
      toast({
        title: "Application Deleted",
        description: "Application has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Deleting Application",
        description: error instanceof Error ? error.message : "Failed to delete application. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    approveApplication: approveApplicationMutation,
    rejectApplication: rejectApplicationMutation,
    deleteApplication: deleteApplicationMutation,
    
    // Loading states
    isApprovingApplication: approveApplicationMutation.isPending,
    isRejectingApplication: rejectApplicationMutation.isPending,
    isDeletingApplication: deleteApplicationMutation.isPending,
  };
}
