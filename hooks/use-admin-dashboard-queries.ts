import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

// Types for dashboard data
export interface DashboardStats {
  totalUsers: number;
  totalPatients: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  activePatients: number;
  inactivePatients: number;
  totalCaregivers: number;
  totalReviewers: number;
  totalAdmins: number;
}

export interface RecentActivity {
  id: string;
  type: 'application_submitted' | 'application_approved' | 'application_rejected' | 'patient_created' | 'user_created';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  lastBackup: string;
}

// Query Keys for Dashboard
export const adminDashboardQueryKeys = {
  dashboard: {
    all: ['admin', 'dashboard'] as const,
    stats: () => [...adminDashboardQueryKeys.dashboard.all, 'stats'] as const,
    activity: () => [...adminDashboardQueryKeys.dashboard.all, 'activity'] as const,
    health: () => [...adminDashboardQueryKeys.dashboard.all, 'health'] as const,
  },
} as const;

// Fetch dashboard stats
async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/admin/dashboard/stats");
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }
  
  const data = await response.json();
  return data.stats;
}

// Fetch recent activity
async function fetchRecentActivity(): Promise<RecentActivity[]> {
  const response = await fetch("/api/admin/dashboard/activity");
  if (!response.ok) {
    throw new Error("Failed to fetch recent activity");
  }
  
  const data = await response.json();
  return data.activities || [];
}

// Fetch system health
async function fetchSystemHealth(): Promise<SystemHealth> {
  const response = await fetch("/api/admin/dashboard/health");
  if (!response.ok) {
    throw new Error("Failed to fetch system health");
  }
  
  const data = await response.json();
  return data.health;
}

// Dashboard Stats Query Hook
export function useDashboardStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: adminDashboardQueryKeys.dashboard.stats(),
    queryFn: fetchDashboardStats,
    enabled: !!user,
    // Refresh stats every 30 seconds
    refetchInterval: 30 * 1000,
    // Keep data fresh for 1 minute
    staleTime: 1 * 60 * 1000,
  });
}

// Recent Activity Query Hook
export function useRecentActivity() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: adminDashboardQueryKeys.dashboard.activity(),
    queryFn: fetchRecentActivity,
    enabled: !!user,
    // Refresh activity every 15 seconds
    refetchInterval: 15 * 1000,
    // Keep data fresh for 30 seconds
    staleTime: 30 * 1000,
  });
}

// System Health Query Hook
export function useSystemHealth() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: adminDashboardQueryKeys.dashboard.health(),
    queryFn: fetchSystemHealth,
    enabled: !!user,
    // Refresh health every 10 seconds
    refetchInterval: 10 * 1000,
    // Keep data fresh for 15 seconds
    staleTime: 15 * 1000,
  });
}

// Combined Dashboard Hook
export function useDashboard() {
  const statsQuery = useDashboardStats();
  const activityQuery = useRecentActivity();
  const healthQuery = useSystemHealth();

  return {
    // Data
    stats: statsQuery.data,
    activities: activityQuery.data || [],
    health: healthQuery.data,
    
    // Loading states
    isLoadingStats: statsQuery.isLoading,
    isLoadingActivity: activityQuery.isLoading,
    isLoadingHealth: healthQuery.isLoading,
    isLoading: statsQuery.isLoading || activityQuery.isLoading || healthQuery.isLoading,
    
    // Error states
    statsError: statsQuery.error,
    activityError: activityQuery.error,
    healthError: healthQuery.error,
    error: statsQuery.error || activityQuery.error || healthQuery.error,
    
    // Refetch functions
    refetchStats: statsQuery.refetch,
    refetchActivity: activityQuery.refetch,
    refetchHealth: healthQuery.refetch,
    refetchAll: () => {
      statsQuery.refetch();
      activityQuery.refetch();
      healthQuery.refetch();
    },
  };
}
