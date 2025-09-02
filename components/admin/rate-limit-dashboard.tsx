"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  AlertTriangle,
  Activity,
  Clock,
  Users,
  Globe,
  RefreshCw,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface RateLimitViolation {
  timestamp: string;
  key: string;
  ip: string;
  userAgent: string;
  endpoint: string;
  method: string;
  count: number;
  limit: number;
}

interface RateLimitStats {
  totalViolations: number;
  uniqueIPs: number;
  uniqueEndpoints: number;
  violationsByEndpoint: Record<string, number>;
  violationsByHour: Record<string, number>;
  topUserAgents: Record<string, number>;
}

interface TopViolator {
  ip: string;
  count: number;
  endpoints: string[];
  firstViolation: string;
  lastViolation: string;
}

interface RateLimitData {
  violations: RateLimitViolation[];
  stats: RateLimitStats;
  topViolators: TopViolator[];
  timeRange: string;
  generatedAt: string;
}

export function RateLimitDashboard() {
  const [data, setData] = useState<RateLimitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("24");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { toast } = useToast();
  const { user, isLoading: authLoading, isHydrated } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!user) {
        setError('Please log in to view rate limiting data');
        setLoading(false);
        return;
      }

      if (user.role !== 'admin' && user.role !== 'super_admin') {
        setError('Admin access required to view rate limiting data');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/rate-limit-monitor?hours=${timeRange}`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`Failed to fetch rate limit data: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Rate limit dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearViolations = async (targetIP?: string) => {
    try {
      if (!user) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/admin/rate-limit-monitor/clear', {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'clear_violations',
          targetIP
        })
      });

      if (response.ok) {
        toast({
          title: "Violations Cleared",
          description: targetIP ? `Cleared violations for ${targetIP}` : "All violations cleared"
        });
        fetchData();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to clear violations",
        variant: "destructive"
      });
    }
  };

  const resetRateLimits = async (targetIP?: string) => {
    try {
      if (!user) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/admin/rate-limit-monitor/clear', {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'reset_limits',
          targetIP
        })
      });

      if (response.ok) {
        toast({
          title: "Rate Limits Reset",
          description: targetIP ? `Reset limits for ${targetIP}` : "All rate limits reset"
        });
        fetchData();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reset rate limits",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user && isHydrated && !authLoading) {
      fetchData();
    }
  }, [timeRange, user, isHydrated, authLoading]);

  useEffect(() => {
    if (autoRefresh && user && isHydrated && !authLoading) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeRange, user, isHydrated, authLoading]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityBadge = (count: number, limit: number) => {
    const ratio = count / limit;
    if (ratio >= 3) return <Badge variant="destructive">Critical</Badge>;
    if (ratio >= 2) return <Badge variant="secondary">High</Badge>;
    return <Badge variant="outline">Medium</Badge>;
  };

  // Show loading state while checking authentication or loading data
  if (authLoading || !isHydrated || (loading && !data)) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>
              {authLoading || !isHydrated ? 'Checking authentication...' : 'Loading rate limit data...'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show authentication required message
  if (!user) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Please log in with an admin account to view rate limiting data.
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/login'}
            className="ml-2"
          >
            Go to Login
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Show insufficient permissions message
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return (
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Admin access required to view rate limiting data. Your current role: {user.role}
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load rate limit data: {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Rate Limiting Monitor</h2>
          <p className="text-muted-foreground">
            Monitor and manage API rate limiting violations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Hour</SelectItem>
              <SelectItem value="6">6 Hours</SelectItem>
              <SelectItem value="24">24 Hours</SelectItem>
              <SelectItem value="168">7 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
            Auto Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalViolations}</div>
              <p className="text-xs text-muted-foreground">
                in {data.timeRange}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.uniqueIPs}</div>
              <p className="text-xs text-muted-foreground">
                violating rate limits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Affected Endpoints</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.uniqueEndpoints}</div>
              <p className="text-xs text-muted-foreground">
                under attack
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {formatTimestamp(data.generatedAt)}
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time monitoring
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Data */}
      {data && (
        <Tabs defaultValue="violations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="violations">Recent Violations</TabsTrigger>
            <TabsTrigger value="violators">Top Violators</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          </TabsList>

          <TabsContent value="violations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Rate Limit Violations</CardTitle>
              </CardHeader>
              <CardContent>
                {data.violations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No rate limit violations in the selected time range.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Violations</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.violations.slice(0, 50).map((violation, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs">
                            {formatTimestamp(violation.timestamp)}
                          </TableCell>
                          <TableCell className="font-mono">
                            {violation.ip}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {violation.endpoint}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{violation.method}</Badge>
                          </TableCell>
                          <TableCell>
                            {violation.count}/{violation.limit}
                          </TableCell>
                          <TableCell>
                            {getSeverityBadge(violation.count, violation.limit)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => resetRateLimits(violation.ip)}
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => clearViolations(violation.ip)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="violators" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Violators</CardTitle>
              </CardHeader>
              <CardContent>
                {data.topViolators.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No repeat violators found.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Total Violations</TableHead>
                        <TableHead>Endpoints Targeted</TableHead>
                        <TableHead>First Violation</TableHead>
                        <TableHead>Last Violation</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topViolators.map((violator, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">
                            {violator.ip}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">{violator.count}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {violator.endpoints.slice(0, 3).map((endpoint, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {endpoint.split('/').pop()}
                                </Badge>
                              ))}
                              {violator.endpoints.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{violator.endpoints.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatTimestamp(violator.firstViolation)}
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatTimestamp(violator.lastViolation)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => resetRateLimits(violator.ip)}
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => clearViolations(violator.ip)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Violations by Endpoint</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Violations</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(data.stats.violationsByEndpoint)
                      .sort(([,a], [,b]) => b - a)
                      .map(([endpoint, count]) => (
                        <TableRow key={endpoint}>
                          <TableCell className="font-mono text-xs">
                            {endpoint}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{count}</Badge>
                          </TableCell>
                          <TableCell>
                            {((count / data.stats.totalViolations) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
