import { NotificationsPage } from "@/components/notifications/notifications-page";
import { RoleHeader } from "@/components/role-header";

export default function PatientNotificationsPage() {
  return (
    <>
      <RoleHeader role="patient" />
      <NotificationsPage />
    </>
  );
}
