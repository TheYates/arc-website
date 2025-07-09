"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthHeader from "@/components/auth-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, hasPermission } from "@/lib/auth";
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Download,
  AlertTriangle,
  Heart,
  Shield,
  Clock,
  Server,
} from "lucide-react";

interface ReportData {
  overview: {
    totalUsers: number;
    activePatients: number;
    totalActivities: number;
    monthlyRevenue: number;
    userGrowth: number;
    patientSatisfaction: number;
  };
  userStats: {
    byRole: Array<{ role: string; count: number; percentage: number }>;
    registrationTrend: Array<{ month: string; count: number }>;
    activeUsers: Array<{ period: string; count: number }>;
  };
  patientStats: {
    byCondition: Array<{ condition: string; count: number }>;
    byCareLevel: Array<{ level: string; count: number; color: string }>;
    satisfactionScores: Array<{ month: string; score: number }>;
  };
  activityStats: {
    byType: Array<{ type: string; count: number }>;
    completionRates: Array<{ activity: string; rate: number }>;
    monthlyTrend: Array<{ month: string; count: number }>;
  };
  financialStats: {
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    revenueByService: Array<{
      service: string;
      revenue: number;
      percentage: number;
    }>;
    paymentStatus: Array<{ status: string; amount: number; count: number }>;
  };
}

export default function AdminReportsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("last_30_days");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock report data
  const mockReportData: ReportData = {
    overview: {
      totalUsers: 156,
      activePatients: 89,
      totalActivities: 1247,
      monthlyRevenue: 45230,
      userGrowth: 12.5,
      patientSatisfaction: 4.7,
    },
    userStats: {
      byRole: [
        { role: "Patient", count: 89, percentage: 57 },
        { role: "Care Provider", count: 23, percentage: 15 },
        { role: "Reviewer", count: 8, percentage: 5 },
        { role: "Administrator", count: 6, percentage: 4 },
        { role: "Super Admin", count: 2, percentage: 1 },
      ],
      registrationTrend: [
        { month: "Jan", count: 12 },
        { month: "Feb", count: 18 },
        { month: "Mar", count: 15 },
        { month: "Apr", count: 22 },
        { month: "May", count: 19 },
        { month: "Jun", count: 25 },
      ],
      activeUsers: [
        { period: "Daily", count: 67 },
        { period: "Weekly", count: 134 },
        { period: "Monthly", count: 156 },
      ],
    },
    patientStats: {
      byCondition: [
        { condition: "Post-surgical recovery", count: 23 },
        { condition: "Chronic disease management", count: 18 },
        { condition: "Elderly care", count: 15 },
        { condition: "Physical therapy", count: 12 },
        { condition: "Medication management", count: 10 },
        { condition: "Wellness monitoring", count: 11 },
      ],
      byCareLevel: [
        { level: "Low", count: 32, color: "bg-green-500" },
        { level: "Medium", count: 28, color: "bg-yellow-500" },
        { level: "High", count: 19, color: "bg-orange-500" },
        { level: "Critical", count: 10, color: "bg-red-500" },
      ],
      satisfactionScores: [
        { month: "Jan", score: 4.5 },
        { month: "Feb", score: 4.6 },
        { month: "Mar", score: 4.4 },
        { month: "Apr", score: 4.7 },
        { month: "May", score: 4.8 },
        { month: "Jun", score: 4.7 },
      ],
    },
    activityStats: {
      byType: [
        { type: "Vital Signs", count: 342 },
        { type: "Medication", count: 298 },
        { type: "Physical Therapy", count: 187 },
        { type: "Wound Care", count: 156 },
        { type: "Mental Health", count: 134 },
        { type: "Nutrition", count: 130 },
      ],
      completionRates: [
        { activity: "Daily Medications", rate: 94 },
        { activity: "Vital Signs Check", rate: 89 },
        { activity: "Physical Exercises", rate: 76 },
        { activity: "Wound Care", rate: 98 },
        { activity: "Mental Health Check", rate: 82 },
      ],
      monthlyTrend: [
        { month: "Jan", count: 189 },
        { month: "Feb", count: 234 },
        { month: "Mar", count: 198 },
        { month: "Apr", count: 267 },
        { month: "May", count: 245 },
        { month: "Jun", count: 289 },
      ],
    },
    financialStats: {
      monthlyRevenue: [
        { month: "Jan", revenue: 38500 },
        { month: "Feb", revenue: 42300 },
        { month: "Mar", revenue: 39800 },
        { month: "Apr", revenue: 46700 },
        { month: "May", revenue: 44200 },
        { month: "Jun", revenue: 45230 },
      ],
      revenueByService: [
        { service: "AHENEFIE", revenue: 18500, percentage: 41 },
        { service: "ADAMFO PA", revenue: 12300, percentage: 27 },
        { service: "Fie Ne Fie", revenue: 9800, percentage: 22 },
        { service: "YONKO PA", revenue: 4630, percentage: 10 },
      ],
      paymentStatus: [
        { status: "Paid", amount: 38900, count: 67 },
        { status: "Pending", amount: 4200, count: 8 },
        { status: "Overdue", amount: 2130, count: 4 },
      ],
    },
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user && !hasPermission(user.role, "admin")) {
      router.push("/dashboard");
    }
    if (user && hasPermission(user.role, "admin")) {
      loadReportData();
    }
  }, [user, authLoading, router]);

  const loadReportData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setReportData(mockReportData);
    setIsLoading(false);
  };

  const exportReport = (format: string) => {
    // Simulate export functionality
    console.log(`Exporting report in ${format} format`);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "patients", label: "Patients", icon: Heart },
    { id: "activities", label: "Activities", icon: Activity },
    { id: "financial", label: "Financial", icon: DollarSign },
  ];

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-12 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tab Navigation Skeleton */}
          <div className="mb-8">
            <div className="border-b border-slate-200">
              <div className="flex space-x-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-8 w-20" />
                ))}
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="grid lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-4" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || !hasPermission(user.role, "admin")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access reports.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Failed to load report data.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Reports & Analytics
              </h1>
              <p className="text-slate-600 mt-2">
                Comprehensive system insights and performance metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
                <option value="last_year">Last Year</option>
              </select>
              <Button
                onClick={() => exportReport("pdf")}
                variant="outline"
                className="bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-teal-500 text-teal-600"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Total Users
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        {reportData.overview.totalUsers}
                      </p>
                      <div className="flex items-center space-x-1 mt-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">
                          +{reportData.overview.userGrowth}%
                        </span>
                      </div>
                    </div>
                    <Users className="h-12 w-12 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Active Patients
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        {reportData.overview.activePatients}
                      </p>
                      <div className="flex items-center space-x-1 mt-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-slate-600">
                          Currently receiving care
                        </span>
                      </div>
                    </div>
                    <Heart className="h-12 w-12 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Monthly Revenue
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        ₵{reportData.overview.monthlyRevenue.toLocaleString()}
                      </p>
                      <div className="flex items-center space-x-1 mt-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">
                          +8.2% from last month
                        </span>
                      </div>
                    </div>
                    <DollarSign className="h-12 w-12 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Total Activities
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        {reportData.overview.totalActivities}
                      </p>
                      <div className="flex items-center space-x-1 mt-2">
                        <Activity className="h-4 w-4 text-purple-500" />
                        <span className="text-sm text-slate-600">
                          This month
                        </span>
                      </div>
                    </div>
                    <Activity className="h-12 w-12 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Patient Satisfaction
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        {reportData.overview.patientSatisfaction}/5.0
                      </p>
                      <div className="flex items-center space-x-1 mt-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div
                              key={star}
                              className={`h-4 w-4 ${
                                star <=
                                Math.floor(
                                  reportData.overview.patientSatisfaction
                                )
                                  ? "text-yellow-400"
                                  : "text-slate-300"
                              }`}
                            >
                              ★
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Shield className="h-12 w-12 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        System Uptime
                      </p>
                      <p className="text-3xl font-bold text-slate-900">99.9%</p>
                      <div className="flex items-center space-x-1 mt-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">
                          Last 30 days
                        </span>
                      </div>
                    </div>
                    <Server className="h-12 w-12 text-teal-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Charts */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>User Registration Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.userStats.registrationTrend.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-slate-600">
                            {item.month}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-teal-600 h-2 rounded-full"
                                style={{ width: `${(item.count / 25) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-slate-900">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Care Level Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.patientStats.byCareLevel.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-slate-600">
                          {item.level}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-slate-200 rounded-full h-2">
                            <div
                              className={`${item.color} h-2 rounded-full`}
                              style={{ width: `${(item.count / 32) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Users by Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.userStats.byRole.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700">
                            {item.role}
                          </span>
                          <span className="text-sm text-slate-600">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reportData.userStats.activeUsers.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {item.period} Active
                          </p>
                          <p className="text-sm text-slate-600">
                            Users who logged in
                          </p>
                        </div>
                        <div className="text-2xl font-bold text-teal-600">
                          {item.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === "patients" && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Patients by Condition</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.patientStats.byCondition.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <span className="text-sm text-slate-700">
                          {item.condition}
                        </span>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Patient Satisfaction Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.patientStats.satisfactionScores.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-slate-600">
                            {item.month}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.floor(item.score)
                                      ? "text-yellow-400"
                                      : "text-slate-300"
                                  }`}
                                >
                                  ★
                                </div>
                              ))}
                            </div>
                            <span className="text-sm font-medium text-slate-900">
                              {item.score}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === "activities" && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Activities by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.activityStats.byType.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <span className="text-sm text-slate-700">
                          {item.type}
                        </span>
                        <Badge className="bg-teal-100 text-teal-800">
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completion Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.activityStats.completionRates.map(
                      (item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">
                              {item.activity}
                            </span>
                            <span className="text-sm text-slate-600">
                              {item.rate}%
                            </span>
                          </div>
                          <Progress value={item.rate} className="h-2" />
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === "financial" && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.financialStats.revenueByService.map(
                      (item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">
                              {item.service}
                            </span>
                            <span className="text-sm text-slate-600">
                              ₵{item.revenue.toLocaleString()} (
                              {item.percentage}%)
                            </span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.financialStats.paymentStatus.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-slate-900">
                              {item.status}
                            </p>
                            <p className="text-sm text-slate-600">
                              {item.count} transactions
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">
                              ₵{item.amount.toLocaleString()}
                            </p>
                            <Badge
                              className={
                                item.status === "Paid"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
