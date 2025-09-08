"use client";

import React, { useState } from "react";
import { Patient } from "@/lib/types/patients";
import { User } from "@/lib/auth";
import { Task } from "@/lib/types/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { usePatientTasks, useTaskMutations } from "@/hooks/use-task-queries";
import {
  ClipboardList,
  Calendar,
  Clock,
  User as UserIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlayCircle,
} from "lucide-react";

interface CaregiverTasksTabProps {
  patient: Patient;
  user: User;
}

export function CaregiverTasksTab({
  patient,
  user,
}: CaregiverTasksTabProps) {
  // Query for patient tasks assigned to current caregiver
  const {
    data: allTasks = [],
    isLoading,
    error,
    refetch
  } = usePatientTasks(patient.id);

  // Filter tasks assigned to current caregiver
  const tasks = allTasks.filter(task => task.assignedToId === user.id);

  // Task mutations
  const {
    startTask,
    completeTask,
    isStartingTask,
    isCompletingTask,
  } = useTaskMutations();

  const handleStartTask = async (taskId: string) => {
    startTask(taskId);
    await refetch();
  };

  const handleCompleteTask = async (taskId: string) => {
    completeTask(taskId);
    await refetch();
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200";
      case "medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200";
      case "low":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
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

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === "completed" || task.status === "cancelled") {
      return false;
    }
    return new Date(task.dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
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
        <CardTitle className="flex items-center">
          <ClipboardList className="h-5 w-5 mr-2" />
          My Tasks for {patient.firstName} {patient.lastName}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tasks assigned to you for this patient
        </p>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tasks assigned yet</p>
            <p className="text-sm text-muted-foreground">
              Tasks will appear here when assigned by reviewers
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} className={`${isOverdue(task) ? "border-red-200 bg-red-50 dark:bg-red-950/20" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">{task.title}</h4>
                        <Badge
                          variant="outline"
                          className={`capitalize ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.status)}
                          <Badge
                            variant="outline"
                            className={`capitalize ${getStatusColor(task.status)}`}
                          >
                            {task.status.replace("_", " ")}
                          </Badge>
                        </div>
                        {isOverdue(task) && (
                          <Badge variant="destructive">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-muted-foreground mb-3 text-sm">{task.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        {task.dueDate && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {formatDate(new Date(task.dueDate))}</span>
                          </div>
                        )}
                        {task.createdBy && (
                          <div className="flex items-center space-x-2">
                            <UserIcon className="h-4 w-4" />
                            <span>Created by: {task.createdBy.firstName} {task.createdBy.lastName}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Created: {formatDate(new Date(task.createdAt))}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {task.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleStartTask(task.id)}
                          disabled={isStartingTask}
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      )}
                      {task.status === "in_progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={isCompletingTask}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      )}
                      {task.status === "completed" && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
