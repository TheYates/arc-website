"use client";

import React, { useState } from "react";
import { Patient } from "@/lib/types/patients";
import { User } from "@/lib/auth";
import { Task } from "@/lib/types/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
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
          <Accordion type="multiple" className="space-y-2">
            {tasks.map((task) => (
              <AccordionItem 
                key={task.id} 
                value={task.id}
                className="border rounded-lg bg-card"
              >
                <div className="flex items-center px-4 py-3">
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={(checked) => {
                      if (checked && task.status !== "completed") {
                        if (task.status === "pending") {
                          handleStartTask(task.id);
                          setTimeout(() => handleCompleteTask(task.id), 100);
                        } else {
                          handleCompleteTask(task.id);
                        }
                      }
                    }}
                    disabled={task.status === "completed" || isStartingTask || isCompletingTask}
                    className="mr-3"
                  />
                  <AccordionTrigger className="flex-1 hover:no-underline px-0 py-0">
                    <div className="flex items-center justify-between w-full">
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
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {task.createdBy && (
                          <div className="flex items-center space-x-1">
                            <UserIcon className="h-3 w-3" />
                            <span>{task.createdBy.firstName} {task.createdBy.lastName}</span>
                          </div>
                        )}
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
                </div>
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
                    

                    <div className="flex items-center justify-start pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        {task.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleStartTask(task.id)}
                            disabled={isStartingTask}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Start Task
                          </Button>
                        )}
                        {task.status === "in_progress" && (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteTask(task.id)}
                            disabled={isCompletingTask}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
