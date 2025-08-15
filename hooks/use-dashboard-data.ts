import { useState, useEffect, useMemo } from "react";

export interface DashboardStats {
  title: string;
  value: number;
  icon: React.ReactNode;
  change: string;
  changeValue: number;
  changeLabel: string;
  positive: boolean;
}

export interface Application {
  id: string;
  name: string;
  email: string;
  service: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  avatar: string;
}

export interface Activity {
  id: string;
  action: string;
  user: string;
  userId: string;
  time: string;
  description: string;
  avatar: string;
  type: "approval" | "rejection" | "onboarding" | "assignment";
}

export interface Consultation {
  id: string;
  patientName: string;
  patientId: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  careGiver: string;
}

export interface TaskProgress {
  title: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface DashboardData {
  stats: DashboardStats[];
  recentApplications: Application[];
  recentActivities: Activity[];
  upcomingConsultations: Consultation[];
  taskCompletion: TaskProgress[];
}

// Simulated API delay for realistic loading experience
const simulateApiDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock data generator (replace with actual API calls)
const generateMockData = async (): Promise<DashboardData> => {
  await simulateApiDelay();
  
  return {
    stats: [
      {
        title: "Total Patients",
        value: 37,
        icon: null, // Will be set in component
        change: "+5%",
        changeValue: 5,
        changeLabel: "from last month",
        positive: true,
      },
      {
        title: "New Applications",
        value: 12,
        icon: null,
        change: "+2",
        changeValue: 2,
        changeLabel: "since yesterday",
        positive: true,
      },
      {
        title: "Pending Approvals",
        value: 7,
        icon: null,
        change: "",
        changeValue: 0,
        changeLabel: "",
        positive: true,
      },
      {
        title: "Scheduled Consultations",
        value: 24,
        icon: null,
        change: "+3",
        changeValue: 3,
        changeLabel: "this week",
        positive: true,
      },
    ],
    recentApplications: [
      {
        id: "app-001",
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        service: "AHENEFIE",
        date: "2023-09-15",
        status: "pending",
        avatar: "/placeholder-user.jpg",
      },
      {
        id: "app-002",
        name: "Michael Smith",
        email: "m.smith@example.com",
        service: "ADAMFO PA",
        date: "2023-09-14",
        status: "approved",
        avatar: "/placeholder-user.jpg",
      },
      {
        id: "app-003",
        name: "Emma Thompson",
        email: "emma.t@example.com",
        service: "YONKO PA",
        date: "2023-09-14",
        status: "pending",
        avatar: "/placeholder-user.jpg",
      },
    ],
    recentActivities: [
      {
        id: "act-001",
        action: "Patient approved",
        user: "Admin User",
        userId: "admin1",
        time: "Just now",
        description: "Approved application for Sarah Johnson",
        avatar: "/placeholder-user.jpg",
        type: "approval",
      },
      {
        id: "act-002",
        action: "Patient onboarded",
        user: "Admin User",
        userId: "admin1",
        time: "1 hour ago",
        description: "Completed onboarding for Michael Smith",
        avatar: "/placeholder-user.jpg",
        type: "onboarding",
      },
      {
        id: "act-003",
        action: "Application rejected",
        user: "Admin User",
        userId: "admin1",
        time: "2 hours ago",
        description: "Rejected application for Daniel Brown",
        avatar: "/placeholder-user.jpg",
        type: "rejection",
      },
    ],
    upcomingConsultations: [
      {
        id: "cons-001",
        patientName: "Sarah Johnson",
        patientId: "pat-001",
        type: "Initial Assessment",
        date: "Today",
        time: "2:30 PM",
        duration: "45 minutes",
        careGiver: "Dr. Kofi Mensah",
      },
      {
        id: "cons-002",
        patientName: "Michael Smith",
        patientId: "pat-002",
        type: "Follow-up",
        date: "Tomorrow",
        time: "10:00 AM",
        duration: "30 minutes",
        careGiver: "Nurse Ama Owusu",
      },
    ],
    taskCompletion: [
      {
        title: "Application Reviews",
        completed: 5,
        total: 12,
        percentage: 42,
      },
      {
        title: "Patient Onboarding",
        completed: 3,
        total: 7,
        percentage: 43,
      },
      {
        title: "Schedule Setup",
        completed: 18,
        total: 24,
        percentage: 75,
      },
    ],
  };
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real app, replace this with actual API calls:
        // const response = await fetch('/api/admin/dashboard');
        // const data = await response.json();
        
        const dashboardData = await generateMockData();
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoize derived data to prevent unnecessary recalculations
  const memoizedData = useMemo(() => {
    if (!data) return null;
    
    return {
      ...data,
      // Add any computed properties here
      totalApplications: data.recentApplications.length,
      pendingApplications: data.recentApplications.filter(app => app.status === 'pending').length,
      approvedApplications: data.recentApplications.filter(app => app.status === 'approved').length,
    };
  }, [data]);

  return {
    data: memoizedData,
    isLoading,
    error,
    refetch: () => {
      setData(null);
      setIsLoading(true);
      // Trigger useEffect to refetch data
    }
  };
}
