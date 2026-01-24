import { createFileRoute } from "@tanstack/react-router";

import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

import PageTitle from "~/components/Page/PageTitle";
import RoleBadge from "~/components/Badge/RoleBadge";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(adm-shared)/users/$id",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const userId = params.id;
  return (
    <>
      <PageTitle
        heading={"User Overview"}
        subheading={"Manage user profile and settings."}
      />

      <Grid cols={8} gap={6} className="w-auto md:w-200">
        <GridItem colSpan={8} className="flex flex-col gap-4 order-1">
          <UserInformation />
          <AccountInformation />

          <div className="flex flex-col gap-2 col-span-12">
            <button className="btn btn-primary">Deactivate User</button>
          </div>
        </GridItem>
      </Grid>
    </>
  );
}

function AccountInformation() {
  return (
    <>
      <p className="font-bold uppercase text-info">Account Information</p>
      <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Account Type</p>
          <RoleBadge role="patient" />
        </div>
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Account Status</p>
          <p>Deactivated</p>
        </div>
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Last Login</p>
          <p>Jan 24, 2025</p>
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Created At</p>
          <p>Jan 21, 2025</p>
        </div>
      </div>
    </>
  );
}

function UserInformation() {
  return (
    <>
      <p className="font-bold uppercase text-info">User Information</p>
      <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">User Picture</p>
          <div className="h-20 w-20 bg-gray-300 rounded-lg" />
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Full Name</p>
          <p>Jose Marie</p>
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Email Address</p>
          <p>emailnijose@email.com</p>
        </div>
      </div>
    </>
  );
}
