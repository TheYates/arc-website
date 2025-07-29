"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandSearch } from "@/components/ui/command-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoleHeader } from "@/components/role-header";
import { useAuth } from "@/lib/auth";
import { getPatientsByCaregiverClient } from "@/lib/api/client";
import { Patient, CareLevel, PatientStatus } from "@/lib/types/patients";
import { formatDate } from "@/lib/utils";
import {
  Heart,
  Users,
  Search,
  User,
  Settings,
  LogOut,
  Eye,
  Activity,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Stethoscope,
  FileText,
  Home,
  ArrowLeft,
  Filter,
  MoreVertical,
  Bell,
  ClipboardCheck,
  List,
  Grid3X3,
} from "lucide-react";

export default function CaregiverPatientsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const calculateAge = (dateOfBirth?: string): string => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age.toString();
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<CareLevel | "all">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Check permissions
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "care_giver") {
      router.push("/");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    const fetchAssignedPatients = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const patients = await getPatientsByCaregiverClient(user.id);
        setAssignedPatients(patients);
      } catch (error) {
        console.error("Failed to fetch assigned patients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedPatients();
  }, [user]);

  const filteredPatients = assignedPatients.filter((patient) => {
    const matchesSearch =
      searchTerm === "" ||
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.medicalRecordNumber &&
        patient.medicalRecordNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterLevel === "all" || patient.careLevel === filterLevel;

    return matchesSearch && matchesFilter;
  });

  const formatAssignedDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return formatDate(date);
  };

  if (!user || user.role !== "care_giver") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground">
            Access denied. Caregiver role required.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header Navigation */}
      <RoleHeader role="caregiver" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 w-full max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
            <p className="text-muted-foreground">
              Manage and view your assigned patients
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {assignedPatients.length}/5 Patients
            </Badge>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients by name, email, or medical record..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {/* View Toggle */}
                <div className="flex bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="h-8"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Care Level: {filterLevel === "all" ? "All" : filterLevel}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterLevel("all")}>
                      All Levels
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterLevel("low")}>
                      Low Care
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterLevel("medium")}>
                      Medium Care
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterLevel("high")}>
                      High Care
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ) : filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {assignedPatients.length === 0
                  ? "No Patients Assigned"
                  : "No Patients Found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {assignedPatients.length === 0
                  ? "You don't have any patients assigned yet. Your supervisor will assign patients to you."
                  : "No patients match your current search criteria."}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === "table" ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-6 py-4 text-left font-medium">
                        Patient
                      </th>
                      <th className="px-6 py-4 text-left font-medium">Email</th>
                      <th className="px-6 py-4 text-left font-medium">Phone</th>
                      <th className="px-6 py-4 text-left font-medium">
                        Care Level
                      </th>
                      <th className="px-6 py-4 text-left font-medium">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left font-medium">Age</th>
                      <th className="px-6 py-4 text-left font-medium">
                        Assigned
                      </th>
                      <th className="px-6 py-4 text-center font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient, index) => (
                      <tr
                        key={patient.id}
                        className={`border-b hover:bg-muted/25 transition-colors cursor-pointer ${
                          index % 2 === 0 ? "bg-background" : "bg-muted/10"
                        }`}
                        onClick={() =>
                          router.push(`/caregiver/patients/${patient.id}`)
                        }
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-teal-100 p-2 rounded-full">
                              <User className="h-4 w-4 text-teal-600" />
                            </div>
                            <div className="font-medium whitespace-nowrap">
                              {patient.firstName} {patient.lastName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm whitespace-nowrap">
                            {patient.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm whitespace-nowrap">
                            {patient.phone || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-medium whitespace-nowrap ${
                              patient.careLevel === "low"
                                ? "text-green-800"
                                : patient.careLevel === "medium"
                                ? "text-amber-800"
                                : patient.careLevel === "high"
                                ? "text-red-800"
                                : "text-gray-600"
                            }`}
                          >
                            {patient.careLevel === "low"
                              ? "Low Care"
                              : patient.careLevel === "medium"
                              ? "Medium Care"
                              : patient.careLevel === "high"
                              ? "High Care"
                              : "Standard Care"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-medium whitespace-nowrap ${
                              patient.status === "stable"
                                ? "text-green-800"
                                : patient.status === "improving"
                                ? "text-teal-800"
                                : patient.status === "declining"
                                ? "text-amber-800"
                                : patient.status === "critical"
                                ? "text-red-800"
                                : "text-gray-600"
                            }`}
                          >
                            {patient.status === "stable"
                              ? "Stable"
                              : patient.status === "improving"
                              ? "Improving"
                              : patient.status === "declining"
                              ? "Declining"
                              : patient.status === "critical"
                              ? "Critical"
                              : "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm whitespace-nowrap">
                            {calculateAge(patient.dateOfBirth)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatAssignedDate(
                              patient.assignedCaregiver?.assignedAt
                            )}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center">
                            <Button
                              size="sm"
                              onClick={() =>
                                router.push(`/caregiver/patients/${patient.id}`)
                              }
                              className="bg-teal-600 hover:bg-teal-700"
                            >
                              View Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <Card
                key={patient.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/caregiver/patients/${patient.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {patient.firstName} {patient.lastName}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        {patient.email}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/caregiver/patients/${patient.id}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Activity className="mr-2 h-4 w-4" />
                          Log Care Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Stethoscope className="mr-2 h-4 w-4" />
                          Record Vitals
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule Appointment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Patient Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-3 w-3 mr-2" />
                      {patient.phone || "N/A"}
                    </div>
                    {patient.address && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-2" />
                        {patient.address}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-2" />
                      Assigned:{" "}
                      {formatAssignedDate(
                        patient.assignedCaregiver?.assignedAt
                      )}
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="flex flex-wrap gap-4">
                    <div
                      className={`text-sm font-medium ${
                        patient.careLevel === "low"
                          ? "text-green-800"
                          : patient.careLevel === "medium"
                          ? "text-amber-800"
                          : patient.careLevel === "high"
                          ? "text-red-800"
                          : "text-gray-600"
                      }`}
                    >
                      {patient.careLevel === "low"
                        ? "Low Care"
                        : patient.careLevel === "medium"
                        ? "Medium Care"
                        : patient.careLevel === "high"
                        ? "High Care"
                        : "Unknown"}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        patient.status === "stable"
                          ? "text-green-800"
                          : patient.status === "improving"
                          ? "text-teal-800"
                          : patient.status === "declining"
                          ? "text-amber-800"
                          : patient.status === "critical"
                          ? "text-red-800"
                          : "text-gray-600"
                      }`}
                    >
                      {patient.status === "stable"
                        ? "Stable"
                        : patient.status === "improving"
                        ? "Improving"
                        : patient.status === "declining"
                        ? "Declining"
                        : patient.status === "critical"
                        ? "Critical"
                        : "Unknown"}
                    </div>
                  </div>

                  {/* Age */}
                  <div className="p-2 bg-teal-50 rounded">
                    <p className="text-xs text-teal-600 font-medium">Age</p>
                    <p className="text-sm text-teal-800">
                      {calculateAge(patient.dateOfBirth)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        router.push(`/caregiver/patients/${patient.id}`)
                      }
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
