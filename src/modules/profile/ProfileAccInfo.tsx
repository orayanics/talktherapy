import RoleBadge from "~/components/Badge/RoleBadge";
import AccountStatusBadge from "~/components/Badge/AccountStatusBadge";

interface ProfileAccInfoProps {
  role: "sudo" | "admin" | "clinician" | "patient";
  data: any;
}

export default function ProfileAccInfo(props: ProfileAccInfoProps) {
  const { role, data } = props;
  const { account_status, created_at } = data;

  return (
    <>
      <p className="font-bold uppercase text-info">Account Information</p>
      <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Account Type</p>
          <RoleBadge role={role} />
        </div>

        {role === "clinician" && (
          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Specialization</p>
            <p>SLP</p>
          </div>
        )}

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Account Status</p>
          <AccountStatusBadge status={account_status} />
        </div>
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Last Login</p>
          <p>Jan 24, 2025</p>
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Created At</p>
          <p>{created_at}</p>
        </div>
      </div>
    </>
  );
}
