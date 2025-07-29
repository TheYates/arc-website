export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface ApplicationData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  serviceId: string;
  serviceName: string;
  startDate?: string;
  duration?: string;
  careNeeds?: string;
  preferredContact?: string;
  submittedAt: string;
  status: ApplicationStatus;
  adminNotes?: string;
  processedBy?: string;
  processedAt?: string;
}
