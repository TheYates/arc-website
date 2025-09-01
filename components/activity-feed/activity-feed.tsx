"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ActivityFeedItem, ActivityFeedResponse, ACTIVITY_CONFIG } from "@/lib/types/activity-feed";
import { getActivityFeed } from "@/lib/api/activity-feed-client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bell, 
  FileText, 
  Stethoscope, 
  Pill, 
  CheckCircle, 
  Activity, 
  UserPlus, 
  AlertTriangle, 
  Edit,
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ICON_MAP = {
  Bell,
  FileText,
  Stethoscope,
  Pill,
  CheckCircle,
  Activity,
  UserPlus,
  AlertTriangle,
  Edit
};

interface ActivityFeedProps {
  title?: string;
  description?: string;
  maxItems?: number;
  showLoadMore?: boolean;
  roleColor?: "teal" | "purple";
  className?: string;
}

export function ActivityFeed({
  title = "Recent Updates",
  description = "Latest notifications and system messages",
  maxItems = 10,
  showLoadMore = true,
  roleColor = "teal",
  className = ""
}: ActivityFeedProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const loadActivities = useCallback(async (cursor?: string, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const response = await getActivityFeed({
        limit: maxItems,
        cursor
      }, user);

      if (append) {
        setActivities(prev => [...prev, ...response.activities]);
      } else {
        setActivities(response.activities);
      }

      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
      setError(null);
    } catch (err) {
      console.error("Failed to load activities:", err);
      setError("Failed to load activities");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [maxItems, user]);

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user, loadActivities]);

  const handleRefresh = () => {
    loadActivities();
  };

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      loadActivities(nextCursor, true);
    }
  };

  const getActivityIcon = (type: string) => {
    const config = ACTIVITY_CONFIG[type as keyof typeof ACTIVITY_CONFIG];
    if (!config) return Bell;
    
    const IconComponent = ICON_MAP[config.icon as keyof typeof ICON_MAP];
    return IconComponent || Bell;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      medium: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200",
      urgent: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
    };

    return (
      <Badge className={`text-xs ${variants[priority as keyof typeof variants] || variants.medium}`}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const renderActivityItem = (activity: ActivityFeedItem) => {
    const config = ACTIVITY_CONFIG[activity.type] || ACTIVITY_CONFIG.care_note_created;
    const IconComponent = getActivityIcon(activity.type);

    return (
      <div
        key={activity.id}
        className="p-2.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-0.5 flex-shrink-0">
            <IconComponent className={`h-3.5 w-3.5 ${config.iconColorClass}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 leading-tight">
                  {activity.title}
                </p>
                <p className="text-xs mt-0.5 text-gray-600 dark:text-gray-300 leading-relaxed">
                  {activity.description}
                </p>
              </div>
              {activity.priority !== "medium" && (
                <div className="flex-shrink-0">
                  {getPriorityBadge(activity.priority)}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span>
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </span>
              <span>
                by {activity.createdByName}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-gray-100">
            <Bell className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
            {title}
          </CardTitle>
          <CardDescription className="text-xs text-gray-600 dark:text-gray-400">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border">
              <div className="flex items-start gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-gray-100">
              <Bell className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
              {title}
            </CardTitle>
            <CardDescription className="text-xs text-gray-600 dark:text-gray-400">{description}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {error ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">No recent activities</p>
            <p className="text-xs text-muted-foreground mt-1">
              Activities will appear here when actions are performed
            </p>
          </div>
        ) : (
          <>
            {activities.map(renderActivityItem)}
            
            {showLoadMore && hasMore && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Load More
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
