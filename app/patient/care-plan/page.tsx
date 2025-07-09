"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthHeader from "@/components/auth-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"
import { Heart, Calendar, Clock, User, FileText, AlertTriangle, CheckCircle, Activity } from "lucide-react"

interface CarePlan {
  id: string
  patientId: string
  title: string
  description: string
  status: "active" | "completed" | "paused"
  startDate: string
  endDate?: string
  progress: number
  careProvider: {
    id: string
    name: string
    role: string
    phone: string
  }
  goals: CarePlanGoal[]
  activities: CarePlanActivity[]
  medications: Medication[]
  appointments: Appointment[]
}

interface CarePlanGoal {
  id: string
  title: string
  description: string
  targetDate: string
  status: "pending" | "in_progress" | "completed"
  progress: number
}

interface CarePlanActivity {
  id: string
  title: string
  description: string
  frequency: string
  lastCompleted?: string
  nextDue: string
  status: "overdue" | "due_today" | "upcoming" | "completed"
}

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  instructions: string
  prescribedBy: string
  startDate: string
  endDate?: string
}

interface Appointment {
  id: string
  title: string
  type: string
  date: string
  time: string
  provider: string
  location: string
  status: "scheduled" | "completed" | "cancelled"
}

export default function PatientCarePlanPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [carePlan, setCarePlan] = useState<CarePlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock care plan data
  const mockCarePlan: CarePlan = {
    id: "cp-001",
    patientId: "5",
    title: "Post-Surgery Recovery Plan",
    description: "Comprehensive care plan for post-surgical recovery and rehabilitation",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-03-01",
    progress: 65,
    careProvider: {
      id: "4",
      name: "Ama Osei",
      role: "Primary Care Nurse",
      phone: "+233 24 000 0004",
    },
    goals: [
      {
        id: "goal-1",
        title: "Pain Management",
        description: "Reduce pain levels to manageable levels through medication and therapy",
        targetDate: "2024-02-01",
        status: "completed",
        progress: 100,
      },
      {
        id: "goal-2",
        title: "Mobility Improvement",
        description: "Regain full mobility and strength through physical therapy",
        targetDate: "2024-02-15",
        status: "in_progress",
        progress: 75,
      },
      {
        id: "goal-3",
        title: "Wound Healing",
        description: "Complete healing of surgical site with no complications",
        targetDate: "2024-01-30",
        status: "in_progress",
        progress: 85,
      },
    ],
    activities: [
      {
        id: "act-1",
        title: "Physical Therapy Exercises",
        description: "Daily exercises to improve strength and mobility",
        frequency: "Daily",
        lastCompleted: "2024-01-14",
        nextDue: "2024-01-16",
        status: "due_today",
      },
      {
        id: "act-2",
        title: "Wound Care",
        description: "Clean and dress surgical wound",
        frequency: "Twice daily",
        lastCompleted: "2024-01-15",
        nextDue: "2024-01-15",
        status: "overdue",
      },
      {
        id: "act-3",
        title: "Medication Review",
        description: "Review current medications with care provider",
        frequency: "Weekly",
        lastCompleted: "2024-01-10",
        nextDue: "2024-01-17",
        status: "upcoming",
      },
    ],
    medications: [
      {
        id: "med-1",
        name: "Ibuprofen",
        dosage: "400mg",
        frequency: "Every 6 hours as needed",
        instructions: "Take with food to avoid stomach upset",
        prescribedBy: "Dr. Kwame Mensah",
        startDate: "2024-01-01",
        endDate: "2024-01-30",
      },
      {
        id: "med-2",
        name: "Amoxicillin",
        dosage: "500mg",
        frequency: "3 times daily",
        instructions: "Complete full course even if feeling better",
        prescribedBy: "Dr. Kwame Mensah",
        startDate: "2024-01-01",
        endDate: "2024-01-14",
      },
    ],
    appointments: [
      {
        id: "apt-1",
        title: "Follow-up Consultation",
        type: "Medical Review",
        date: "2024-01-18",
        time: "10:00 AM",
        provider: "Dr. Kwame Mensah",
        location: "ARC Medical Center",
        status: "scheduled",
      },
      {
        id: "apt-2",
        title: "Physical Therapy Session",
        type: "Therapy",
        date: "2024-01-20",
        time: "2:00 PM",
        provider: "Physical Therapy Dept",
        location: "ARC Rehabilitation Center",
        status: "scheduled",
      },
    ],
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
    if (user && user.role !== "patient") {
      router.push("/dashboard")
    }
    if (user && user.role === "patient") {
      loadCarePlan()
    }
  }, [user, authLoading, router])

  const loadCarePlan = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setCarePlan(mockCarePlan)
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "due_today":
        return "bg-yellow-100 text-yellow-800"
      case "upcoming":
        return "bg-slate-100 text-slate-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "due_today":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your care plan...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "patient") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You don't have permission to access this page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!carePlan) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert>
            <Heart className="h-4 w-4" />
            <AlertDescription>No active care plan found. Please contact your care provider.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{carePlan.title}</h1>
          <p className="text-slate-600 mt-2">{carePlan.description}</p>
          <div className="flex items-center space-x-4 mt-4">
            <Badge className={getStatusColor(carePlan.status)}>{carePlan.status.replace("_", " ")}</Badge>
            <span className="text-sm text-slate-600">
              {new Date(carePlan.startDate).toLocaleDateString()} -{" "}
              {carePlan.endDate ? new Date(carePlan.endDate).toLocaleDateString() : "Ongoing"}
            </span>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Overall Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Care Plan Progress</span>
                  <span className="text-sm text-slate-600">{carePlan.progress}%</span>
                </div>
                <Progress value={carePlan.progress} className="h-2" />
              </div>
              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="font-medium text-slate-900">{carePlan.careProvider.name}</p>
                    <p className="text-sm text-slate-600">{carePlan.careProvider.role}</p>
                    <p className="text-sm text-slate-500">{carePlan.careProvider.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Care Goals</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carePlan.goals.map((goal) => (
                  <div key={goal.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-slate-900">{goal.title}</h3>
                      <Badge className={getStatusColor(goal.status)}>{goal.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{goal.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Progress</span>
                        <span className="text-xs text-slate-600">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-1" />
                      <p className="text-xs text-slate-500">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Daily Activities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carePlan.activities.map((activity) => (
                  <div key={activity.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getActivityIcon(activity.status)}
                        <h3 className="font-medium text-slate-900">{activity.title}</h3>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>{activity.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{activity.description}</p>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>Frequency: {activity.frequency}</p>
                      {activity.lastCompleted && (
                        <p>Last completed: {new Date(activity.lastCompleted).toLocaleDateString()}</p>
                      )}
                      <p>Next due: {new Date(activity.nextDue).toLocaleDateString()}</p>
                    </div>
                    {activity.status === "due_today" || activity.status === "overdue" ? (
                      <Button size="sm" className="mt-3 bg-teal-600 hover:bg-teal-700 text-white">
                        Mark Complete
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medications and Appointments */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Current Medications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carePlan.medications.map((medication) => (
                  <div key={medication.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-slate-900">{medication.name}</h3>
                      <span className="text-sm text-slate-600">{medication.dosage}</span>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>
                        <strong>Frequency:</strong> {medication.frequency}
                      </p>
                      <p>
                        <strong>Instructions:</strong> {medication.instructions}
                      </p>
                      <p>
                        <strong>Prescribed by:</strong> {medication.prescribedBy}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(medication.startDate).toLocaleDateString()} -{" "}
                        {medication.endDate ? new Date(medication.endDate).toLocaleDateString() : "Ongoing"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Upcoming Appointments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carePlan.appointments.map((appointment) => (
                  <div key={appointment.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-slate-900">{appointment.title}</h3>
                      <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>
                        <strong>Type:</strong> {appointment.type}
                      </p>
                      <p>
                        <strong>Date & Time:</strong> {new Date(appointment.date).toLocaleDateString()} at{" "}
                        {appointment.time}
                      </p>
                      <p>
                        <strong>Provider:</strong> {appointment.provider}
                      </p>
                      <p>
                        <strong>Location:</strong> {appointment.location}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="mt-3 bg-transparent">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
