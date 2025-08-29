import { NotificationsPage } from "@/components/notifications/notifications-page";
import { RoleHeader } from "@/components/role-header";

export default function AdminNotificationsPage() {
  return (
    <>
      <RoleHeader role="admin" />
      <NotificationsPage />
    </>
  );
}
