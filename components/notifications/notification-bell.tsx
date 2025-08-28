"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Calendar,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth";
import {
  authenticatedGet,
  authenticatedPut,
  authenticatedPatch,
} from "@/lib/api/auth-headers";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: string;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
  serviceRequest?: {
    id: string;
    title: string;
    status: string;
  };
  schedule?: {
    id: string;
    title: string;
    status: string;
    scheduledDate: string;
  };
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  
  // Add debouncing to prevent excessive API calls
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  useEffect(() => {
    if (user) {
      fetchNotifications(true); // Force initial fetch
      
      // Intelligent polling: more frequent when notification panel is open,
      // less frequent when closed, and stop when user is idle
      let pollInterval: NodeJS.Timeout;
      
      const setupPolling = () => {
        clearInterval(pollInterval);
        // Poll every 60 seconds when closed, 15 seconds when open
        const interval = isOpen ? 15000 : 60000;
        pollInterval = setInterval(() => fetchNotifications(false), interval);
      };
      
      setupPolling();
      
      // Update polling frequency when panel opens/closes
      const timeoutId = setTimeout(setupPolling, 100);
      
      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeoutId);
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
      };
    }
  }, [user, isOpen]);

  const fetchNotifications = async (force = false) => {
    if (!user) return;
    
    // Debouncing: prevent calls more frequent than 5 seconds unless forced
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 5000) {
      return;
    }
    lastFetchRef.current = now;

    try {
      const response = await authenticatedGet(
        "/api/notifications?limit=20",
        user
      );
      if (!response.ok) {
        // Don't spam console with network errors
        if (response.status !== 401) {
          console.error("Failed to fetch notifications:", response.status);
        }
        return;
      }
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      // Silently handle network errors to reduce console spam
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching notifications:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    if (!user) return;

    try {
      const response = await authenticatedPatch("/api/notifications", user, {
        notificationIds,
        markAsRead: true,
      });

      if (!response.ok) {
        throw new Error("Failed to mark notifications as read");
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notificationIds.includes(notification.id)
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const response = await authenticatedPut("/api/notifications", user);

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead([notification.id]);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "SERVICE_REQUEST_CREATED":
      case "SERVICE_REQUEST_APPROVED":
      case "SERVICE_REQUEST_REJECTED":
      case "SERVICE_REQUEST_SCHEDULED":
      case "SERVICE_REQUEST_COMPLETED":
        return <ClipboardList className="h-4 w-4" />;
      case "SCHEDULE_CREATED":
      case "SCHEDULE_UPDATED":
      case "SCHEDULE_CANCELLED":
      case "SCHEDULE_REMINDER":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getRoleBasedNotificationStyles = () => {
    switch (user?.role) {
      case "reviewer":
        return {
          unreadBg: "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 dark:border-purple-400",
          readBg: "bg-white dark:bg-gray-800",
          hoverBg: "hover:bg-purple-100 dark:hover:bg-purple-900/30",
          unreadIndicator: "bg-purple-600 dark:bg-purple-400",
          priorityColors: {
            CRITICAL: "text-red-700 dark:text-red-400",
            HIGH: "text-orange-700 dark:text-orange-400", 
            MEDIUM: "text-purple-700 dark:text-purple-300",
            LOW: "text-purple-600 dark:text-purple-400",
            default: "text-purple-500 dark:text-purple-400"
          },
          titleColor: "text-gray-900 dark:text-gray-100",
          messageColor: "text-gray-600 dark:text-gray-300",
          timeColor: "text-gray-500 dark:text-gray-400"
        };
      case "caregiver":
        return {
          unreadBg: "bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-500 dark:border-teal-400",
          readBg: "bg-white dark:bg-gray-800",
          hoverBg: "hover:bg-teal-100 dark:hover:bg-teal-900/30",
          unreadIndicator: "bg-teal-600 dark:bg-teal-400",
          priorityColors: {
            CRITICAL: "text-red-700 dark:text-red-400",
            HIGH: "text-orange-700 dark:text-orange-400",
            MEDIUM: "text-teal-700 dark:text-teal-300",
            LOW: "text-teal-600 dark:text-teal-400",
            default: "text-teal-500 dark:text-teal-400"
          },
          titleColor: "text-gray-900 dark:text-gray-100",
          messageColor: "text-gray-600 dark:text-gray-300",
          timeColor: "text-gray-500 dark:text-gray-400"
        };
      case "patient":
        return {
          unreadBg: "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400",
          readBg: "bg-white dark:bg-gray-800",
          hoverBg: "hover:bg-green-100 dark:hover:bg-green-900/30",
          unreadIndicator: "bg-green-600 dark:bg-green-400",
          priorityColors: {
            CRITICAL: "text-red-700 dark:text-red-400",
            HIGH: "text-orange-700 dark:text-orange-400",
            MEDIUM: "text-green-700 dark:text-green-300",
            LOW: "text-green-600 dark:text-green-400",
            default: "text-green-500 dark:text-green-400"
          },
          titleColor: "text-gray-900 dark:text-gray-100",
          messageColor: "text-gray-600 dark:text-gray-300",
          timeColor: "text-gray-500 dark:text-gray-400"
        };
      default:
        return {
          unreadBg: "bg-blue-50 dark:bg-blue-900/20",
          readBg: "bg-white dark:bg-gray-800",
          hoverBg: "hover:bg-gray-50 dark:hover:bg-gray-700",
          unreadIndicator: "bg-blue-600 dark:bg-blue-400",
          priorityColors: {
            CRITICAL: "text-red-600 dark:text-red-400",
            HIGH: "text-orange-600 dark:text-orange-400",
            MEDIUM: "text-blue-600 dark:text-blue-400",
            LOW: "text-green-600 dark:text-green-400",
            default: "text-gray-600 dark:text-gray-400"
          },
          titleColor: "text-gray-900 dark:text-gray-100",
          messageColor: "text-gray-600 dark:text-gray-300",
          timeColor: "text-gray-500 dark:text-gray-400"
        };
    }
  };

  const getPriorityColor = (priority: string) => {
    const styles = getRoleBasedNotificationStyles();
    return styles.priorityColors[priority as keyof typeof styles.priorityColors] || styles.priorityColors.default;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer transition-colors ${
                  !notification.isRead 
                    ? `${getRoleBasedNotificationStyles().unreadBg} ${getRoleBasedNotificationStyles().hoverBg}` 
                    : `${getRoleBasedNotificationStyles().readBg} ${getRoleBasedNotificationStyles().hoverBg}`
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div
                    className={`mt-1 ${getPriorityColor(
                      notification.priority
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-medium truncate ${getRoleBasedNotificationStyles().titleColor}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className={`w-2 h-2 ${getRoleBasedNotificationStyles().unreadIndicator} rounded-full flex-shrink-0`} />
                      )}
                    </div>
                    <p className={`text-xs mb-2 line-clamp-2 ${getRoleBasedNotificationStyles().messageColor}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${getRoleBasedNotificationStyles().timeColor}`}>
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                      {notification.actionLabel && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {notification.actionLabel}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center">
              <Button variant="ghost" size="sm" className="w-full">
                View all notifications
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
