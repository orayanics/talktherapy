import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import PageTitle from "~/components/Page/PageTitle";
import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

import { appointmentsQuery } from "~/api/scheduling";
import CalenderSingle from "~/components/Calendar/CalenderSingle";
import AppointmentCard from "~/modules/appointment/list/AppointmentCard";
import LoaderTable from "~/components/Loader/LoaderTable";
import SkeletonError from "~/components/Skeleton/SkeletonError";
import SkeletonNull from "~/components/Skeleton/SkeletonNull";

export const Route = createFileRoute("/_private/(patient)/appointments/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  return (
    <>
      <PageTitle
        heading="Appointments"
        subheading="View clinician schedules and book appointments."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-4">
          <CalenderSingle date={selected} onSelect={setSelected} />
        </GridItem>

        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-8">
          <AppointmentList date={selected} />
        </GridItem>
      </Grid>
    </>
  );
}

function AppointmentList({ date }: { date?: Date }) {
  const { data = [], isLoading, error } = useQuery(appointmentsQuery(date));

  if (isLoading) return <LoaderTable />;
  if (error) return <SkeletonError />;
  if (!data.length) return <SkeletonNull />;

  return <AppointmentCard data={data} />;
}
