"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Check, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { NotificationService, type Notification } from "@/lib/notifications";
import Link from "next/link";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Note: Removed automatic polling to prevent duplicate calls with main notification bell
      // This legacy component should only load on mount or manual refresh
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const allNotifications = await NotificationService.getNotifications(
        user.id
      );
      const unreadNotifications = await NotificationService.getNotifications(
        user.id,
        true
      );

      setNotifications(allNotifications);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await NotificationService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      const deletedNotification = notifications.find(
        (n) => n.id === notificationId
      );
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
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
          typeColors: {
            success: "text-green-600 dark:text-green-400",
            warning: "text-orange-600 dark:text-orange-400",
            error: "text-red-600 dark:text-red-400",
            info: "text-purple-600 dark:text-purple-400"
          },
          typeBgColors: {
            success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
            warning: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700",
            error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700",
            info: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700"
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
          typeColors: {
            success: "text-green-600 dark:text-green-400",
            warning: "text-orange-600 dark:text-orange-400",
            error: "text-red-600 dark:text-red-400",
            info: "text-teal-600 dark:text-teal-400"
          },
          typeBgColors: {
            success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
            warning: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700",
            error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700",
            info: "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700"
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
          typeColors: {
            success: "text-green-600 dark:text-green-400",
            warning: "text-orange-600 dark:text-orange-400",
            error: "text-red-600 dark:text-red-400",
            info: "text-green-600 dark:text-green-400"
          },
          typeBgColors: {
            success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
            warning: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700",
            error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700",
            info: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
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
          typeColors: {
            success: "text-green-500 dark:text-green-400",
            warning: "text-yellow-500 dark:text-yellow-400",
            error: "text-red-500 dark:text-red-400",
            info: "text-blue-500 dark:text-blue-400"
          },
          typeBgColors: {
            success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
            warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700",
            error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700",
            info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
          },
          titleColor: "text-gray-900 dark:text-gray-100",
          messageColor: "text-gray-600 dark:text-gray-300",
          timeColor: "text-gray-500 dark:text-gray-400"
        };
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    const iconClasses = "h-4 w-4";
    const styles = getRoleBasedNotificationStyles();
    const colorClass = styles.typeColors[type] || styles.typeColors.info;
    
    switch (type) {
      case "success":
        return <Check className={`${iconClasses} ${colorClass}`} />;
      case "warning":
        return <Bell className={`${iconClasses} ${colorClass}`} />;
      case "error":
        return <X className={`${iconClasses} ${colorClass}`} />;
      default:
        return <Bell className={`${iconClasses} ${colorClass}`} />;
    }
  };

  const getNotificationBgColor = (type: Notification["type"]) => {
    const styles = getRoleBasedNotificationStyles();
    return styles.typeBgColors[type] || styles.typeBgColors.info;
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-transparent border-slate-300 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-slate-200 dark:border-gray-600 z-50">
          <div className="p-4 border-b border-slate-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={markAllAsRead}
                    className="text-xs bg-transparent"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="bg-transparent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-slate-500 dark:text-gray-400">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-2/3"></div>
                </div>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-gray-500" />
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors ${
                      !notification.read 
                        ? `${getRoleBasedNotificationStyles().unreadBg} ${getRoleBasedNotificationStyles().hoverBg}` 
                        : `${getRoleBasedNotificationStyles().readBg} ${getRoleBasedNotificationStyles().hoverBg}`
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${getRoleBasedNotificationStyles().titleColor} ${
                                !notification.read ? "font-semibold" : ""
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p className={`text-sm mt-1 ${getRoleBasedNotificationStyles().messageColor}`}>
                              {notification.message}
                            </p>
                            <p className={`text-xs mt-2 ${getRoleBasedNotificationStyles().timeColor}`}>
                              {new Date(
                                notification.createdAt
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 w-6 p-0 bg-transparent"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 bg-transparent"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {notification.actionUrl && notification.actionText && (
                          <div className="mt-2">
                            <Link href={notification.actionUrl}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-transparent"
                                onClick={() => {
                                  markAsRead(notification.id);
                                  setIsOpen(false);
                                }}
                              >
                                {notification.actionText}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
