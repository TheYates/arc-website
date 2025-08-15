"use client";

import { useMemo, useCallback, memo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  ClipboardList,
  CheckCircle,
  Clock,
  CalendarClock,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Bell,
  Calendar,
  FileCheck,
  Plus,
  TrendingUp,
  Activity,
} from "lucide-react";

// Memoized components for better performance
const TabletStatCard = memo(({ stat }: { stat: any }) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {stat.title}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold">{stat.value}</h3>
            {stat.change && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">
                  {stat.change}
                </span>
              </div>
            )}
          </div>
          {stat.changeLabel && (
            <p className="text-xs text-muted-foreground">
              {stat.changeLabel}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          {stat.icon}
        </div>
      </div>
    </CardContent>
  </Card>
));

TabletStatCard.displayName = "TabletStatCard";

const TabletApplicationItem = memo(({ application, getStatusBadge }: { application: any; getStatusBadge: (status: string) => JSX.Element }) => (
  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors border">
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={application.avatar} alt={application.name} />
        <AvatarFallback>{application.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-sm">{application.name}</p>
        <p className="text-xs text-muted-foreground">{application.service}</p>
      </div>
    </div>
    <div className="flex flex-col items-end space-y-1">
      {getStatusBadge(application.status)}
      <span className="text-xs text-muted-foreground">{application.date}</span>
    </div>
  </div>
));

TabletApplicationItem.displayName = "TabletApplicationItem";

const TabletActivityItem = memo(({ activity, getActivityIcon }: { activity: any; getActivityIcon: (type: string) => JSX.Element }) => (
  <div className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors border">
    <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
    <div className="flex-grow min-w-0">
      <div className="flex items-start justify-between">
        <p className="font-medium text-sm truncate">{activity.action}</p>
        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{activity.time}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{activity.description}</p>
      <div className="flex items-center mt-2">
        <Avatar className="h-4 w-4 mr-1">
          <AvatarImage src={activity.avatar} alt={activity.user} />
          <AvatarFallback className="text-xs">{activity.user.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="text-xs text-muted-foreground">{activity.user}</span>
      </div>
    </div>
  </div>
));

TabletActivityItem.displayName = "TabletActivityItem";

interface TabletDashboardProps {
  userProfile: any;
  stats: any[];
  recentApplications: any[];
  recentActivities: any[];
  upcomingConsultations: any[];
  taskCompletion: any[];
  getStatusBadge: (status: string) => JSX.Element;
  getActivityIcon: (type: string) => JSX.Element;
}

export function TabletDashboard({
  userProfile,
  stats,
  recentApplications,
  recentActivities,
  upcomingConsultations,
  taskCompletion,
  getStatusBadge,
  getActivityIcon,
}: TabletDashboardProps) {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userProfile?.firstName}! Here's your overview for today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Quick Action
          </Button>
        </div>
      </div>

      {/* Stats Cards - 2x2 grid for tablets */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <TabletStatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Main Content - 2 column layout for tablets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Recent Applications */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Applications</CardTitle>
                  <CardDescription>Latest patient applications</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/applications">
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentApplications.slice(0, 4).map((application) => (
                <TabletApplicationItem
                  key={application.id}
                  application={application}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </CardContent>
            <CardFooter className="pt-3 border-t">
              <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
                <span>Showing 4 of {recentApplications.length}</span>
                <Link href="/admin/applications" className="hover:text-foreground">
                  View all →
                </Link>
              </div>
            </CardFooter>
          </Card>

          {/* Task Completion */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Task Progress</CardTitle>
              <CardDescription>Team progress overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {taskCompletion.map((task, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{task.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {task.completed}/{task.total}
                    </span>
                  </div>
                  <Progress value={task.percentage} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {task.percentage}% complete
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Consultations */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Upcoming Consultations</CardTitle>
                  <CardDescription>Scheduled appointments</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingConsultations.slice(0, 3).map((consultation) => (
                <div key={consultation.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{consultation.patientName}</p>
                        <p className="text-xs text-muted-foreground">{consultation.type}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {consultation.date}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {consultation.time} • {consultation.duration}
                      </span>
                      <span className="text-xs font-medium">{consultation.careGiver}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="pt-3 border-t">
              <Button variant="outline" size="sm" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </Button>
            </CardFooter>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Activities</CardTitle>
                  <CardDescription>Latest system activities</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Activity className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.slice(0, 4).map((activity) => (
                <TabletActivityItem
                  key={activity.id}
                  activity={activity}
                  getActivityIcon={getActivityIcon}
                />
              ))}
            </CardContent>
            <CardFooter className="pt-3 border-t">
              <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
                <span>Latest activities</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  View all →
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
