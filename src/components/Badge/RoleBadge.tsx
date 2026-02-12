interface RoleBadgeProps {
  role: string;
}

const ROLE_BADGE_STYLES: Record<string, string> = {
  sudo: "rounded-lg badge bg-red-200 text-red-800 truncate",
  admin: "rounded-lg badge bg-amber-200 text-amber-800",
  clinician: "rounded-lg badge bg-blue-200 text-blue-800",
  patient: "rounded-lg badge bg-green-200 text-green-800",
  default: "rounded-lg badge bg-gray-200 text-gray-800",
};

const ROLE_LABEL: Record<string, string> = {
  sudo: "Super Admin",
  admin: "Admin",
  clinician: "Clinician",
  patient: "Patient",
  default: "N/A",
};

export default function RoleBadge(props: RoleBadgeProps) {
  const { role } = props;
  const style = ROLE_BADGE_STYLES[role] ?? ROLE_BADGE_STYLES.default;
  const label = ROLE_LABEL[role] ?? ROLE_LABEL.default;
  return <div className={style}>{label}</div>;
}
