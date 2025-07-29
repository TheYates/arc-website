"use client";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  expiresAt?: string;
}

// Mock notifications storage
const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "5", // Patient
    title: "Upcoming Visit",
    message: "Your nurse Ama will visit you tomorrow at 10:00 AM",
    type: "info",
    read: false,
    actionUrl: "/contact",
    actionText: "Contact Us",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    userId: "4", // Care Giver
    title: "New Patient Assignment",
    message: "You have been assigned to care for Akosua Asante",
    type: "success",
    read: false,
    actionUrl: "/services",
    actionText: "View Services",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    userId: "3", // Reviewer
    title: "System Update",
    message: "System maintenance completed successfully",
    type: "success",
    read: false,
    actionUrl: "/",
    actionText: "Go to Home",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    userId: "2", // Admin
    title: "System Backup Completed",
    message: "Daily system backup completed successfully",
    type: "success",
    read: true,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];

export class NotificationService {
  static async getNotifications(
    userId: string,
    unreadOnly = false
  ): Promise<Notification[]> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    let userNotifications = mockNotifications.filter(
      (n) => n.userId === userId
    );

    if (unreadOnly) {
      userNotifications = userNotifications.filter((n) => !n.read);
    }

    // Filter out expired notifications
    const now = new Date();
    userNotifications = userNotifications.filter(
      (n) => !n.expiresAt || new Date(n.expiresAt) > now
    );

    return userNotifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static async markAsRead(notificationId: string): Promise<void> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const notification = mockNotifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  static async markAllAsRead(userId: string): Promise<{ success: boolean }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    mockNotifications
      .filter((n) => n.userId === userId)
      .forEach((n) => (n.read = true));

    return { success: true };
  }

  static async createNotification(
    notification: Omit<Notification, "id" | "createdAt">
  ): Promise<{ success: boolean }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    mockNotifications.unshift(newNotification);
    return { success: true };
  }

  static async deleteNotification(
    notificationId: string
  ): Promise<{ success: boolean }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const index = mockNotifications.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      mockNotifications.splice(index, 1);
    }

    return { success: true };
  }
}
