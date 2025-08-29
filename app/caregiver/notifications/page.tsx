import { NotificationsPage } from "@/components/notifications/notifications-page";
import { RoleHeader } from "@/components/role-header";

export default function CaregiverNotificationsPage() {
  return (
    <>
      <RoleHeader role="caregiver" />
      <NotificationsPage />
    </>
  );
}
