import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Loading components for different sections
function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ApplicationsLoading() {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Applications</CardTitle>
        <CardDescription>Latest patient applications submitted</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="space-y-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivitiesLoading() {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Latest actions taken in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-2">
              <Skeleton className="h-5 w-5 rounded-full mt-1" />
              <div className="flex-grow space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-48" />
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 rounded-full mr-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Server Components for data fetching
async function DashboardStats() {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In real implementation, fetch from your API
  const stats = [
    { title: "Total Users", value: "1,234", icon: "👥" },
    { title: "Total Patients", value: "856", icon: "🏥" },
    { title: "Pending Applications", value: "23", icon: "⏰" },
    { title: "Active Patients", value: "789", icon: "✅" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-bold">{stat.value}</h3>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function RecentApplications() {
  // Simulate slower API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const applications = [
    { id: 1, name: "John Doe", service: "Home Care", status: "pending" },
    { id: 2, name: "Jane Smith", service: "Medical Review", status: "approved" },
    { id: 3, name: "Bob Johnson", service: "Emergency Care", status: "pending" },
  ];

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Applications</CardTitle>
        <CardDescription>Latest patient applications submitted</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {app.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{app.name}</p>
                  <p className="text-sm text-muted-foreground">{app.service}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {app.status}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

async function RecentActivities() {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const activities = [
    { id: 1, action: "Application Approved", user: "Admin", time: "2 min ago" },
    { id: 2, action: "Patient Assigned", user: "Dr. Smith", time: "5 min ago" },
    { id: 3, action: "Review Completed", user: "Nurse Johnson", time: "10 min ago" },
  ];

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Latest actions taken in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 p-2 rounded-lg hover:bg-accent">
              <div className="h-5 w-5 rounded-full bg-primary/20 mt-1" />
              <div className="flex-grow">
                <div className="flex justify-between">
                  <p className="font-medium">{activity.action}</p>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">by {activity.user}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Main streaming dashboard component
export default function StreamingDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your overview for today.
          </p>
        </div>
      </div>

      {/* Stats with Suspense */}
      <Suspense fallback={<StatsLoading />}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Applications with Suspense */}
        <Suspense fallback={<ApplicationsLoading />}>
          <RecentApplications />
        </Suspense>

        {/* Activities with Suspense */}
        <Suspense fallback={<ActivitiesLoading />}>
          <RecentActivities />
        </Suspense>
      </div>
    </div>
  );
}
