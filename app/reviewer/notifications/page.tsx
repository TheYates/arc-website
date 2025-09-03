import { NotificationsPage } from "@/components/notifications/notifications-page";
import { RoleHeader } from "@/components/role-header";

export default function ReviewerNotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <RoleHeader role="reviewer" />
      <NotificationsPage />
    </div>
  );
}
