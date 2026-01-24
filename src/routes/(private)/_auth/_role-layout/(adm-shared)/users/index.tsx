import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(adm-shared)/users/",
)({
  component: RouteComponent,
});

import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

import TableContent from "~/components/Table/TableContent";
import TablePagination from "~/components/Table/TablePagination";

import RoleBadge from "~/components/Badge/RoleBadge";
import AccountStatusBadge from "~/components/Badge/AccountStatusBadge";
import PageTitle from "~/components/Page/PageTitle";
import UserAddAdmin from "~/modules/users/UserAddAdmin";

import InputDropdown from "~/components/Input/InputDropdown";
import InputMultiselect from "~/components/Input/InputMultiselect";

import LoaderTable from "~/components/Loader/LoaderTable";
import UserAddClinician from "~/modules/users/UserAddClinician";

// TODO: Replace with real data from API
// ===============================
// Return all users if sudo
// Return patient and clinician users if admin
// ===============================

const SAMPLE_USERS = [
  {
    id: "1",
    username: "johndoe",
    email: "doe@example.com",
    userType: "patient",
    information: {
      firstName: "John",
      lastName: "Doe",
      profileUrl: "",
    },
    accountStatus: "active",
    createdAt: new Date("2024-01-05").toDateString(),
    updatedAt: new Date("2024-06-10").toDateString(),
    lastLogin: new Date("2025-01-15").toDateString(),
  },
  {
    id: "2",
    username: "janesmith",
    email: "jane.smith@example.com",
    userType: "clinician",
    information: {
      firstName: "Jane",
      lastName: "Smith",
      profileUrl: "",
    },
    accountStatus: "deactivated",
    createdAt: new Date("2023-11-20").toDateString(),
    updatedAt: new Date("2024-12-02").toDateString(),
    lastLogin: new Date("2025-01-18").toDateString(),
  },
  {
    id: "3",
    username: "michaelb",
    email: "michael.brown@example.com",
    userType: "admin",
    information: {
      firstName: "Michael",
      lastName: "Brown",
      profileUrl: "",
    },
    accountStatus: "pending",
    createdAt: new Date("2022-09-14").toDateString(),
    updatedAt: new Date("2024-10-01").toDateString(),
    lastLogin: new Date("2025-01-10").toDateString(),
  },
  {
    id: "4",
    username: "emilyw",
    email: "emily.wilson@example.com",
    userType: "patient",
    information: {
      firstName: "Emily",
      lastName: "Wilson",
      profileUrl: "",
    },
    accountStatus: "inactive",
    createdAt: new Date("2024-03-01").toDateString(),
    updatedAt: new Date("2024-08-12").toDateString(),
    lastLogin: new Date("2024-09-05").toDateString(),
  },
  {
    id: "5",
    username: "danielk",
    email: "daniel.kim@example.com",
    userType: "sudo",
    information: {
      firstName: "Daniel",
      lastName: "Kim",
      profileUrl: "",
    },
    accountStatus: "suspended",
    createdAt: new Date("2023-05-18").toDateString(),
    updatedAt: new Date("2024-07-22").toDateString(),
    lastLogin: new Date("2024-07-30").toDateString(),
  },
  {
    id: "6",
    username: "sophiag",
    email: "sophia.garcia@example.com",
    userType: "patient",
    information: {
      firstName: "Sophia",
      lastName: "Garcia",
      profileUrl: "",
    },
    accountStatus: "active",
    createdAt: new Date("2024-02-10").toDateString(),
    updatedAt: new Date("2024-11-15").toDateString(),
    lastLogin: new Date("2025-01-19").toDateString(),
  },
  {
    id: "7",
    username: "liamj",
    email: "liam.johnson@example.com",
    userType: "patient",
    information: {
      firstName: "Liam",
      lastName: "Johnson",
      profileUrl: "",
    },
    accountStatus: "active",
    createdAt: new Date("2023-08-09").toDateString(),
    updatedAt: new Date("2024-09-03").toDateString(),
    lastLogin: new Date("2025-01-12").toDateString(),
  },
  {
    id: "8",
    username: "oliviam",
    email: "olivia.martinez@example.com",
    userType: "doctor",
    information: {
      firstName: "Olivia",
      lastName: "Martinez",
      profileUrl: "",
    },
    accountStatus: "active",
    createdAt: new Date("2022-12-01").toDateString(),
    updatedAt: new Date("2024-10-18").toDateString(),
    lastLogin: new Date("2025-01-17").toDateString(),
  },
  {
    id: "9",
    username: "noahd",
    email: "noah.davis@example.com",
    userType: "patient",
    information: {
      firstName: "Noah",
      lastName: "Davis",
      profileUrl: "",
    },
    accountStatus: "inactive",
    createdAt: new Date("2024-04-22").toDateString(),
    updatedAt: new Date("2024-09-11").toDateString(),
    lastLogin: new Date("2024-09-20").toDateString(),
  },
  {
    id: "10",
    username: "avaw",
    email: "ava.williams@example.com",
    userType: "admin",
    information: {
      firstName: "Ava",
      lastName: "Williams",
      profileUrl: "",
    },
    accountStatus: "active",
    createdAt: new Date("2023-01-30").toDateString(),
    updatedAt: new Date("2024-12-28").toDateString(),
    lastLogin: new Date("2025-01-20").toDateString(),
  },
  {
    id: "11",
    username: "ethanh",
    email: "ethan.harris@example.com",
    userType: "doctor",
    information: {
      firstName: "Ethan",
      lastName: "Harris",
      profileUrl: "",
    },
    accountStatus: "active",
    createdAt: new Date("2022-06-17").toDateString(),
    updatedAt: new Date("2024-11-05").toDateString(),
    lastLogin: new Date("2025-01-16").toDateString(),
  },
  {
    id: "12",
    username: "isabellac",
    email: "isabella.clark@example.com",
    userType: "patient",
    information: {
      firstName: "Isabella",
      lastName: "Clark",
      profileUrl: "",
    },
    accountStatus: "active",
    createdAt: new Date("2024-05-08").toDateString(),
    updatedAt: new Date("2024-12-01").toDateString(),
    lastLogin: new Date("2025-01-14").toDateString(),
  },
];

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const isLoading = false;

  return (
    <>
      <PageTitle heading="Users" subheading="View all users" />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          <Table
            data={SAMPLE_USERS}
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

interface TableProps {
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  isLoading?: boolean;
  data: typeof SAMPLE_USERS;
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
  const isAdmin = true; // TODO: Replace with real auth check

  return (
    <>
      <div className="flex flex-col md:flex-row gap-2 justify-between">
        <div className="flex flex-col md:flex-row gap-2">
          <InputMultiselect
            placeholder="Account Status"
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "pending", label: "Pending" },
              { value: "suspended", label: "Suspended" },
            ]}
            value={["yup"]}
            onChange={() => {}}
            className={"w-full md:w-42"}
          />

          <InputMultiselect
            placeholder="User Type"
            options={[
              { value: "sudo", label: "Super Admin" },
              { value: "admin", label: "Admin" },
              { value: "patient", label: "Patient" },
              { value: "clinician", label: "Clinician" },
            ]}
            value={["yup"]}
            onChange={() => {}}
            className={"w-full md:w-42"}
          />
        </div>

        <InputDropdown
          label="Add User"
          className="flex flex-col gap-2 md:w-auto w-full"
          btnClassName="md:w-auto w-full btn-primary"
        >
          <button
            className="btn"
            onClick={() => {
              const modal = document.getElementById(
                "add-clinician-modal",
              ) as HTMLDialogElement | null;
              modal?.showModal();
            }}
          >
            Clinician
          </button>
          {!isAdmin && (
            <button
              className="btn"
              onClick={() => {
                const modal = document.getElementById(
                  "add-admin-modal",
                ) as HTMLDialogElement | null;
                modal?.showModal();
              }}
            >
              Admin
            </button>
          )}
        </InputDropdown>

        <UserAddClinician id={"add-clinician-modal"} />
        {!isAdmin && <UserAddAdmin id={"add-admin-modal"} />}
      </div>

      {isLoading ? (
        <LoaderTable className="h-120 max-h-120 " />
      ) : (
        <TableContent
          columns={[
            { header: "Account Status", accessor: "accountStatus" },
            {
              header: "Name",
              accessor: "information",
              render: (value, row) => (
                <Link
                  to="/users/$userId"
                  params={{ userId: row.userType }}
                  className="link link-hover hover:text-info"
                >
                  {(value as { firstName: string; lastName: string }).firstName}{" "}
                  {(value as { firstName: string; lastName: string }).lastName}
                </Link>
              ),
            },
            { header: "Email", accessor: "email" },
            { header: "Username", accessor: "username" },
            { header: "User Type", accessor: "userType" },
            { header: "Created At", accessor: "createdAt" },
            { header: "Last Login", accessor: "lastLogin" },
            {
              header: "Actions",
              accessor: "id",
              render: (_value, row) => (
                <InputDropdown
                  label="Actions"
                  className="flex flex-col gap-2"
                  btnClassName="btn-primary"
                  position="dropdown-center dropdown-left"
                >
                  <Link
                    to={"/users/$userId/edit"}
                    params={{ userId: row.id as string }}
                    className="btn btn-soft btn-info"
                  >
                    Edit
                  </Link>
                  <Link
                    // TODO: Add deactivate user functionality
                    to={"/users/$userId"}
                    params={{ userId: row.id as string }}
                    className="btn btn-soft btn-error"
                  >
                    Deactivate
                  </Link>
                </InputDropdown>
              ),
            },
          ]}
          data={SAMPLE_USERS}
          renderers={{
            userType: (value) => <RoleBadge role={value} />,
            accountStatus: (value) => <AccountStatusBadge status={value} />,
          }}
          rowsPerPage={10}
        />
      )}

      <TablePagination
        page={page}
        perPage={perPage}
        total={SAMPLE_USERS.length}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
      />
    </>
  );
}
