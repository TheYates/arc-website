"use client";

import React, { useState } from "react";
import { Patient } from "@/lib/types/patients";
import { User } from "@/lib/auth";
import { Task, CreateTaskData, TaskPriority } from "@/lib/types/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

const formatSmartDate = (date: Date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = today.getTime() - inputDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  return formatDate(date);
};
import { usePatientTasks, useTaskMutations } from "@/hooks/use-task-queries";
import {
  ClipboardList,
  Plus,
  Clock,
  User as UserIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  PlayCircle,
} from "lucide-react";

interface ReviewerTasksTabProps {
  patient: Patient;
  user: User;
  onTaskCreated?: () => Promise<void>;
}

export function ReviewerTasksTab({
  patient,
  user,
  onTaskCreated,
}: ReviewerTasksTabProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Query for patient tasks
  const {
    data: tasks = [],
    isLoading,
    error,
    refetch
  } = usePatientTasks(patient.id);

  // Task mutations
  const {
    createTask,
    updateTask,
    deleteTask,
    isCreatingTask,
    isUpdatingTask,
    isDeletingTask,
  } = useTaskMutations();

  const handleTaskCreated = async () => {
    await refetch();
    if (onTaskCreated) {
      await onTaskCreated();
    }
    setShowCreateForm(false);
  };

  const handleTaskUpdated = async () => {
    await refetch();
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
      await refetch();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Failed to load tasks</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <ClipboardList className="h-5 w-5 mr-2" />
              Tasks for {patient.firstName} {patient.lastName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and assign tasks to caregivers
            </p>
          </div>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <TaskForm
                patient={patient}
                user={user}
                onSubmit={createTask}
                onSuccess={handleTaskCreated}
                isSubmitting={isCreatingTask}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tasks created yet</p>
            <p className="text-sm text-muted-foreground">
              Create tasks to assign work to caregivers
            </p>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {tasks.map((task) => (
              <AccordionItem 
                key={task.id} 
                value={task.id}
                className="border rounded-lg bg-card"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full mr-2">
                    <div className="flex items-center space-x-3">
                      <span className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(task.status)}
                        <Badge
                          variant="outline"
                          className={`capitalize ${getStatusColor(task.status)}`}
                        >
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                      {task.assignedTo && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <UserIcon className="h-3 w-3" />
                          <span>{task.assignedTo.firstName} {task.assignedTo.lastName}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatSmartDate(new Date(task.createdAt))}</span>
                      </div>
                      {task.completedAt && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>{formatSmartDate(new Date(task.completedAt))}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    {task.description && (
                      <div>
                        <h5 className="font-medium mb-2">Task Details:</h5>
                        <div className="text-sm text-muted-foreground whitespace-pre-line bg-muted p-3 rounded-md">
                          {task.description}
                        </div>
                      </div>
                    )}
                    

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTask(task)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={isDeletingTask}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Edit Task Dialog */}
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            {editingTask && (
              <TaskForm
                patient={patient}
                user={user}
                task={editingTask}
                onSubmit={(data) => updateTask({ taskId: editingTask.id, updates: data })}
                onSuccess={handleTaskUpdated}
                isSubmitting={isUpdatingTask}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Task Form Component
interface TaskFormProps {
  patient: Patient;
  user: User;
  task?: Task;
  onSubmit: (data: any) => void;
  onSuccess: () => void;
  isSubmitting: boolean;
}

function TaskForm({ patient, user, task, onSubmit, onSuccess, isSubmitting }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = task ? {
      ...formData,
    } : {
      ...formData,
      patientId: patient.id,
    };

    onSubmit(submitData);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter task title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Task List (one task per line)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter tasks, one per line:&#10;• Review patient vitals&#10;• Check medication compliance&#10;• Update care plan"
          rows={5}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Tip: Use bullet points (•) or numbers for better organization
        </p>
      </div>

      {!task && (
        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Auto-Assignment:</strong> This task will be automatically assigned to all caregivers currently assigned to {patient.firstName} {patient.lastName}.
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
