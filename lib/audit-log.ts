"use client";

export interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export type AuditAction =
  | "user.login"
  | "user.logout"
  | "user.register"
  | "user.profile.update"
  | "user.password.reset"
  | "user.email.verify"
  | "admin.user.create"
  | "admin.user.update"
  | "admin.user.delete"
  | "admin.user.role.change"
  | "patient.activity.create"
  | "patient.activity.update"
  | "caregiver.activity.log"
  | "reviewer.activity.review"
  | "system.backup.create"
  | "system.maintenance.start";

// Mock audit log storage
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "1",
    userId: "1",
    userEmail: "superadmin@arc.com",
    action: "user.login",
    resource: "authentication",
    details: { loginMethod: "password", rememberMe: true },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    userId: "2",
    userEmail: "admin@arc.com",
    action: "admin.user.create",
    resource: "user",
    resourceId: "6",
    details: { newUserRole: "care_giver", newUserEmail: "nurse.kwame@arc.com" },
    ipAddress: "192.168.1.101",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    userId: "4",
    userEmail: "nurse.ama@arc.com",
    action: "caregiver.activity.log",
    resource: "patient_activity",
    resourceId: "123",
    details: {
      patientId: "5",
      activityType: "vital_signs",
      values: { bp: "120/80", hr: "72" },
    },
    ipAddress: "192.168.1.102",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

export class AuditLogger {
  static async log(
    userId: string,
    userEmail: string,
    action: AuditAction,
    resource: string,
    details: Record<string, any> = {},
    resourceId?: string
  ): Promise<void> {
    const entry: AuditLogEntry = {
      id: Date.now().toString(),
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      details,
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent(),
      timestamp: new Date().toISOString(),
    };

    mockAuditLogs.unshift(entry); // Add to beginning for latest first

    // In real app, send to backend API
    // Audit log entry created
  }

  static async getLogs(
    filters: {
      userId?: string;
      action?: AuditAction;
      resource?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    } = {}
  ): Promise<AuditLogEntry[]> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    let filteredLogs = [...mockAuditLogs];

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(
        (log) => log.userId === filters.userId
      );
    }

    if (filters.action) {
      filteredLogs = filteredLogs.filter(
        (log) => log.action === filters.action
      );
    }

    if (filters.resource) {
      filteredLogs = filteredLogs.filter(
        (log) => log.resource === filters.resource
      );
    }

    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(
        (log) => log.timestamp >= filters.startDate!
      );
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(
        (log) => log.timestamp <= filters.endDate!
      );
    }

    const limit = filters.limit || 50;
    return filteredLogs.slice(0, limit);
  }

  private static getClientIP(): string {
    // In real app, get from request headers
    return "192.168.1.100";
  }

  private static getUserAgent(): string {
    if (typeof window !== "undefined") {
      return window.navigator.userAgent;
    }
    return "Unknown";
  }
}
