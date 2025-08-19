export type ApplicationStatus = "pending" | "approved" | "rejected";
export type InvoiceStatus = "pending" | "sent" | "paid" | "overdue" | "cancelled";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";
export type PaymentAttemptStatus = "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded";
export type NotificationType = "email" | "sms";
export type NotificationStatus = "pending" | "sent" | "failed" | "delivered";

export interface ApplicationFeature {
  id: string;
  applicationId: string;
  featureId: string;
  featureName: string;
  featureType: string; // "feature" or "addon"
  isSelected: boolean;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  itemType: string; // "service", "feature", "addon"
  itemId?: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sortOrder: number;
}

export interface Invoice {
  id: string;
  applicationId: string;
  invoiceNumber: string;
  basePrice: number;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate?: string;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
}

export interface NotificationHistory {
  id: string;
  applicationId: string;
  type: NotificationType;
  recipient: string;
  subject?: string;
  content: string;
  status: NotificationStatus;
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAttempt {
  id: string;
  applicationId: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentProvider?: string;
  providerReference?: string;
  status: PaymentAttemptStatus;
  failureReason?: string;
  metadata?: any;
  initiatedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

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

  // User account fields
  userId?: string;
  tempPassword?: string;
  credentialsSentAt?: string;
  emailSent?: boolean;
  smsSent?: boolean;

  // Payment tracking fields
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  paymentCompletedAt?: string;

  createdAt?: string;
  updatedAt?: string;
  selectedFeatures?: ApplicationFeature[];
  invoices?: Invoice[];
  notificationHistory?: NotificationHistory[];
  paymentAttempts?: PaymentAttempt[];
}

export interface CreateApplicationData {
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
  customizations?: string;
  selectedOptionalFeatures?: string[]; // Array of feature IDs
}
