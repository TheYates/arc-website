"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  ClipboardList,
  FileText,
  Stethoscope,
  Heart,
  MessageSquare,
  Bell,
  Activity,
  CreditCard,
  User,
  Users
} from "lucide-react";

interface ApplicationData {
  assignedCaregiver?: {
    id: string;
    name: string;
    email: string;
    assignedAt: string;
  };
  assignedReviewer?: {
    id: string;
    name: string;
    email: string;
    assignedAt: string;
  };
}

export function PatientMobileDashboard() {
  const { user } = useAuth();
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const response = await fetch(`/api/patient/application?userId=${user?.id || 'test-user-id'}`);
        if (response.ok) {
          const data = await response.json();
          setApplicationData(data.application);
        }
      } catch (error) {
        console.error('Failed to fetch application data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchApplicationData();
    }
  }, [user]);

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          Hi {user?.firstName || "Patient"}
        </h1>
        <p className="text-muted-foreground">
          {formatDate(now)} • {timeStr}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Application</p>
              <p className="text-xl font-semibold">Approved</p>
            </div>
            <FileText className="h-5 w-5 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Payment</p>
              <p className="text-xl font-semibold">Pending</p>
            </div>
            <CreditCard className="h-5 w-5 text-orange-600" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="w-full bg-green-600 hover:bg-green-700">
          <Link href="/patient/service-requests">
            <ClipboardList className="h-4 w-4 mr-2" /> Requests
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/patient/medical">
            <Stethoscope className="h-4 w-4 mr-2" /> Medical
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="w-full">
          <Link href="/patient/appointments">
            <Calendar className="h-4 w-4 mr-2" /> Appointments
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="w-full">
          <Link href="/patient/care-plan">
            <FileText className="h-4 w-4 mr-2" /> Care Plan
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/patient/messages">
            <MessageSquare className="h-4 w-4 mr-2" /> Messages
          </Link>
        </Button>
      </div>

      {/* Care Team */}
      <Card>
        <CardContent className="p-4">
          <div className="font-medium mb-3">Your Care Team</div>
          {isLoading ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 rounded-full w-8 h-8 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 rounded-full w-8 h-8 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Medical Reviewer */}
              {applicationData?.assignedReviewer ? (
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{applicationData.assignedReviewer.name}</p>
                    <p className="text-xs text-muted-foreground">Medical Reviewer</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">No Medical Reviewer</p>
                    <p className="text-xs text-muted-foreground">Will be assigned soon</p>
                  </div>
                </div>
              )}

              {/* Caregiver */}
              {applicationData?.assignedCaregiver ? (
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{applicationData.assignedCaregiver.name}</p>
                    <p className="text-xs text-muted-foreground">Care Coordinator</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">No Caregiver</p>
                    <p className="text-xs text-muted-foreground">Will be assigned soon</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-4">
          <div className="font-medium">Recent Activity</div>
          <div className="text-sm text-muted-foreground mt-1">
            Welcome to Alpha Rescue Consult! Your application has been approved.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
