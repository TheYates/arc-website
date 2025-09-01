"use client";

import React, { useState } from "react";
import { Patient } from "@/lib/types/patients";
import { User } from "@/lib/auth";
import { Medication } from "@/lib/types/medications";
import { VitalSigns } from "@/lib/types/vitals";
import { MedicalReview } from "@/lib/types/medical-reviews";
import { formatDate } from "@/lib/utils";
import { formatBloodType, formatGender, formatCareLevel, formatPatientStatus } from "@/lib/types/patients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Activity,
  Pill,
  FileText,
  Heart,
  Eye,
  Stethoscope,
  Edit,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from "lucide-react";

interface CaregiverOverviewTabProps {
  patient: Patient;
  user: User;
  medications: Medication[];
  vitals: VitalSigns[];
  medicalReviews: MedicalReview[];
  isMedicalDataLoading: boolean;
  onEditPatient: () => void;
}

export function CaregiverOverviewTab({
  patient,
  user,
  medications,
  vitals,
  medicalReviews,
  isMedicalDataLoading,
  onEditPatient,
}: CaregiverOverviewTabProps) {
  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName || !lastName) return "??";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vitals Recorded
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vitals.length}</div>
            <p className="text-xs text-muted-foreground">
              {vitals.length > 0
                ? `Last recorded ${formatDate(
                    new Date(vitals[0].recordedAt)
                  )}`
                : "No vitals recorded"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Medications
            </CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isMedicalDataLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(medications || []).filter((m) => m.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(medications || []).filter((m) => m.isActive).length > 0
                    ? "Currently prescribed"
                    : "No active medications"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Medical Reviews
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {medicalReviews.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {medicalReviews.length > 0
                ? `Last review ${formatDate(
                    new Date(medicalReviews[0].createdAt)
                  )}`
                : "No reviews yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-teal-100 text-teal-600 text-lg font-semibold">
                    {getInitials(patient.firstName, patient.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Patient ID: {patient.id}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-teal-600 border-teal-200 hover:bg-teal-50"
                onClick={onEditPatient}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                {patient.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                {patient.phone || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {patient.dateOfBirth ? (
                  <>
                    {formatDate(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)} years old)
                  </>
                ) : (
                  "Not provided"
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                {formatGender(patient.gender)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <span>{patient.address || "Not provided"}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Blood Type</p>
              <p>{formatBloodType(patient.bloodType)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Care Level</p>
              <Badge variant={patient.careLevel === "low" || patient.careLevel === "medium" ? "default" : "destructive"}>
                {formatCareLevel(patient.careLevel)}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={patient.status === "stable" || patient.status === "improving" ? "default" : "destructive"}>
                {formatPatientStatus(patient.status)}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Emergency Contact</p>
              <p>{patient.emergencyContactName || "Not provided"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Emergency Phone</p>
              <p>{patient.emergencyContactPhone || "Not provided"}</p>
            </div>



            <div>
              <p className="text-sm text-muted-foreground">Registration Date</p>
              <p>{formatDate(patient.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Placeholder for future enhancement */}
        
      </div>
    </div>
  );
}
