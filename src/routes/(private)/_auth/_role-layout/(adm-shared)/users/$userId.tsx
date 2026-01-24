import { createFileRoute } from "@tanstack/react-router";

import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

import PageTitle from "~/components/Page/PageTitle";

import ProfileAccInfo from "~/modules/profile/ProfileAccInfo";
import ProfileUserInfo from "~/modules/profile/ProfileUserInfo";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(adm-shared)/users/$userId",
)({
  component: RouteComponent,
});

type UserId = "sudo" | "admin" | "clinician" | "patient";

function RouteComponent() {
  const params = Route.useParams();
  const userId = params.userId as UserId;

  return (
    <>
      <PageTitle
        heading={"User Overview"}
        subheading={"Manage user profile and settings."}
      />

      <Grid cols={8} gap={6} className="w-auto md:w-200">
        <GridItem colSpan={8} className="flex flex-col gap-4 order-1">
          <ProfileAccInfo role={userId} />
          <ProfileUserInfo />

          <div className="flex flex-col gap-2 col-span-12">
            <button className="btn btn-primary">Deactivate User</button>
          </div>
        </GridItem>
      </Grid>
    </>
  );
}
