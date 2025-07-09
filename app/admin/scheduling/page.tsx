"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthHeader from "@/components/auth-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth, hasPermission } from "@/lib/auth"
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  MapPin,
} from "lucide-react"

interface ScheduleEntry {
  id: string
  patientId: string
  patientName: string
  caregiverId: string
  caregiverName: string
  serviceType: string
  date: string
  startTime: string
  endTime: string
  duration: number
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show"
  location: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface ScheduleStats {
  totalAppointments: number
  todayAppointments: number
  confirmedAppointments: number
  pendingAppointments: number
}

export default function AdminSchedulingPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedService, setSelectedService] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showNewSchedule, setShowNewSchedule] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleEntry | null>(null)

  // Mock schedule data
  const mockSchedules: ScheduleEntry[] = [
    {
      id: "SCH-001",
      patientId: "5",
      patientName: "Akosua Asante",
      caregiverId: "4",
      caregiverName: "Ama Osei",
      serviceType: "AHENEFIE",
      date: "2024-01-16",
      startTime: "09:00",
      endTime: "17:00",
      duration: 480,
      status: "confirmed",
      location: "Patient's Home - East Legon",
      notes: "Regular live-in care shift",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T14:30:00Z",
    },
    {
      id: "SCH-002",
      patientId: "6",
      patientName: "Kofi Mensah",
      caregiverId: "4",
      caregiverName: "Ama Osei",
      serviceType: "ADAMFO PA",
      date: "2024-01-16",
      startTime: "14:00",
      endTime: "16:00",
      duration: 120,
      status: "scheduled",
      location: "Patient's Home - Tema",
      notes: "Daily medication check and vital signs",
      createdAt: "2024-01-15T11:00:00Z",
      updatedAt: "2024-01-15T11:00:00Z",
    },
    {
      id: "SCH-003",
      patientId: "7",
      patientName: "Abena Osei",
      caregiverId: "4",
      caregiverName: "Ama Osei",
      serviceType: "Fie Ne Fie",
      date: "2024-01-16",
      startTime: "08:00",
      endTime: "20:00",
      duration: 720,
      status: "in_progress",
      location: "Patient's Home - Accra Central",
      notes: "Childcare and light housekeeping",
      createdAt: "2024-01-14T09:00:00Z",
      updatedAt: "2024-01-16T08:00:00Z",
    },
    {
      id: "SCH-004",
      patientId: "8",
      patientName: "Kwaku Boateng",
      caregiverId: "4",
      caregiverName: "Ama Osei",
      serviceType: "YONKO PA",
      date: "2024-01-15",
      startTime: "10:00",
      endTime: "12:00",
      duration: 120,
      status: "completed",
      location: "Patient's Home - Kumasi",
      notes: "Emergency childcare request",
      createdAt: "2024-01-14T16:00:00Z",
      updatedAt: "2024-01-15T12:00:00Z",
    },
    {
      id: "SCH-005",
      patientId: "5",
      patientName: "Akosua Asante",
      caregiverId: "4",
      caregiverName: "Ama Osei",
      serviceType: "AHENEFIE",
      date: "2024-01-17",
      startTime: "09:00",
      endTime: "17:00",
      duration: 480,
      status: "scheduled",
      location: "Patient's Home - East Legon",
      createdAt: "2024-01-15T15:00:00Z",
      updatedAt: "2024-01-15T15:00:00Z",
    },
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
    if (user && !hasPermission(user.role, "admin")) {
      router.push("/dashboard")
    }
    if (user && hasPermission(user.role, "admin")) {
      loadSchedules()
    }
  }, [user, authLoading, router])

  const loadSchedules = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSchedules(mockSchedules)
    setIsLoading(false)
  }

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.caregiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDate = !selectedDate || schedule.date === selectedDate
    const matchesStatus = selectedStatus === "all" || schedule.status === selectedStatus
    const matchesService = selectedService === "all" || schedule.serviceType === selectedService

    return matchesSearch && matchesDate && matchesStatus && matchesService
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-teal-100 text-teal-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no_show":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "cancelled":
      case "no_show":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Calendar className="h-4 w-4 text-blue-500" />
    }
  }

  const getStats = (): ScheduleStats => {
    const today = new Date().toISOString().split("T")[0]
    return {
      totalAppointments: schedules.length,
      todayAppointments: schedules.filter((s) => s.date === today).length,
      confirmedAppointments: schedules.filter((s) => s.status === "confirmed").length,
      pendingAppointments: schedules.filter((s) => s.status === "scheduled").length,
    }
  }

  const stats = getStats()

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading scheduling system...</p>
        </div>
      </div>
    )
  }

  if (!user || !hasPermission(user.role, "admin")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You don't have permission to access the scheduling system.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Scheduling & Payroll</h1>
              <p className="text-slate-600 mt-2">Manage appointments, schedules, and caregiver assignments</p>
            </div>
            <Button onClick={() => setShowNewSchedule(true)} className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalAppointments}</p>
                  <p className="text-sm text-slate-600">Total Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.todayAppointments}</p>
                  <p className="text-sm text-slate-600">Today's Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.confirmedAppointments}</p>
                  <p className="text-sm text-slate-600">Confirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.pendingAppointments}</p>
                  <p className="text-sm text-slate-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Schedule Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search schedules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Services</option>
                <option value="AHENEFIE">AHENEFIE</option>
                <option value="ADAMFO PA">ADAMFO PA</option>
                <option value="Fie Ne Fie">Fie Ne Fie</option>
                <option value="YONKO PA">YONKO PA</option>
              </select>
              <Button variant="outline" className="bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Caregiver</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{new Date(schedule.date).toLocaleDateString()}</div>
                        <div className="text-sm text-slate-600">
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        <div className="text-xs text-slate-500">
                          {Math.floor(schedule.duration / 60)}h {schedule.duration % 60}m
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{schedule.patientName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{schedule.caregiverName}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{schedule.serviceType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span className="text-sm text-slate-600 truncate max-w-xs">{schedule.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(schedule.status)} flex items-center space-x-1 w-fit`}>
                        {getStatusIcon(schedule.status)}
                        <span>{schedule.status.replace("_", " ")}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedSchedule(schedule)}
                              className="bg-transparent"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Schedule Details</DialogTitle>
                            </DialogHeader>
                            {selectedSchedule && (
                              <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Appointment Information</h3>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>ID:</strong> {selectedSchedule.id}
                                      </p>
                                      <p>
                                        <strong>Service:</strong> {selectedSchedule.serviceType}
                                      </p>
                                      <p>
                                        <strong>Date:</strong> {new Date(selectedSchedule.date).toLocaleDateString()}
                                      </p>
                                      <p>
                                        <strong>Time:</strong> {selectedSchedule.startTime} - {selectedSchedule.endTime}
                                      </p>
                                      <p>
                                        <strong>Duration:</strong> {Math.floor(selectedSchedule.duration / 60)}h{" "}
                                        {selectedSchedule.duration % 60}m
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Status & Location</h3>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>Status:</strong>{" "}
                                        <Badge className={getStatusColor(selectedSchedule.status)}>
                                          {selectedSchedule.status.replace("_", " ")}
                                        </Badge>
                                      </p>
                                      <p>
                                        <strong>Location:</strong> {selectedSchedule.location}
                                      </p>
                                      <p>
                                        <strong>Created:</strong>{" "}
                                        {new Date(selectedSchedule.createdAt).toLocaleString()}
                                      </p>
                                      <p>
                                        <strong>Updated:</strong>{" "}
                                        {new Date(selectedSchedule.updatedAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Patient Information</h3>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>Name:</strong> {selectedSchedule.patientName}
                                      </p>
                                      <p>
                                        <strong>Patient ID:</strong> {selectedSchedule.patientId}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Caregiver Information</h3>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>Name:</strong> {selectedSchedule.caregiverName}
                                      </p>
                                      <p>
                                        <strong>Caregiver ID:</strong> {selectedSchedule.caregiverId}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {selectedSchedule.notes && (
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Notes</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                      <p className="text-sm text-slate-700">{selectedSchedule.notes}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" className="bg-transparent">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Schedule
                                  </Button>
                                  {selectedSchedule.status === "scheduled" && (
                                    <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Confirm
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
