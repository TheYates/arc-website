"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Loader2, Calendar, Clock, FileText, User, Home } from "lucide-react";

export default function PatientDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "patient")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary p-2 rounded-full">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Patient Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-right">
              <div className="font-medium">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-muted-foreground">{user.email}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/logout")}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Welcome, {user.firstName}!</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                You have no upcoming appointments.
              </p>
              <Button className="mt-4 w-full" variant="outline">
                Schedule an Appointment
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2" />
                Care Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Your care plan is available for review.
              </p>
              <Button className="mt-4 w-full" variant="outline">
                View Care Plan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start space-x-2">
                <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="text-sm">Application approved</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="text-sm">Profile created</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Service Package</CardTitle>
              <CardDescription>
                Current services you are subscribed to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md">
                <h3 className="font-bold text-lg">AHENEFIE</h3>
                <p className="text-muted-foreground mt-1">
                  Live-in home care package
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                    Daily Check-ups
                  </span>
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                    Medication Management
                  </span>
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                    Meal Preparation
                  </span>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Alpha Rescue Consult. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
