import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import PageTitle from "~/components/Page/PageTitle";
import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

import { availabilityRulesQuery } from "~/api/scheduling";
import CalenderSingle from "~/components/Calendar/CalenderSingle";
import ScheduleCard from "~/modules/schedule/list/ScheduleCard";
import LoaderTable from "~/components/Loader/LoaderTable";
import SkeletonError from "~/components/Skeleton/SkeletonError";
import SkeletonNull from "~/components/Skeleton/SkeletonNull";

export default function ScheduleOverview() {
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  return (
    <>
      <PageTitle
        heading="Schedule Overview"
        subheading="View all of your schedules within the system."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-4">
          <CalenderSingle date={selected} onSelect={setSelected} />
          <Link to="/schedules/create" className="btn btn-primary">
            Add New Schedule
          </Link>
        </GridItem>

        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-8">
          <ScheduleList date={selected} />
        </GridItem>
      </Grid>
    </>
  );
}

function ScheduleList({ date }: { date?: Date }) {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery(availabilityRulesQuery(date));

  if (isLoading) return <LoaderTable />;
  if (error) return <SkeletonError />;
  if (!data.length) return <SkeletonNull />;

  return <ScheduleCard item={data} />;
}
