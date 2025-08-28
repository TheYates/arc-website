"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import { useAuth } from "@/lib/auth";
import { RoleHeader } from "@/components/role-header";
import { authenticatedGet, authenticatedPost, authenticatedDelete } from "@/lib/api/auth-headers";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Plus,
  Edit,
  Trash2,
  CalendarDays,
  CalendarIcon,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createScheduleSchema, validateScheduleForm, getScheduleValidationErrors } from "@/lib/validations/schedule";

interface CaregiverSchedule {
  id: string;
  scheduleType: string;
  title: string;
  description?: string;
  scheduledDate: string;
  status: string;
  notes?: string;
  patient: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface Patient {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function CaregiverSchedulesPage() {
  const [schedules, setSchedules] = useState<CaregiverSchedule[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [newScheduleDialog, setNewScheduleDialog] = useState({
    isOpen: false,
    isSubmitting: false,
    formData: {
      patientId: "",
      scheduleType: "ROUTINE_VISIT",
      scheduledDate: undefined as Date | undefined,
      notes: "",
    },
    errors: {} as Record<string, string>,
  });
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "caregiver") {
        router.push("/");
        return;
      }
      fetchSchedules();
      fetchPatients();
    }
  }, [user, authLoading, router]);

  const fetchSchedules = async () => {
    try {
      const response = await authenticatedGet("/api/caregiver-schedules", user);

      if (!response.ok) {
        throw new Error("Failed to fetch schedules");
      }

      const data = await response.json();
      setSchedules(data.schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        title: "Error",
        description: "Failed to load schedules",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await authenticatedGet("/api/patients", user);

      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }

      const data = await response.json();
      setPatients(data.patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: { label: "Scheduled", variant: "default" as const, icon: CalendarDays },
      IN_PROGRESS: { label: "In Progress", variant: "default" as const, icon: Loader2 },
      COMPLETED: { label: "Completed", variant: "default" as const, icon: CheckCircle },
      CANCELLED: { label: "Cancelled", variant: "destructive" as const, icon: XCircle },
      RESCHEDULED: { label: "Rescheduled", variant: "secondary" as const, icon: CalendarDays },
      NO_SHOW: { label: "No Show", variant: "destructive" as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getScheduleTypeBadge = (type: string) => {
    const typeConfig = {
      ROUTINE_VISIT: { label: "Routine", className: "bg-blue-100 text-blue-800" },
      EMERGENCY_VISIT: { label: "Emergency", className: "bg-red-100 text-red-800" },
      FOLLOW_UP: { label: "Follow-up", className: "bg-green-100 text-green-800" },
      ASSESSMENT: { label: "Assessment", className: "bg-purple-100 text-purple-800" },
      MEDICATION: { label: "Medication", className: "bg-orange-100 text-orange-800" },
      THERAPY: { label: "Therapy", className: "bg-teal-100 text-teal-800" },
      CONSULTATION: { label: "Consultation", className: "bg-indigo-100 text-indigo-800" },
      OTHER: { label: "Other", className: "bg-gray-100 text-gray-800" },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.OTHER;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status: string) => {
    const statusConfig = {
      SCHEDULED: { label: "Scheduled", color: "text-blue-600" },
      IN_PROGRESS: { label: "In Progress", color: "text-orange-600" },
      COMPLETED: { label: "Completed", color: "text-green-600" },
      CANCELLED: { label: "Cancelled", color: "text-red-600" },
      RESCHEDULED: { label: "Rescheduled", color: "text-purple-600" },
      NO_SHOW: { label: "No Show", color: "text-red-600" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED;
    return <span className={config.color}>{config.label}</span>;
  };

  const handleEditSchedule = (schedule: CaregiverSchedule) => {
    // TODO: Implement edit functionality
    toast({
      title: "Edit Schedule",
      description: "Edit functionality will be implemented soon",
    });
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) {
      return;
    }

    try {
      const response = await authenticatedDelete(`/api/caregiver-schedules/${scheduleId}`, user);

      if (!response.ok) {
        throw new Error("Failed to delete schedule");
      }

      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });

      fetchSchedules(); // Refresh the list
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  const handleNewSchedule = () => {
    setNewScheduleDialog(prev => ({
      ...prev,
      isOpen: true,
      formData: {
        patientId: "",
        scheduleType: "ROUTINE_VISIT",
        scheduledDate: undefined,
        notes: "",
      },
      errors: {},
    }));
  };

  const handleSubmitNewSchedule = async () => {
    const { formData } = newScheduleDialog;

    // Validate form data with Zod
    const validation = validateScheduleForm(formData);
    
    if (!validation.success) {
      const fieldErrors = getScheduleValidationErrors(validation.error);
      
      setNewScheduleDialog(prev => ({ 
        ...prev, 
        errors: fieldErrors 
      }));
      
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      });
      return;
    }

    // Clear any previous errors
    setNewScheduleDialog(prev => ({ ...prev, errors: {}, isSubmitting: true }));

    // Generate title based on schedule type
    const scheduleTypeLabels = {
      ROUTINE_VISIT: "Routine Visit",
      EMERGENCY_VISIT: "Emergency Visit",
      FOLLOW_UP: "Follow-up",
      MEDICATION_ADMINISTRATION: "Medication Administration",
      VITAL_SIGNS_CHECK: "Vital Signs Check",
      WOUND_CARE: "Wound Care",
      PHYSICAL_THERAPY: "Physical Therapy",
      CONSULTATION: "Consultation",
    };

    const title = scheduleTypeLabels[validation.data.scheduleType as keyof typeof scheduleTypeLabels] || "Visit";

    try {
      const response = await authenticatedPost("/api/caregiver-schedules", user, {
        patientId: validation.data.patientId,
        scheduleType: validation.data.scheduleType,
        title,
        scheduledDate: validation.data.scheduledDate.toISOString(),
        notes: validation.data.notes || "",
      });

      if (!response.ok) {
        throw new Error("Failed to create schedule");
      }

      // Show success toast with Sonner
      sonnerToast.success("Schedule Created Successfully!", {
        description: `${title} scheduled for ${validation.data.scheduledDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        })}`,
        duration: 4000,
      });

      // Also show the regular toast for consistency
      toast({
        title: "Success",
        description: "Schedule created successfully",
      });

      setNewScheduleDialog({
        isOpen: false,
        isSubmitting: false,
        formData: {
          patientId: "",
          scheduleType: "ROUTINE_VISIT",
          scheduledDate: undefined,
          notes: "",
        },
        errors: {},
      });

      fetchSchedules(); // Refresh the list
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to create schedule",
        variant: "destructive",
      });
    } finally {
      setNewScheduleDialog(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const filterSchedulesByStatus = (status: string) => {
    const now = new Date();
    switch (status) {
      case "upcoming":
        return schedules.filter(schedule => 
          (schedule.status === "SCHEDULED" || schedule.status === "IN_PROGRESS") &&
          new Date(schedule.scheduledDate) >= now
        );
      case "past":
        return schedules.filter(schedule => 
          new Date(schedule.scheduledDate) < now &&
          (schedule.status === "COMPLETED" || schedule.status === "CANCELLED" || schedule.status === "NO_SHOW")
        );
      case "today":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return schedules.filter(schedule => {
          const scheduleDate = new Date(schedule.scheduledDate);
          return scheduleDate >= today && scheduleDate < tomorrow;
        });
      default:
        return schedules;
    }
  };

  const filteredSchedules = filterSchedulesByStatus(activeTab);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleHeader role="caregiver" />
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Tabs Skeleton */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-24" />
            ))}
          </div>

          {/* Schedule Cards Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "caregiver") {
    return (
      <div className="min-h-screen bg-background">
        <RoleHeader role="caregiver" />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <div className="text-muted-foreground">
              Access denied. Caregiver role required.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleHeader role="caregiver" />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Schedule</h1>
            <p className="text-muted-foreground">
              Manage your patient visits and appointments
            </p>
          </div>
          <Button onClick={handleNewSchedule}>
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">
              Today ({filterSchedulesByStatus("today").length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({filterSchedulesByStatus("upcoming").length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({filterSchedulesByStatus("past").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredSchedules.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Schedules</h3>
                    <p className="text-muted-foreground mb-4">
                      No {activeTab} schedules at the moment.
                    </p>
                    <Button onClick={handleNewSchedule}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Service</TableHead>
                        <TableHead className="w-[140px]">Patient</TableHead>
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="w-[80px] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSchedules.map((schedule) => (
                        <TableRow
                          key={schedule.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{schedule.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {getScheduleTypeBadge(schedule.scheduleType)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {schedule.patient.user.firstName} {schedule.patient.user.lastName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(schedule.scheduledDate)}</div>
                             
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getStatusBadge(schedule.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSchedule(schedule)}
                                title="Edit schedule"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSchedule(schedule.id)}
                                title="Delete schedule"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* New Schedule Dialog */}
      <Dialog
        open={newScheduleDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setNewScheduleDialog({
              isOpen: false,
              isSubmitting: false,
              formData: {
                patientId: "",
                scheduleType: "ROUTINE_VISIT",
                scheduledDate: undefined,
                notes: "",
              },
              errors: {},
            });
          }
        }}
        modal={true}
      >
        <DialogContent 
          className="sm:max-w-[425px] z-[50]"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div onMouseDown={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>New Schedule</DialogTitle>
            <DialogDescription>
              Create a new patient visit schedule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Popover modal open={patientSearchOpen} onOpenChange={setPatientSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={patientSearchOpen}
                    className={cn(
                      "w-full justify-between",
                      newScheduleDialog.errors.patientId ? "border-red-500" : ""
                    )}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {newScheduleDialog.formData.patientId ? (
                      (() => {
                        const selectedPatient = patients.find(
                          patient => patient.id === newScheduleDialog.formData.patientId
                        );
                        return selectedPatient
                          ? `${selectedPatient.user.firstName} ${selectedPatient.user.lastName}`
                          : "Select patient...";
                      })()
                    ) : (
                      "Select patient..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[--radix-popover-trigger-width] p-0 z-[100]"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onPointerDownOutside={(e) => e.preventDefault()}
                  onInteractOutside={(e) => e.preventDefault()}
                  side="bottom"
                  align="start"
                  sideOffset={4}
                >
                  <div 
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="relative z-[100]"
                  >
                    <Command>
                      <CommandInput placeholder="Search patients..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No patient found.</CommandEmpty>
                        <CommandGroup>
                          {patients.map((patient) => (
                            <CommandItem
                              key={patient.id}
                              value={`${patient.user.firstName} ${patient.user.lastName} ${patient.user.email}`}
                              onSelect={() => {
                                setNewScheduleDialog(prev => ({
                                  ...prev,
                                  formData: { ...prev.formData, patientId: patient.id }
                                }));
                                setPatientSearchOpen(false);
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  newScheduleDialog.formData.patientId === patient.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{patient.user.firstName} {patient.user.lastName}</span>
                                <span className="text-sm text-muted-foreground">{patient.user.email}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                </PopoverContent>
              </Popover>
              {newScheduleDialog.errors.patientId && (
                <p className="text-sm text-red-500">{newScheduleDialog.errors.patientId}</p>
              )}
            </div>

            {/* Schedule Type */}
            <div className="space-y-2">
              <Label htmlFor="scheduleType">Schedule Type *</Label>
              <Select
                value={newScheduleDialog.formData.scheduleType}
                onValueChange={(value) =>
                  setNewScheduleDialog(prev => ({
                    ...prev,
                    formData: { ...prev.formData, scheduleType: value }
                  }))
                }
              >
                <SelectTrigger className={newScheduleDialog.errors.scheduleType ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROUTINE_VISIT">Routine Visit</SelectItem>
                  <SelectItem value="EMERGENCY_VISIT">Emergency Visit</SelectItem>
                  <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                  <SelectItem value="MEDICATION_ADMINISTRATION">Medication Administration</SelectItem>
                  <SelectItem value="VITAL_SIGNS_CHECK">Vital Signs Check</SelectItem>
                  <SelectItem value="WOUND_CARE">Wound Care</SelectItem>
                  <SelectItem value="PHYSICAL_THERAPY">Physical Therapy</SelectItem>
                  <SelectItem value="CONSULTATION">Consultation</SelectItem>
                </SelectContent>
              </Select>
              {newScheduleDialog.errors.scheduleType && (
                <p className="text-sm text-red-500">{newScheduleDialog.errors.scheduleType}</p>
              )}
            </div>

            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label htmlFor="scheduled-date">Scheduled Date *</Label>
              <Popover modal>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newScheduleDialog.formData.scheduledDate && "text-muted-foreground",
                      newScheduleDialog.errors.scheduledDate ? "border-red-500" : ""
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newScheduleDialog.formData.scheduledDate ? (
                      format(newScheduleDialog.formData.scheduledDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newScheduleDialog.formData.scheduledDate}
                    onSelect={(date: Date | undefined) => {
                      setNewScheduleDialog(prev => ({
                        ...prev,
                        formData: { ...prev.formData, scheduledDate: date },
                      }));
                    }}
                    disabled={(date: Date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {newScheduleDialog.errors.scheduledDate && (
                <p className="text-sm text-red-500">{newScheduleDialog.errors.scheduledDate}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={newScheduleDialog.formData.notes}
                onChange={(e) =>
                  setNewScheduleDialog(prev => ({
                    ...prev,
                    formData: { ...prev.formData, notes: e.target.value }
                  }))
                }
                className={newScheduleDialog.errors.notes ? "border-red-500" : ""}
                placeholder="Add any additional notes for this visit..."
                rows={3}
                maxLength={500}
              />
              {newScheduleDialog.errors.notes && (
                <p className="text-sm text-red-500">{newScheduleDialog.errors.notes}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {newScheduleDialog.formData.notes.length}/500 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewScheduleDialog({
                  isOpen: false,
                  isSubmitting: false,
                  formData: {
                    patientId: "",
                    scheduleType: "ROUTINE_VISIT",
                    scheduledDate: undefined,
                    notes: "",
                  },
                  errors: {},
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitNewSchedule}
              disabled={newScheduleDialog.isSubmitting}
            >
              {newScheduleDialog.isSubmitting ? "Creating..." : "Create Schedule"}
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
