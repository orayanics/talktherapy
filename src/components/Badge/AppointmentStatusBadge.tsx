import { AppointmentStatus, AppointmentStatusValues } from "~/models/content";

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

const APPOINTMENT_STATUS_BADGE_STYLES: Record<AppointmentStatus, string> = {
  pending:
    "rounded-lg badge badge-outline bg-yellow-50 text-yellow-800 border-yellow-200",
  accepted:
    "rounded-lg badge badge-outline bg-blue-50 text-blue-800 border-blue-200",
  rejected:
    "rounded-lg badge badge-outline bg-red-50 text-red-800 border-red-200",
  completed:
    "rounded-lg badge badge-outline bg-green-50 text-green-800 border-green-200",
  requested:
    "rounded-lg badge badge-outline bg-purple-50 text-purple-800 border-purple-200",
  rescheduled:
    "rounded-lg badge badge-outline bg-orange-50 text-orange-800 border-orange-200",
  fallback:
    "rounded-lg badge badge-outline bg-gray-50 text-gray-800 border-gray-200",
};

export default function AppointmentStatusBadge(
  props: AppointmentStatusBadgeProps,
) {
  const { status } = props;
  const style =
    APPOINTMENT_STATUS_BADGE_STYLES[status] ??
    APPOINTMENT_STATUS_BADGE_STYLES.pending;
  return <div className={style}>{AppointmentStatusValues[status]}</div>;
}
