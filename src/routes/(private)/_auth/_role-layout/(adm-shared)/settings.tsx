import { createFileRoute } from "@tanstack/react-router";

import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(adm-shared)/settings",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Grid cols={12} gap={6}>
      <GridItem colSpan={12} className="flex flex-col gap-4 md:col-span-4">
        <h1 className="heading-1">Profile</h1>
        <div className="bg-gray-200 h-[400px] rounded-lg" />

        <div>
          <p className="text-xl font-bold">Jose Marie</p>
          <p>josemarie@email.com</p>
        </div>

        <button className="btn-primary">Update Profile</button>
        <button className="btn-primary">Change Password</button>
      </GridItem>
    </Grid>
  );
}
