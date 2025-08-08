"use client";

import React, { useState, useEffect } from "react";
import { VitalsChart } from "@/components/medical/vitals-chart";
import { PatientSymptomReportForm } from "@/components/medical/patient-symptom-report-form";
import {
  getMedications,
  getMedicationAdministrations,
  getSymptomReports,
} from "@/lib/api/medications";
import { getVitalSigns } from "@/lib/api/vitals";
import { useAuth } from "@/lib/auth";
import {
  Medication,
  MedicationAdministration,
  PatientSymptomReport,
} from "@/lib/types/medications";
import { VitalSigns } from "@/lib/types/vitals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Pill,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Heart,
  Plus,
} from "lucide-react";

export default function PatientMedicalPage() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [administrations, setAdministrations] = useState<
    MedicationAdministration[]
  >([]);
  const [symptomReports, setSymptomReports] = useState<PatientSymptomReport[]>(
    []
  );
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Assuming patient ID is user ID - you might need to adjust this based on your auth system
  const patientId = user?.id || "";

  useEffect(() => {
    if (patientId) {
      const fetchData = () => {
        try {
          const medicationsData = getMedications(patientId);
          setMedications(medicationsData);

          const vitalsData = getVitalSigns(patientId);
          setVitals(vitalsData);

          const administrationsData = getMedicationAdministrations(patientId);
          setAdministrations(administrationsData);

          const reportsData = getSymptomReports(patientId);
          setSymptomReports(reportsData);
        } catch (error) {
          console.error("Error fetching medical data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [patientId]);

  const handleSymptomReported = (newReport: PatientSymptomReport) => {
    setSymptomReports((prev) => [newReport, ...prev]);
    setShowSymptomForm(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "administered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "missed":
      case "refused":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  const getMostRecentVitals = () => {
    if (vitals.length === 0) return null;
    return vitals.sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )[0];
  };

  const getUpcomingMedications = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    return medications
      .filter((m) => m.isActive)
      .map((medication) => {
        const todayAdministrations = administrations.filter(
          (admin) =>
            admin.medicationId === medication.id &&
            admin.scheduledTime.startsWith(today)
        );

        // Simple schedule simulation - assuming once daily at 8 AM for this demo
        const scheduledTime = `${today}T08:00:00`;
        const hasBeenTaken = todayAdministrations.some(
          (admin) =>
            admin.status === "administered" &&
            admin.scheduledTime === scheduledTime
        );

        return {
          medication,
          scheduledTime,
          hasBeenTaken,
          overdue: new Date(scheduledTime) < now && !hasBeenTaken,
        };
      });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  const recentVitals = getMostRecentVitals();
  const upcomingMedications = getUpcomingMedications();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Medical Information</h1>
          <p className="text-muted-foreground">
            Track your health progress and manage your care
          </p>
        </div>
        <Button
          onClick={() => setShowSymptomForm(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Report Symptoms
        </Button>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Vitals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Vitals</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentVitals ? (
              <div className="space-y-2">
                {recentVitals.bloodPressure && (
                  <div className="flex justify-between">
                    <span className="text-sm">Blood Pressure:</span>
                    <span className="text-sm font-medium">
                      {recentVitals.bloodPressure.systolic}/
                      {recentVitals.bloodPressure.diastolic}
                    </span>
                  </div>
                )}
                {recentVitals.heartRate && (
                  <div className="flex justify-between">
                    <span className="text-sm">Heart Rate:</span>
                    <span className="text-sm font-medium">
                      {recentVitals.heartRate} BPM
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(recentVitals.recordedAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No vitals recorded yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Active Medications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Medications
            </CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(medications || []).filter((m) => m.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              medications prescribed
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Doses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Medications
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingMedications.filter((m) => m.hasBeenTaken).length}/
              {upcomingMedications.length}
            </div>
            <p className="text-xs text-muted-foreground">
              doses completed today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="vitals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="symptoms">Symptom Reports</TabsTrigger>
          <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals">
          <VitalsChart
            patientId={patientId}
            patientName={`${user?.firstName || ""} ${user?.lastName || ""}`}
            showControls={true}
          />
        </TabsContent>

        <TabsContent value="medications">
          <div className="grid gap-4">
            {(medications || []).length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No medications prescribed yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              (medications || []).map((medication) => (
                <Card key={medication.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Pill className="h-5 w-5 mr-2" />
                      {medication.medicationName}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Badge
                        variant={medication.isActive ? "default" : "secondary"}
                      >
                        {medication.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{medication.priority}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Dosage
                        </p>
                        <p>{medication.dosage}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Frequency
                        </p>
                        <p className="capitalize">
                          {medication.frequency.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Route
                        </p>
                        <p className="capitalize">
                          {medication.route.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Start Date
                        </p>
                        <p>
                          {new Date(medication.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Instructions
                      </p>
                      <p className="text-sm">{medication.instructions}</p>
                    </div>
                    {medication.sideEffects &&
                      medication.sideEffects.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Possible Side Effects
                          </p>
                          <p className="text-sm text-orange-600">
                            {medication.sideEffects.join(", ")}
                          </p>
                        </div>
                      )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="symptoms">
          <div className="space-y-4">
            {showSymptomForm ? (
              <PatientSymptomReportForm
                patientId={patientId}
                patientName={`${user?.firstName || ""} ${user?.lastName || ""}`}
                onSave={handleSymptomReported}
                onCancel={() => setShowSymptomForm(false)}
              />
            ) : (
              <div className="grid gap-4">
                {symptomReports.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No symptom reports yet.
                      </p>
                      <Button
                        onClick={() => setShowSymptomForm(true)}
                        className="mt-4 bg-orange-600 hover:bg-orange-700"
                      >
                        Report Your First Symptoms
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  symptomReports.map((report) => (
                    <Card key={report.id}>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Symptom Report
                        </CardTitle>
                        <div className="flex space-x-2">
                          <Badge
                            variant={
                              report.severity >= 4 ? "destructive" : "outline"
                            }
                          >
                            Severity: {report.severity}/5
                          </Badge>
                          <Badge
                            variant={
                              report.isResolved ? "default" : "secondary"
                            }
                          >
                            {report.isResolved ? "Resolved" : "Under Review"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Symptoms
                            </p>
                            <p className="text-sm">
                              {report.symptoms.join(", ")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Description
                            </p>
                            <p className="text-sm">{report.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Started
                              </p>
                              <p className="text-sm">
                                {new Date(report.startedAt).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Reported
                              </p>
                              <p className="text-sm">
                                {new Date(report.reportedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {report.reviewNotes && (
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-sm font-medium text-blue-800">
                                Medical Review
                              </p>
                              <p className="text-sm text-blue-700">
                                {report.reviewNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Today's Medication Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingMedications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No medications scheduled for today.
                  </p>
                ) : (
                  upcomingMedications.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded border ${
                        item.hasBeenTaken
                          ? "bg-green-50 border-green-200"
                          : item.overdue
                          ? "bg-red-50 border-red-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(
                          item.hasBeenTaken ? "administered" : "pending"
                        )}
                        <div>
                          <p className="font-medium">
                            {item.medication.medicationName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.medication.dosage} -{" "}
                            {new Date(item.scheduledTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          item.hasBeenTaken
                            ? "default"
                            : item.overdue
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {item.hasBeenTaken
                          ? "Completed"
                          : item.overdue
                          ? "Overdue"
                          : "Scheduled"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
