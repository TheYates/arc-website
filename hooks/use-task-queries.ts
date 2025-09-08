import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import {
  getTasks,
  getTasksByPatient,
  getTasksByCaregiver,
  getTasksByReviewer,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  startTask,
  cancelTask,
  getTaskStats
} from "@/lib/api/tasks-client";
import { Task, CreateTaskData, UpdateTaskData, TaskFilters } from "@/lib/types/tasks";

// Query Keys
export const taskQueryKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskQueryKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskQueryKeys.lists(), filters] as const,
  details: () => [...taskQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskQueryKeys.details(), id] as const,
  stats: (filters?: TaskFilters) => [...taskQueryKeys.all, 'stats', filters] as const,
  patient: (patientId: string) => [...taskQueryKeys.all, 'patient', patientId] as const,
  caregiver: (caregiverId: string) => [...taskQueryKeys.all, 'caregiver', caregiverId] as const,
  reviewer: (reviewerId: string) => [...taskQueryKeys.all, 'reviewer', reviewerId] as const,
} as const;

// Get all tasks with filters
export function useTasks(filters?: TaskFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: taskQueryKeys.list(filters || {}),
    queryFn: () => getTasks(user, filters),
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
}

// Get tasks for a specific patient
export function usePatientTasks(patientId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: taskQueryKeys.patient(patientId),
    queryFn: () => getTasksByPatient(user, patientId),
    enabled: !!patientId && !!user,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

// Get tasks assigned to current caregiver
export function useCaregiverTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: taskQueryKeys.caregiver(user?.id || ''),
    queryFn: () => getTasksByCaregiver(user, user!.id),
    enabled: !!user && user.role === 'caregiver',
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

// Get tasks created by current reviewer
export function useReviewerTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: taskQueryKeys.reviewer(user?.id || ''),
    queryFn: () => getTasksByReviewer(user, user!.id),
    enabled: !!user && user.role === 'reviewer',
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

// Get specific task by ID
export function useTask(taskId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: taskQueryKeys.detail(taskId),
    queryFn: () => getTaskById(user, taskId),
    enabled: !!taskId && !!user,
    staleTime: 30 * 1000,
  });
}

// Get task statistics
export function useTaskStats(filters?: TaskFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: taskQueryKeys.stats(filters),
    queryFn: () => getTaskStats(user, filters),
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

// Task Mutations
export function useTaskMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const createTaskMutation = useMutation({
    mutationFn: (taskData: CreateTaskData) => createTask(user, taskData),
    onSuccess: (newTasks) => {
      // Invalidate and refetch task lists
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.lists() });

      // Invalidate queries for each task created
      newTasks.forEach(task => {
        queryClient.invalidateQueries({ queryKey: taskQueryKeys.patient(task.patientId) });
        queryClient.invalidateQueries({ queryKey: taskQueryKeys.caregiver(task.assignedToId) });
        queryClient.invalidateQueries({ queryKey: taskQueryKeys.reviewer(task.createdById) });
      });

      queryClient.invalidateQueries({ queryKey: taskQueryKeys.stats() });

      const taskCount = newTasks.length;
      sonnerToast.success(`Task created and assigned to ${taskCount} caregiver${taskCount > 1 ? 's' : ''}`);
    },
    onError: (error: Error) => {
      console.error("Create task error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: UpdateTaskData }) =>
      updateTask(user, taskId, updates),
    onSuccess: (updatedTask) => {
      // Update the specific task in cache
      queryClient.setQueryData(
        taskQueryKeys.detail(updatedTask.id),
        updatedTask
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.patient(updatedTask.patientId) });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.caregiver(updatedTask.assignedToId) });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.reviewer(updatedTask.createdById) });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.stats() });
      
      sonnerToast.success("Task updated successfully");
    },
    onError: (error: Error) => {
      console.error("Update task error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(user, taskId),
    onSuccess: (_, taskId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: taskQueryKeys.detail(taskId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.stats() });
      
      sonnerToast.success("Task deleted successfully");
    },
    onError: (error: Error) => {
      console.error("Delete task error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => completeTask(user, taskId),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(
        taskQueryKeys.detail(updatedTask.id),
        updatedTask
      );
      
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.patient(updatedTask.patientId) });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.caregiver(updatedTask.assignedToId) });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.stats() });
      
      sonnerToast.success("Task completed successfully");
    },
    onError: (error: Error) => {
      console.error("Complete task error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete task",
        variant: "destructive",
      });
    },
  });

  const startTaskMutation = useMutation({
    mutationFn: (taskId: string) => startTask(user, taskId),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(
        taskQueryKeys.detail(updatedTask.id),
        updatedTask
      );
      
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.patient(updatedTask.patientId) });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.caregiver(updatedTask.assignedToId) });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.stats() });
      
      sonnerToast.success("Task started");
    },
    onError: (error: Error) => {
      console.error("Start task error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start task",
        variant: "destructive",
      });
    },
  });

  const cancelTaskMutation = useMutation({
    mutationFn: (taskId: string) => cancelTask(user, taskId),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(
        taskQueryKeys.detail(updatedTask.id),
        updatedTask
      );
      
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.patient(updatedTask.patientId) });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.caregiver(updatedTask.assignedToId) });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.stats() });
      
      sonnerToast.success("Task cancelled");
    },
    onError: (error: Error) => {
      console.error("Cancel task error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel task",
        variant: "destructive",
      });
    },
  });

  return {
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    completeTask: completeTaskMutation.mutate,
    startTask: startTaskMutation.mutate,
    cancelTask: cancelTaskMutation.mutate,
    isCreatingTask: createTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
    isCompletingTask: completeTaskMutation.isPending,
    isStartingTask: startTaskMutation.isPending,
    isCancellingTask: cancelTaskMutation.isPending,
  };
}
