import { createFileRoute } from "@tanstack/react-router";
import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

import { FaEnvelope, FaCalendar } from "react-icons/fa";
export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(adm-shared)/users/$id",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const userId = params.id;
  return (
    <Grid cols={12} gap={6}>
      <h1 className="font-bold text-2xl col-span-12">User Overview</h1>
      <GridItem colSpan={12} className="md:col-span-6 order-1">
        <UserInformation />
      </GridItem>

      <GridItem colSpan={12} className="md:col-span-6 order-3 md:order-2">
        <div>
          <p className="text-xl font-bold">Jose Marie</p>
          <p>josemarie@email.com</p>
        </div>
      </GridItem>

      <GridItem colSpan={12} className="md:col-span-6 order-2 md:order-3">
        <div className="flex flex-col gap-2 col-span-12">
          <button className="btn btn-primary">Deactivate User</button>
        </div>
      </GridItem>
    </Grid>
  );
}

function UserInformation() {
  return (
    <Grid cols={12} gap={6}>
      <GridItem colSpan={12} className="grid grid-cols-12 gap-4">
        <div className="col-span-12 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="h-32 w-full bg-primary relative" />

          {/* Profile image */}
          <div className="relative px-4">
            <div className="absolute -top-12 left-4">
              <div className="h-24 w-24 rounded-full bg-rose-200 border-4 border-white" />
            </div>
          </div>

          {/* Profile content */}
          <div className="flex flex-col gap-1 pt-14 px-4 pb-4">
            <div className="flex flex-row gap-2 items-center justify-start">
              <h2 className="text-xl font-bold text-gray-900">Jose Marie</h2>
              <span className="badge badge-outline badge-info font-normal">
                Clinician
              </span>
            </div>

            <div className="flex flex-row justify-between gap-2">
              <p className="text-gray-500 inline-flex items-center gap-2">
                <FaEnvelope />
                nicole.oraya@ust.edu.ph
              </p>
            </div>

            <div className="flex flex-col gap-2 justify-start md:justify-between">
              <p className="text-gray-500 inline-flex items-center gap-2 text-sm">
                <FaCalendar /> Logged on January 12, 2025
              </p>

              <div className="flex flex-row gap-2 items-center">
                <div className="inline-grid *:[grid-area:1/1]">
                  <div className="status status-error animate-ping"></div>
                  <div className="status status-error"></div>
                </div>
                <p className="text-rose-500">Deactivated</p>
              </div>
            </div>
          </div>
        </div>
      </GridItem>
    </Grid>
  );
}
