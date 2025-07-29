import { v4 as uuidv4 } from "uuid";
import { ApplicationData, ApplicationStatus } from "../types/applications";

// In a real app, this would be stored in a database
let applications: ApplicationData[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@example.com",
    phone: "+233 55 123 4567",
    address: "123 Main St, Accra",
    serviceId: "ahenefie",
    serviceName: "AHENEFIE",
    startDate: "2023-09-25",
    duration: "medium-term",
    careNeeds: "Assistance with daily activities and medication management",
    preferredContact: "phone",
    submittedAt: "2023-09-15T10:23:00Z",
    status: "pending",
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Smith",
    email: "michael.s@example.com",
    phone: "+233 24 987 6543",
    address: "456 Oak Ave, Kumasi",
    serviceId: "adamfo-pa",
    serviceName: "ADAMFO PA",
    startDate: "2023-09-20",
    duration: "long-term",
    careNeeds: "Post-surgery recovery care and physiotherapy assistance",
    preferredContact: "email",
    submittedAt: "2023-09-14T15:45:00Z",
    status: "approved",
    processedBy: "admin@alpharescue.com",
    processedAt: "2023-09-15T09:30:00Z",
  },
  {
    id: "3",
    firstName: "Emma",
    lastName: "Thompson",
    email: "emma.t@example.com",
    phone: "+233 50 456 7890",
    address: "789 Pine Rd, Takoradi",
    serviceId: "yonko-pa",
    serviceName: "YONKO PA",
    startDate: "2023-10-01",
    duration: "short-term",
    careNeeds: "Childcare for 3-year-old twins while recovering from surgery",
    preferredContact: "whatsapp",
    submittedAt: "2023-09-14T09:15:00Z",
    status: "pending",
  },
  {
    id: "4",
    firstName: "Daniel",
    lastName: "Brown",
    email: "daniel.b@example.com",
    phone: "+233 27 345 6789",
    address: "234 Cedar Ln, Tamale",
    serviceId: "fie-ne-fie",
    serviceName: "FIE NE FIE",
    startDate: "2023-09-18",
    duration: "short-term",
    careNeeds: "Eldercare for parent with dementia for 2 weeks",
    preferredContact: "phone",
    submittedAt: "2023-09-13T14:20:00Z",
    status: "rejected",
    adminNotes: "Service not available in client location",
    processedBy: "admin@alpharescue.com",
    processedAt: "2023-09-14T10:10:00Z",
  },
  {
    id: "5",
    firstName: "Jessica",
    lastName: "Wilson",
    email: "jessica.w@example.com",
    phone: "+233 54 234 5678",
    address: "567 Maple Dr, Cape Coast",
    serviceId: "ahenefie",
    serviceName: "AHENEFIE",
    startDate: "2023-10-05",
    duration: "medium-term",
    careNeeds: "Home care for elderly parent recovering from stroke",
    preferredContact: "email",
    submittedAt: "2023-09-12T11:30:00Z",
    status: "approved",
    processedBy: "admin@alpharescue.com",
    processedAt: "2023-09-13T13:45:00Z",
  },
];

export async function getApplications(): Promise<ApplicationData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 150));
  return applications;
}

export async function getApplicationById(
  id: string
): Promise<ApplicationData | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return applications.find((app) => app.id === id) || null;
}

export async function createApplication(
  data: Omit<ApplicationData, "id" | "status" | "submittedAt">
): Promise<ApplicationData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newApplication: ApplicationData = {
    ...data,
    id: uuidv4(),
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  applications = [...applications, newApplication];
  return newApplication;
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  adminNotes?: string,
  processedBy?: string
): Promise<ApplicationData | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  const index = applications.findIndex((app) => app.id === id);
  if (index === -1) return null;

  const updatedApplication = {
    ...applications[index],
    status,
    adminNotes,
    processedBy,
    processedAt: new Date().toISOString(),
  };

  applications = [
    ...applications.slice(0, index),
    updatedApplication,
    ...applications.slice(index + 1),
  ];

  return updatedApplication;
}
