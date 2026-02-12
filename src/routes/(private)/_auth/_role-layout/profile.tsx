import { createFileRoute } from "@tanstack/react-router";
import RoleBadge from "~/components/Badge/RoleBadge";

import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";
import PageTitle from "~/components/Page/PageTitle";

import ProfileAccInfo from "~/modules/profile/ProfileAccInfo";
import ProfileUserInfo from "~/modules/profile/ProfileUserInfo";

import { useSession } from "~/context/SessionContext";

export const Route = createFileRoute("/(private)/_auth/_role-layout/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const session = useSession();
  const { account_role } = session;

  return (
    <>
      <PageTitle
        heading={"User Profile"}
        subheading={"Manage your profile information and settings."}
      />

      <Grid cols={8} gap={6} className="w-auto md:w-200">
        <GridItem colSpan={8} className="flex flex-col gap-4 order-1">
          <ProfileUserInfo data={session} />
          <ProfileAccInfo role={account_role as any} data={session} />

          <div className="flex flex-col gap-2 col-span-12">
            <button className="btn btn-primary">Edit Profile</button>
            <button className="btn btn-neutral">Change Password</button>
          </div>
        </GridItem>
      </Grid>
    </>
  );
}
