import { NotificationsPage } from "@/components/notifications/notifications-page";
import { RoleHeader } from "@/components/role-header";

export default function CaregiverNotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <RoleHeader role="caregiver" />
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with patient alerts, assignments, and important updates
            </p>
          </div>
        </div>

        {/* Notifications Content */}
        <NotificationsPage />
      </div>
    </div>
  );
}
