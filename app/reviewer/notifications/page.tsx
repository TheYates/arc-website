import { NotificationsPage } from "@/components/notifications/notifications-page";
import { RoleHeader } from "@/components/role-header";

export default function ReviewerNotificationsPage() {
  return (
    <>
      <RoleHeader role="reviewer" />
      <NotificationsPage />
    </>
  );
}
