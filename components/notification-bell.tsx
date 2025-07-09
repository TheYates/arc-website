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

  const getNotificationIcon = (type: Notification["type"]) => {
    const iconClasses = "h-4 w-4";
    switch (type) {
      case "success":
        return <Check className={`${iconClasses} text-green-500`} />;
      case "warning":
        return <Bell className={`${iconClasses} text-yellow-500`} />;
      case "error":
        return <X className={`${iconClasses} text-red-500`} />;
      default:
        return <Bell className={`${iconClasses} text-blue-500`} />;
    }
  };

  const getNotificationBgColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-transparent border-slate-300 hover:bg-slate-50"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96  rounded-lg shadow-lg border border-slate-200 z-50">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold ">Notifications</h3>
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
              <div className="p-4 text-center text-slate-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto mb-2"></div>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 transition-colors ${
                      !notification.read ? "bg-slate-50" : ""
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
                              className={`text-sm font-medium text-slate-900 ${
                                !notification.read ? "font-semibold" : ""
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
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
