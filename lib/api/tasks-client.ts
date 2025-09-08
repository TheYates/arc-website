import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete } from "@/lib/api/auth-headers";
import { Task, CreateTaskData, UpdateTaskData, TaskFilters } from "@/lib/types/tasks";
import { User } from "@/lib/auth";

// Get tasks with optional filtering
export async function getTasks(user: User | null, filters?: TaskFilters): Promise<Task[]> {
  try {
    const searchParams = new URLSearchParams();

    if (filters?.patientId) searchParams.append("patientId", filters.patientId);
    if (filters?.createdById) searchParams.append("createdById", filters.createdById);
    if (filters?.assignedToId) searchParams.append("assignedToId", filters.assignedToId);
    if (filters?.status) searchParams.append("status", filters.status);
    if (filters?.priority) searchParams.append("priority", filters.priority);
    if (filters?.dueBefore) searchParams.append("dueBefore", filters.dueBefore);
    if (filters?.dueAfter) searchParams.append("dueAfter", filters.dueAfter);

    const url = `/api/tasks${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await authenticatedGet(url, user);

    if (!response.ok) {
      let errorMessage = "Failed to fetch tasks";
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        // If response body is empty or invalid JSON, use status text
        errorMessage = `${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.tasks || [];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

// Get tasks for a specific patient
export async function getTasksByPatient(user: User | null, patientId: string): Promise<Task[]> {
  return getTasks(user, { patientId });
}

// Get tasks assigned to a specific caregiver
export async function getTasksByCaregiver(user: User | null, caregiverId: string): Promise<Task[]> {
  return getTasks(user, { assignedToId: caregiverId });
}

// Get tasks created by a specific reviewer
export async function getTasksByReviewer(user: User | null, reviewerId: string): Promise<Task[]> {
  return getTasks(user, { createdById: reviewerId });
}

// Get a specific task by ID
export async function getTaskById(user: User | null, taskId: string): Promise<Task> {
  try {
    const response = await authenticatedGet(`/api/tasks/${taskId}`, user);

    if (!response.ok) {
      let errorMessage = "Failed to fetch task";
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        // If response body is empty or invalid JSON, use status text
        errorMessage = `${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.task;
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
}

// Create a new task
export async function createTask(user: User | null, taskData: CreateTaskData): Promise<Task[]> {
  try {
    const response = await authenticatedPost("/api/tasks", user, taskData);

    if (!response.ok) {
      let errorMessage = "Failed to create task";
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        // If response body is empty or invalid JSON, use status text
        errorMessage = `${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.tasks || []; // Return array of tasks created for all assigned caregivers
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

// Update a task
export async function updateTask(user: User | null, taskId: string, updates: UpdateTaskData): Promise<Task> {
  try {
    const response = await authenticatedPut(`/api/tasks/${taskId}`, user, updates);

    if (!response.ok) {
      let errorMessage = "Failed to update task";
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        // If response body is empty or invalid JSON, use status text
        errorMessage = `${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.task;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

// Mark task as completed
export async function completeTask(user: User | null, taskId: string): Promise<Task> {
  return updateTask(user, taskId, { status: "completed" });
}

// Mark task as in progress
export async function startTask(user: User | null, taskId: string): Promise<Task> {
  return updateTask(user, taskId, { status: "in_progress" });
}

// Cancel a task
export async function cancelTask(user: User | null, taskId: string): Promise<Task> {
  return updateTask(user, taskId, { status: "cancelled" });
}

// Delete a task
export async function deleteTask(user: User | null, taskId: string): Promise<void> {
  try {
    const response = await authenticatedDelete(`/api/tasks/${taskId}`, user);

    if (!response.ok) {
      let errorMessage = "Failed to delete task";
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        // If response body is empty or invalid JSON, use status text
        errorMessage = `${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

// Get task statistics
export async function getTaskStats(user: User | null, filters?: TaskFilters): Promise<{
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}> {
  try {
    const tasks = await getTasks(user, filters);
    const now = new Date();

    const stats = {
      total: tasks.length,
      pending: tasks.filter(task => task.status === "pending").length,
      inProgress: tasks.filter(task => task.status === "in_progress").length,
      completed: tasks.filter(task => task.status === "completed").length,
      overdue: tasks.filter(task =>
        task.status !== "completed" &&
        task.status !== "cancelled" &&
        task.dueDate &&
        new Date(task.dueDate) < now
      ).length
    };

    return stats;
  } catch (error) {
    console.error("Error fetching task stats:", error);
    throw error;
  }
}
