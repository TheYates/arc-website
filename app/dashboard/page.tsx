"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthHeader from "@/components/auth-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import {
  Users,
  Activity,
  FileText,
  Calendar,
  Heart,
  Shield,
  AlertCircle,
  TrendingUp,
  MessageSquare,
} from "lucide-react"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getDashboardContent = () => {
    switch (user.role) {
      case "patient":
        return (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">Active</p>
                      <p className="text-sm text-slate-600">Care Plan Status</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">3</p>
                      <p className="text-sm text-slate-600">Upcoming Visits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">12</p>
                      <p className="text-sm text-slate-600">Activities Logged</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">2</p>
                      <p className="text-sm text-slate-600">New Messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Heart className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Vital Signs Recorded</p>
                        <p className="text-sm text-slate-600">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Medication Administered</p>
                        <p className="text-sm text-slate-600">4 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Nurse Ama Visit</p>
                        <p className="text-sm text-slate-600">Tomorrow, 10:00 AM</p>
                      </div>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Dr. Mensah Review</p>
                        <p className="text-sm text-slate-600">Friday, 2:00 PM</p>
                      </div>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "care_giver":
        return (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">8</p>
                      <p className="text-sm text-slate-600">Active Patients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">5</p>
                      <p className="text-sm text-slate-600">Today's Visits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">23</p>
                      <p className="text-sm text-slate-600">Activities Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">2</p>
                      <p className="text-sm text-slate-600">Pending Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Akosua Asante</p>
                        <p className="text-sm text-slate-600">10:00 AM - Vital Signs Check</p>
                      </div>
                      <Button size="sm">Start Visit</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Kwame Osei</p>
                        <p className="text-sm text-slate-600">2:00 PM - Medication Review</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Scheduled
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Activity className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Activity logged for Patient #123</p>
                        <p className="text-sm text-slate-600">30 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Order completed for Patient #456</p>
                        <p className="text-sm text-slate-600">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "reviewer":
        return (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">15</p>
                      <p className="text-sm text-slate-600">Pending Reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">45</p>
                      <p className="text-sm text-slate-600">Patients Under Review</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">28</p>
                      <p className="text-sm text-slate-600">Reviews Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">3</p>
                      <p className="text-sm text-slate-600">Urgent Cases</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Priority Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Patient #789 - Urgent</p>
                        <p className="text-sm text-slate-600">Submitted 2 hours ago</p>
                      </div>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        Review Now
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Patient #456 - Standard</p>
                        <p className="text-sm text-slate-600">Submitted 1 day ago</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Medication adjustment approved</p>
                        <p className="text-sm text-slate-600">Patient #123 - 1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Care plan updated</p>
                        <p className="text-sm text-slate-600">Patient #456 - 3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "admin":
      case "super_admin":
        return (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">156</p>
                      <p className="text-sm text-slate-600">Total Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">89</p>
                      <p className="text-sm text-slate-600">Active Patients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">23</p>
                      <p className="text-sm text-slate-600">Care Providers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">₵45,230</p>
                      <p className="text-sm text-slate-600">Monthly Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent User Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">New care provider registered</p>
                        <p className="text-sm text-slate-600">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Patient enrollment completed</p>
                        <p className="text-sm text-slate-600">4 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-slate-900">All Systems Operational</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Last backup: 2 hours ago</span>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return <div>Invalid user role</div>
    }
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      super_admin: "Super Administrator",
      admin: "Administrator",
      reviewer: "Medical Reviewer",
      care_giver: "Care Provider",
      patient: "Patient",
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.firstName}!</h1>
          <p className="text-slate-600 mt-2">
            {getRoleDisplayName(user.role)} Dashboard -{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Role-specific Dashboard Content */}
        {getDashboardContent()}
      </div>
    </div>
  )
}
