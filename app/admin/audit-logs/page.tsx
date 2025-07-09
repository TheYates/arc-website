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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth, hasPermission } from "@/lib/auth";
import { AuditLogger, type AuditLogEntry } from "@/lib/audit-log";
import {
  FileText,
  Search,
  Download,
  AlertTriangle,
  Shield,
  User,
  Activity,
} from "lucide-react";

export default function AuditLogsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedResource, setSelectedResource] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user && !hasPermission(user.role, "admin")) {
      router.push("/dashboard");
    }
    if (user && hasPermission(user.role, "admin")) {
      loadAuditLogs();
    }
  }, [user, authLoading, router]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const auditLogs = await AuditLogger.getLogs({ limit: 100 });
      setLogs(auditLogs);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesAction =
      selectedAction === "all" || log.action === selectedAction;
    const matchesResource =
      selectedResource === "all" || log.resource === selectedResource;

    return matchesSearch && matchesAction && matchesResource;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes("login") || action.includes("logout"))
      return "bg-blue-100 text-blue-800";
    if (action.includes("create") || action.includes("register"))
      return "bg-green-100 text-green-800";
    if (action.includes("update") || action.includes("change"))
      return "bg-yellow-100 text-yellow-800";
    if (action.includes("delete")) return "bg-red-100 text-red-800";
    if (action.includes("admin")) return "bg-purple-100 text-purple-800";
    return "bg-slate-100 text-slate-800";
  };

  const getActionIcon = (action: string) => {
    if (
      action.includes("user") ||
      action.includes("login") ||
      action.includes("logout")
    ) {
      return <User className="h-4 w-4" />;
    }
    if (action.includes("admin")) {
      return <Shield className="h-4 w-4" />;
    }
    return <Activity className="h-4 w-4" />;
  };

  const formatDetails = (details: Record<string, any>) => {
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(", ");
  };

  const exportLogs = () => {
    const csvContent = [
      ["Timestamp", "User", "Action", "Resource", "Details", "IP Address"].join(
        ","
      ),
      ...filteredLogs.map((log) =>
        [
          log.timestamp,
          log.userEmail,
          log.action,
          log.resource,
          `"${formatDetails(log.details)}"`,
          log.ipAddress,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Filters Skeleton */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>

          {/* Table Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 p-4 border rounded"
                  >
                    <Skeleton className="h-8 w-8" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user || !hasPermission(user.role, "admin")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access audit logs.
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
          <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-600 mt-2">
            Track all system activities and user actions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {logs.length}
                  </p>
                  <p className="text-sm text-slate-600">Total Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {logs.filter((log) => log.action.includes("user")).length}
                  </p>
                  <p className="text-sm text-slate-600">User Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {logs.filter((log) => log.action.includes("admin")).length}
                  </p>
                  <p className="text-sm text-slate-600">Admin Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {
                      logs.filter(
                        (log) =>
                          new Date(log.timestamp) >
                          new Date(Date.now() - 24 * 60 * 60 * 1000)
                      ).length
                    }
                  </p>
                  <p className="text-sm text-slate-600">Last 24 Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Activity Log</span>
              </CardTitle>
              <Button
                onClick={exportLogs}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Actions</option>
                <option value="user.login">User Login</option>
                <option value="user.logout">User Logout</option>
                <option value="admin.user.create">User Created</option>
                <option value="admin.user.update">User Updated</option>
                <option value="admin.user.delete">User Deleted</option>
              </select>
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Resources</option>
                <option value="user">User</option>
                <option value="authentication">Authentication</option>
                <option value="patient_activity">Patient Activity</option>
                <option value="system">System</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm text-slate-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">
                          {log.userEmail}
                        </div>
                        <div className="text-sm text-slate-500">
                          ID: {log.userId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getActionBadgeColor(
                          log.action
                        )} flex items-center space-x-1 w-fit`}
                      >
                        {getActionIcon(log.action)}
                        <span>{log.action}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-700">
                        {log.resource}
                      </span>
                      {log.resourceId && (
                        <div className="text-xs text-slate-500">
                          ID: {log.resourceId}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div
                        className="text-sm text-slate-600 max-w-xs truncate"
                        title={formatDetails(log.details)}
                      >
                        {formatDetails(log.details)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {log.ipAddress}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
