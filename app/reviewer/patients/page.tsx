"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { ReviewerPatientsMobile } from "@/components/mobile/reviewer-patients";
import { useAuth } from "@/lib/auth";
import { getPatientsByReviewer } from "@/lib/api/assignments";
import { useToast } from "@/hooks/use-toast";
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
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Stethoscope,
  ClipboardList,
  Home,
  Filter,
  MoreVertical,
  Bell,
  ClipboardCheck,
  List,
  Grid3X3,
} from "lucide-react";

export default function ReviewerPatientsPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<CareLevel | "all">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Check permissions
  useEffect(() => {
    // Wait for auth to finish loading before making redirect decisions
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "reviewer") {
      router.push("/");
      return;
    }
  }, [user, router, authLoading]);

  useEffect(() => {
    const fetchAssignedPatients = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const patients = await getPatientsByReviewer(user.id);
        setAssignedPatients(patients);
      } catch (error) {
        console.error("Failed to fetch assigned patients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedPatients();
  }, [user]);

  // Memoize helper functions to prevent recreation on every render
  const getCareLevelColor = useCallback((careLevel?: CareLevel) => {
    switch (careLevel) {
      case "low":
        return "text-green-700 font-medium";
      case "medium":
        return "text-amber-700 font-medium";
      case "high":
        return "text-red-700 font-medium";
      default:
        return "text-red-600 font-medium";
    }
  }, []);

  const getStatusColor = useCallback((status?: PatientStatus) => {
    switch (status) {
      case "stable":
        return "text-green-700 font-medium";
      case "improving":
        return "text-teal-700 font-medium";
      case "declining":
        return "text-amber-700 font-medium";
      case "critical":
        return "text-red-700 font-medium";
      default:
        return "text-green-600 font-medium";
    }
  }, []);

  // Memoize filtered patients to prevent unnecessary recalculations
  const filteredPatients = useMemo(() => {
    return assignedPatients.filter((patient) => {
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
  }, [assignedPatients, searchTerm, filterLevel]);

  const formatAssignedDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return formatDate(date);
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background w-full">
        <RoleHeader role="reviewer" />
        <main className="container mx-auto px-4 py-6 w-full max-w-7xl">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
            <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!user || user.role !== "reviewer") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground">
            Access denied. Reviewer role required.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header Navigation */}
      <RoleHeader role="reviewer" />

      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <ReviewerPatientsMobile />
      </div>

      {/* Desktop */}
      <main className="hidden md:block container mx-auto px-4 py-6 w-full max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold ">My Patients</h1>
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
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-6 py-4 text-left font-medium">Patient</th>
                      <th className="px-6 py-4 text-left font-medium">Contact</th>
                      <th className="px-6 py-4 text-left font-medium">Care Level</th>
                      <th className="px-6 py-4 text-left font-medium">Status</th>
                      <th className="px-6 py-4 text-left font-medium">Service</th>
                      <th className="px-6 py-4 text-left font-medium">Assigned</th>
                      <th className="px-6 py-4 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-200 p-2 rounded-full animate-pulse w-8 h-8"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-40"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  ? "You don't have any patients assigned for review yet. Your supervisor will assign patients to you."
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
                      <th className="px-6 py-4 text-left font-medium">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left font-medium">
                        Care Level
                      </th>
                      <th className="px-6 py-4 text-left font-medium">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left font-medium">
                        Service
                      </th>
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
                          router.push(`/reviewer/patients/${patient.id}`)
                        }
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-purple-100 p-2 rounded-full">
                              <User className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium whitespace-nowrap">
                                {patient.firstName} {patient.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm whitespace-nowrap">
                              <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                              {patient.email}
                            </div>
                            <div className="flex items-center text-sm whitespace-nowrap">
                              <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                              {patient.phone || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`${getCareLevelColor(
                              patient.careLevel
                            )} whitespace-nowrap`}
                          >
                            {patient.careLevel
                              ? patient.careLevel.charAt(0).toUpperCase() +
                                patient.careLevel.slice(1).toLowerCase()
                              : "Standard"}{" "}
                            Care
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`${getStatusColor(
                              patient.status
                            )} whitespace-nowrap`}
                          >
                            {patient.status
                              ? patient.status.charAt(0).toUpperCase() +
                                patient.status.slice(1).toLowerCase()
                              : "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm whitespace-nowrap">
                            {patient.serviceName || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatAssignedDate(
                              patient.assignedReviewer?.assignedAt
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/reviewer/patients/${patient.id}`);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
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
                className="hover:shadow-lg transition-shadow"
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
                            router.push(`/reviewer/patients/${patient.id}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            toast({
                              title: "Create Medical Review",
                              description: `Opening medical review form for ${patient.firstName} ${patient.lastName}. This feature allows reviewers to create formal medical assessments, document findings, and make treatment recommendations.`,
                            });
                          }}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Create Review
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Stethoscope className="mr-2 h-4 w-4" />
                          Medical Assessment
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
                      {formatAssignedDate(patient.assignedReviewer?.assignedAt)}
                    </div>
                  </div>

                  {/* Medical Record Number */}
                  {patient.medicalRecordNumber && (
                    <div className="p-2 bg-gray-50 rounded text-center">
                      <p className="text-xs text-muted-foreground">
                        Medical Record
                      </p>
                      <p className="font-mono text-sm">
                        {patient.medicalRecordNumber}
                      </p>
                    </div>
                  )}

                  {/* Status Info */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className={getCareLevelColor(patient.careLevel)}>
                      {patient.careLevel
                        ? patient.careLevel.charAt(0).toUpperCase() +
                          patient.careLevel.slice(1)
                        : "Standard"}{" "}
                      Care
                    </span>
                    <span className={getStatusColor(patient.status)}>
                      {patient.status
                        ? patient.status.charAt(0).toUpperCase() +
                          patient.status.slice(1)
                        : "Unknown"}
                    </span>
                  </div>

                  {/* Service */}
                  {patient.serviceName && (
                    <div className="p-2 bg-purple-50 rounded">
                      <p className="text-xs text-purple-600 font-medium">
                        Service
                      </p>
                      <p className="text-sm text-purple-800">
                        {patient.serviceName}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        router.push(`/reviewer/patients/${patient.id}`)
                      }
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        toast({
                          title: "Create Medical Review",
                          description: `Opening medical review form for ${patient.firstName} ${patient.lastName}. This feature allows reviewers to create formal medical assessments, document findings, and make treatment recommendations.`,
                        });
                      }}
                    >
                      <ClipboardList className="h-4 w-4 mr-1" />
                      Assess
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
