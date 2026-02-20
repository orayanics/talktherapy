import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";
import PageTitle from "~/components/Page/PageTitle";
import LoaderTable from "~/components/Loader/LoaderTable";
import TableContent from "~/components/Table/TableContent";
import TablePagination from "~/components/Table/TablePagination";

export const Route = createFileRoute("/_private/(clinician)/patients/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const isLoading = false;

  return (
    <>
      <PageTitle
        heading="Patients Overview"
        subheading="View all your patients."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          <Table
            data={PATIENT_LIST}
            page={page}
            perPage={perPage}
            isLoading={isLoading}
            onPageChange={setPage}
            onPerPageChange={(val) => {
              setPerPage(val);
              setPage(1);
            }}
          />
        </GridItem>
      </Grid>
    </>
  );
}

const PATIENT_LIST = [
  {
    id: 1,
    email: "meiyok.doe@example.com",
    diagnosis: "Expressive Language Disorder",
    information: {
      firstName: "Meiyok",
      lastName: "Doe",
      profileUrl: "",
    },
  },
  {
    id: 2,
    email: "alex.smith@example.com",
    diagnosis: "Articulation Disorder",
    information: {
      firstName: "Alex",
      lastName: "Smith",
      profileUrl: "",
    },
  },
  {
    id: 3,
    email: "jordan.lee@example.com",
    diagnosis: "Mixed Receptive-Expressive Language Disorder",
    information: {
      firstName: "Jordan",
      lastName: "Lee",
      profileUrl: "",
    },
  },
  {
    id: 4,
    email: "priya.patel@example.com",
    diagnosis: "Childhood Apraxia of Speech",
    information: {
      firstName: "Priya",
      lastName: "Patel",
      profileUrl: "",
    },
  },
  {
    id: 5,
    email: "carlos.mendez@example.com",
    diagnosis: "Fluency Disorder (Stuttering)",
    information: {
      firstName: "Carlos",
      lastName: "Mendez",
      profileUrl: "",
    },
  },
  {
    id: 6,
    email: "fatima.hassan@example.com",
    diagnosis: "Social (Pragmatic) Communication Disorder",
    information: {
      firstName: "Fatima",
      lastName: "Hassan",
      profileUrl: "",
    },
  },
];

interface TableProps {
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  isLoading?: boolean;
  data: typeof PATIENT_LIST;
  page: number;
  perPage: number;
}

function Table(props: TableProps) {
  const {
    isLoading = false,
    page,
    perPage,
    onPageChange,
    onPerPageChange,
  } = props;

  return (
    <>
      <div className="flex flex-col md:flex-row gap-2 justify-between">
        {/* search input */}
      </div>

      {isLoading ? (
        <LoaderTable className="h-120 max-h-120 " />
      ) : (
        <TableContent
          columns={[
            {
              header: "Name",
              accessor: "information",
              render: (value, row) => (
                <Link
                  to="/patients/$patientId"
                  params={{ patientId: row.id.toString() }}
                  className="link link-hover hover:text-primary"
                >
                  {(value as { firstName: string; lastName: string }).firstName}{" "}
                  {(value as { firstName: string; lastName: string }).lastName}
                </Link>
              ),
            },
            { header: "Email", accessor: "email" },
            { header: "Diagnosis", accessor: "diagnosis" },
          ]}
          data={PATIENT_LIST}
          rowsPerPage={10}
        />
      )}

      <TablePagination
        page={page}
        perPage={perPage}
        total={PATIENT_LIST.length}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
      />
    </>
  );
}
