"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthHeader from "@/components/auth-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import {
  Users,
  Search,
  AlertTriangle,
  Activity,
  Phone,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  User,
  Pill,
  FileText,
  Stethoscope,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  conditions: string[];
  careLevel: "low" | "medium" | "high" | "critical";
  status: "stable" | "improving" | "declining" | "critical";
  assignedDate: string;
  lastVisit: string;
  nextVisit: string;
  address: string;
  phone: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    oxygenSaturation: string;
    recordedDate: string;
  };
  prescriptions: number;
  pendingReviews: number;
  notes: string;
  riskFactors: string[];
  allergies: string[];
}

// Mock data for patients requiring medical review
const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    age: 67,
    gender: "Female",
    conditions: ["Hypertension", "Type 2 Diabetes", "Arthritis"],
    careLevel: "high",
    status: "stable",
    assignedDate: "2024-01-15",
    lastVisit: "2024-01-20",
    nextVisit: "2024-02-03",
    address: "123 Oak Street, Accra",
    phone: "+233 24 123 4567",
    emergencyContact: {
      name: "Michael Johnson",
      relationship: "Son",
      phone: "+233 24 765 4321",
    },
    vitals: {
      bloodPressure: "140/90",
      heartRate: "78",
      temperature: "98.6°F",
      oxygenSaturation: "97%",
      recordedDate: "2024-01-20T10:30:00Z",
    },
    prescriptions: 5,
    pendingReviews: 2,
    notes: "Patient responding well to current treatment plan",
    riskFactors: ["Family history of heart disease", "Sedentary lifestyle"],
    allergies: ["Penicillin", "Shellfish"],
  },
  {
    id: "2",
    name: "James Wilson",
    age: 45,
    gender: "Male",
    conditions: ["Asthma", "Anxiety"],
    careLevel: "medium",
    status: "improving",
    assignedDate: "2024-01-10",
    lastVisit: "2024-01-18",
    nextVisit: "2024-02-01",
    address: "456 Pine Avenue, Kumasi",
    phone: "+233 24 234 5678",
    emergencyContact: {
      name: "Lisa Wilson",
      relationship: "Wife",
      phone: "+233 24 876 5432",
    },
    vitals: {
      bloodPressure: "125/80",
      heartRate: "72",
      temperature: "98.4°F",
      oxygenSaturation: "98%",
      recordedDate: "2024-01-18T14:15:00Z",
    },
    prescriptions: 3,
    pendingReviews: 1,
    notes: "Asthma symptoms improving with new inhaler",
    riskFactors: ["Smoking history"],
    allergies: ["Latex"],
  },
  {
    id: "3",
    name: "Mary Asante",
    age: 72,
    gender: "Female",
    conditions: ["Heart Disease", "Osteoporosis", "Depression"],
    careLevel: "critical",
    status: "declining",
    assignedDate: "2024-01-05",
    lastVisit: "2024-01-22",
    nextVisit: "2024-01-25",
    address: "789 Cedar Road, Tamale",
    phone: "+233 24 345 6789",
    emergencyContact: {
      name: "Grace Asante",
      relationship: "Daughter",
      phone: "+233 24 987 6543",
    },
    vitals: {
      bloodPressure: "160/95",
      heartRate: "88",
      temperature: "99.1°F",
      oxygenSaturation: "94%",
      recordedDate: "2024-01-22T09:45:00Z",
    },
    prescriptions: 8,
    pendingReviews: 4,
    notes: "Requires close monitoring due to recent cardiac episode",
    riskFactors: ["Advanced age", "Multiple comorbidities", "Fall risk"],
    allergies: ["Aspirin", "Codeine"],
  },
];

export default function ReviewerPatientsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCareLevel, setSelectedCareLevel] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user && user.role !== "reviewer") {
      router.push("/dashboard");
    }
    if (user && user.role === "reviewer") {
      loadPatients();
    }
  }, [user, authLoading, router]);

  const loadPatients = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPatients(mockPatients);
    setIsLoading(false);
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.conditions.some((condition) =>
        condition.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus =
      selectedStatus === "all" || patient.status === selectedStatus;
    const matchesCareLevel =
      selectedCareLevel === "all" || patient.careLevel === selectedCareLevel;

    return matchesSearch && matchesStatus && matchesCareLevel;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "bg-blue-100 text-blue-800";
      case "improving":
        return "bg-green-100 text-green-800";
      case "declining":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getCareLevel = (level: string) => {
    switch (level) {
      case "low":
        return { label: "Low Care", color: "bg-green-100 text-green-800" };
      case "medium":
        return { label: "Medium Care", color: "bg-yellow-100 text-yellow-800" };
      case "high":
        return { label: "High Care", color: "bg-orange-100 text-orange-800" };
      case "critical":
        return { label: "Critical Care", color: "bg-red-100 text-red-800" };
      default:
        return { label: "Unknown", color: "bg-slate-100 text-slate-800" };
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters Skeleton */}
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                <Skeleton className="flex-1 h-10" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>

          {/* Patient Cards Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "reviewer") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Patient Review</h1>
          <p className="text-slate-600 mt-2">
            Select a patient to review prescriptions and medical records
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Patients
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {patients.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Pending Reviews
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {patients.reduce((sum, p) => sum + p.pendingReviews, 0)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Critical Cases
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {patients.filter((p) => p.careLevel === "critical").length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Active Prescriptions
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {patients.reduce((sum, p) => sum + p.prescriptions, 0)}
                  </p>
                </div>
                <Pill className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5" />
              <span>Patient Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search patients or conditions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Status</option>
                <option value="stable">Stable</option>
                <option value="improving">Improving</option>
                <option value="declining">Declining</option>
                <option value="critical">Critical</option>
              </select>
              <select
                value={selectedCareLevel}
                onChange={(e) => setSelectedCareLevel(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Care Levels</option>
                <option value="low">Low Care</option>
                <option value="medium">Medium Care</option>
                <option value="high">High Care</option>
                <option value="critical">Critical Care</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Patient Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => {
            const careLevel = getCareLevel(patient.careLevel);
            return (
              <Card
                key={patient.id}
                className={`${
                  patient.careLevel === "critical"
                    ? "border-red-200 bg-red-50"
                    : ""
                }`}
              >
                <CardContent className="p-6">
                  {/* Patient Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-slate-200 p-3 rounded-full">
                        <User className="h-6 w-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {patient.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {patient.age} years • {patient.gender}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(patient.status)}
                      <Badge className={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Care Level and Conditions */}
                  <div className="mb-4">
                    <Badge className={`${careLevel.color} mb-2`}>
                      {careLevel.label}
                    </Badge>
                    <div className="text-sm text-slate-600">
                      <strong>Conditions:</strong>{" "}
                      {patient.conditions.slice(0, 2).join(", ")}
                      {patient.conditions.length > 2 && "..."}
                    </div>
                  </div>

                  {/* Review Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="text-center p-2 bg-slate-50 rounded">
                      <div className="font-semibold text-slate-900">
                        {patient.prescriptions}
                      </div>
                      <div className="text-slate-600">Prescriptions</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <div className="font-semibold text-orange-900">
                        {patient.pendingReviews}
                      </div>
                      <div className="text-orange-600">Pending Reviews</div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-1 mb-1">
                      <Phone className="h-3 w-3" />
                      <span>{patient.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{patient.address}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex">
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(`/reviewer/patients/${patient.id}`)
                      }
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Stethoscope className="h-4 w-4 mr-1" />
                      Review Patient
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No patients found
            </h3>
            <p className="text-slate-600">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
