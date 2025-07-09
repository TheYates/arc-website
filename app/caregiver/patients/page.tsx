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
} from "lucide-react";

// Utility function to format dates and times for caregiver role
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const fullDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { fullDate, time };
};

const formatDateOnly = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
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
  medications: number;
  notes: string;
  riskFactors: string[];
  allergies: string[];
}

export default function CaregiverPatientsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCareLevel, setSelectedCareLevel] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Mock patients data
  const mockPatients: Patient[] = [
    {
      id: "5",
      name: "Akosua Asante",
      age: 68,
      gender: "female",
      conditions: ["Hypertension", "Type 2 Diabetes", "Obesity"],
      careLevel: "high",
      status: "declining",
      assignedDate: "2024-01-01",
      lastVisit: "2024-01-15",
      nextVisit: "2024-01-17",
      address: "123 Osu Street, Accra",
      phone: "+233 24 000 0005",
      emergencyContact: {
        name: "Kwame Asante",
        relationship: "Son",
        phone: "+233 24 111 1111",
      },
      vitals: {
        bloodPressure: "180/95",
        heartRate: "95",
        temperature: "38.2°C",
        oxygenSaturation: "96%",
        recordedDate: "2024-01-16T09:30:00Z",
      },
      medications: 4,
      notes:
        "Patient experiencing elevated BP episodes. Requires close monitoring.",
      riskFactors: ["High Blood Pressure", "Diabetes", "Fall Risk"],
      allergies: ["Penicillin", "Shellfish"],
    },
    {
      id: "6",
      name: "Kofi Mensah",
      age: 72,
      gender: "male",
      conditions: ["Type 2 Diabetes", "Diabetic Neuropathy", "Hypertension"],
      careLevel: "medium",
      status: "stable",
      assignedDate: "2024-01-05",
      lastVisit: "2024-01-16",
      nextVisit: "2024-01-18",
      address: "456 Tema Avenue, Tema",
      phone: "+233 24 000 0006",
      emergencyContact: {
        name: "Ama Mensah",
        relationship: "Wife",
        phone: "+233 24 222 2222",
      },
      vitals: {
        bloodPressure: "140/85",
        heartRate: "78",
        temperature: "36.8°C",
        oxygenSaturation: "98%",
        recordedDate: "2024-01-16T08:15:00Z",
      },
      medications: 3,
      notes:
        "Blood sugar levels stable. Neuropathy pain managed well with current medications.",
      riskFactors: ["Diabetes", "Neuropathy"],
      allergies: ["Aspirin"],
    },
    {
      id: "7",
      name: "Abena Osei",
      age: 45,
      gender: "female",
      conditions: ["Post-surgical recovery", "Wound healing"],
      careLevel: "medium",
      status: "improving",
      assignedDate: "2024-01-10",
      lastVisit: "2024-01-15",
      nextVisit: "2024-01-17",
      address: "789 Kumasi Road, Kumasi",
      phone: "+233 24 000 0007",
      emergencyContact: {
        name: "Yaw Osei",
        relationship: "Husband",
        phone: "+233 24 333 3333",
      },
      vitals: {
        bloodPressure: "118/75",
        heartRate: "72",
        temperature: "36.5°C",
        oxygenSaturation: "99%",
        recordedDate: "2024-01-15T14:20:00Z",
      },
      medications: 2,
      notes: "Surgical wound healing well. Patient recovering as expected.",
      riskFactors: ["Post-surgical infection risk"],
      allergies: [],
    },
    {
      id: "8",
      name: "Kwaku Boateng",
      age: 58,
      gender: "male",
      conditions: ["Stroke recovery", "Mobility issues", "Dementia"],
      careLevel: "high",
      status: "stable",
      assignedDate: "2024-01-08",
      lastVisit: "2024-01-15",
      nextVisit: "2024-01-16",
      address: "321 Cape Coast Street, Cape Coast",
      phone: "+233 24 000 0008",
      emergencyContact: {
        name: "Efua Boateng",
        relationship: "Daughter",
        phone: "+233 24 444 4444",
      },
      vitals: {
        bloodPressure: "110/70",
        heartRate: "68",
        temperature: "36.2°C",
        oxygenSaturation: "97%",
        recordedDate: "2024-01-15T21:45:00Z",
      },
      medications: 5,
      notes:
        "Cognitive function stable. Mobility improving with physical therapy.",
      riskFactors: ["Fall Risk", "Confusion Episodes", "Medication Compliance"],
      allergies: ["Latex"],
    },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user && user.role !== "care_giver") {
      router.push("/dashboard");
    }
    if (user && user.role === "care_giver") {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "bg-green-100 text-green-800";
      case "improving":
        return "bg-blue-100 text-blue-800";
      case "declining":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getCareLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-orange-500" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-green-500" />;
    }
  };

  const isVisitOverdue = (nextVisit: string) => {
    return new Date(nextVisit) < new Date();
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <div>
                      <Skeleton className="h-6 w-12 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters Skeleton */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="flex space-x-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>

          {/* Patient Cards Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "care_giver") {
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
          <h1 className="text-3xl font-bold text-slate-900">My Patients</h1>
          <p className="text-slate-600 mt-2">
            Manage and monitor your assigned patients
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {patients.length}
                  </p>
                  <p className="text-sm text-slate-600">Total Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {
                      patients.filter(
                        (p) =>
                          p.careLevel === "high" || p.careLevel === "critical"
                      ).length
                    }
                  </p>
                  <p className="text-sm text-slate-600">High Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {patients.filter((p) => isVisitOverdue(p.nextVisit)).length}
                  </p>
                  <p className="text-sm text-slate-600">Overdue Visits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {patients.filter((p) => p.status === "improving").length}
                  </p>
                  <p className="text-sm text-slate-600">Improving</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
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
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Patient Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
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
                      <Users className="h-6 w-6 text-slate-600" />
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
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Care Level:
                    </span>
                    <Badge className={getCareLevelColor(patient.careLevel)}>
                      {patient.careLevel}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600">
                    <strong>Conditions:</strong>{" "}
                    {patient.conditions.slice(0, 2).join(", ")}
                    {patient.conditions.length > 2 &&
                      ` +${patient.conditions.length - 2} more`}
                  </div>
                </div>

                {/* Latest Vitals */}
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Latest Vitals
                    </span>
                    <div className="text-xs text-slate-500 text-center">
                      <div>
                        {formatDateTime(patient.vitals.recordedDate).fullDate}
                      </div>
                      <div className="text-xs">
                        {formatDateTime(patient.vitals.recordedDate).time}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-600">BP:</span>{" "}
                      {patient.vitals.bloodPressure}
                    </div>
                    <div>
                      <span className="text-slate-600">HR:</span>{" "}
                      {patient.vitals.heartRate}
                    </div>
                    <div>
                      <span className="text-slate-600">Temp:</span>{" "}
                      {patient.vitals.temperature}
                    </div>
                    <div>
                      <span className="text-slate-600">O2:</span>{" "}
                      {patient.vitals.oxygenSaturation}
                    </div>
                  </div>
                </div>

                {/* Visit Information */}
                <div className="mb-4 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-600">Last Visit:</span>
                    <div className="font-medium text-center">
                      <div>{formatDateOnly(patient.lastVisit)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Next Visit:</span>
                    <div
                      className={`font-medium text-center ${
                        isVisitOverdue(patient.nextVisit)
                          ? "text-red-600"
                          : "text-slate-900"
                      }`}
                    >
                      <div>{formatDateOnly(patient.nextVisit)}</div>
                      {isVisitOverdue(patient.nextVisit) && (
                        <div className="text-xs text-red-600">(Overdue)</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                {patient.riskFactors.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-slate-700">
                      Risk Factors:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {patient.riskFactors.slice(0, 2).map((risk, index) => (
                        <Badge
                          key={index}
                          className="bg-orange-100 text-orange-800 text-xs"
                        >
                          {risk}
                        </Badge>
                      ))}
                      {patient.riskFactors.length > 2 && (
                        <Badge className="bg-slate-100 text-slate-800 text-xs">
                          +{patient.riskFactors.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

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
                      router.push(`/caregiver/patients/${patient.id}`)
                    }
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <User className="h-4 w-4 mr-1" />
                    View Patient
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No patients found
            </h3>
            <p className="text-slate-600">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
