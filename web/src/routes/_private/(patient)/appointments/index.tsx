import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import TablePagination from "~/components/Table/TablePagination";
import InputMultiselect from "~/components/Input/InputMultiselect";
import { normalizeSearchArray } from "~/utils/query";
import { useGetPublicDiagnoses } from "~/api/public";

export const Route = createFileRoute("/_private/(patient)/appointments/")({
  validateSearch: (search: Record<string, unknown>) => {
    const page = Number(search.page ?? 1);
    const perPage = Number(search.perPage ?? 10);
    const diagnosis = normalizeSearchArray(search.diagnosis) || undefined;
    const date =
      typeof search.date === "string" ? new Date(search.date) : undefined;

    return {
      ...(diagnosis ? { diagnosis } : {}),
      ...(page !== 1 ? { page } : {}),
      ...(perPage !== 10 ? { perPage } : {}),
      ...(date ? { date } : {}),
    };
  },
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(useGetPublicDiagnoses);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const searchProps = Route.useSearch();
  const publicDiagnoses = Route.useLoaderData();

  const navigate = useNavigate();

  return (
    <>
      <PageTitle
        heading="Appointments"
        subheading="View clinician schedules and book appointments."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-4">
          <InputMultiselect
            placeholder="Filter by Diagnosis"
            options={publicDiagnoses}
            value={searchProps.diagnosis ?? []}
            onChange={(diagnosis) =>
              navigate({
                to: ".",
                search: { ...searchProps, diagnosis },
              })
            }
          />
          <CalenderSingle date={selected} onSelect={setSelected} />
        </GridItem>

        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-8">
          <AppointmentList date={selected} search={searchProps} />
        </GridItem>
      </Grid>
    </>
  );
}

function AppointmentList({ date, search }: { date?: Date; search: any }) {
  const page = search.page ?? 1;
  const perPage = search.perPage ?? 10;
  const diagnosis = search.diagnosis ?? undefined;

  const {
    data = [],
    isLoading,
    error,
  } = useQuery(
    appointmentsQuery({
      date,
      page,
      perPage: perPage,
      diagnosis,
    }),
  );

  const navigate = useNavigate();

  if (isLoading) return <LoaderTable />;
  if (error) return <SkeletonError />;
  if (!data || !data.data || data.data.length === 0) return <SkeletonNull />;

  return (
    <>
      <AppointmentCard data={data.data} />

      <TablePagination
        page={page}
        perPage={perPage}
        total={data.meta.page_size}
        onPageChange={(page) =>
          navigate({
            to: ".",
            search: { ...search, page },
          })
        }
        onPerPageChange={(perPage) =>
          navigate({
            to: ".",
            search: { ...search, perPage },
          })
        }
      />
    </>
  );
}
