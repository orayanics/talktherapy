import { useState, useEffect } from "react";
import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

import TableHeader from "~/components/Table/TableHeader";
import TableContent from "~/components/Table/TableContent";
import TablePagination from "~/components/Table/TablePagination";
import TableAction from "~/components/Table/TableAction";

import FilterDropdown from "~/components/Filters/FilterDropdown";
import FilterDrawer from "~/components/Filters/FilterDrawer";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(adm-shared)/users/"
)({
  component: RouteComponent,
});

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
    userType: "doctor",
    information: {
      firstName: "Jane",
      lastName: "Smith",
      profileUrl: "",
    },
    accountStatus: "active",
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
    accountStatus: "active",
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
    userType: "doctor",
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
    updatedAt: new Date("2024-11-15"),
    lastLogin: new Date("2025-01-19"),
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
    createdAt: new Date("2023-08-09"),
    updatedAt: new Date("2024-09-03"),
    lastLogin: new Date("2025-01-12"),
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
    createdAt: new Date("2022-12-01"),
    updatedAt: new Date("2024-10-18"),
    lastLogin: new Date("2025-01-17"),
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
    createdAt: new Date("2024-04-22"),
    updatedAt: new Date("2024-09-11"),
    lastLogin: new Date("2024-09-20"),
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
    createdAt: new Date("2023-01-30"),
    updatedAt: new Date("2024-12-28"),
    lastLogin: new Date("2025-01-20"),
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
    createdAt: new Date("2022-06-17"),
    updatedAt: new Date("2024-11-05"),
    lastLogin: new Date("2025-01-16"),
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
    createdAt: new Date("2024-05-08"),
    updatedAt: new Date("2024-12-01"),
    lastLogin: new Date("2025-01-14"),
  },
];

function RouteComponent() {
  return (
    <Grid cols={12} gap={6}>
      <GridItem colSpan={12} className="flex flex-col gap-4">
        <Table />
      </GridItem>
    </Grid>
  );
}

function simulateApiCall({
  page,
  perPage = 5,
  filters,
}: {
  page: number;
  perPage: number;
  filters: string[];
}) {
  return new Promise<{ data: typeof SAMPLE_USERS; total: number }>(
    (resolve) => {
      setTimeout(() => {
        let filtered = SAMPLE_USERS;
        if (filters.length > 0) {
          filtered = filtered.filter((u) => filters.includes(u.userType));
        }
        const total = filtered.length;
        const start = (page - 1) * perPage;
        const end = start + perPage;
        resolve({ data: filtered.slice(start, end), total });
      }, 400);
    }
  );
}

function Table() {
  const search = useSearch({
    from: "/(private)/_auth/_role-layout/(adm-shared)/users",
  });
  const navigate = useNavigate();
  const [checkboxes, setCheckboxes] = useState<string[]>(search.roles ?? []);
  const [page, setPage] = useState(search.p ?? 1);
  const [perPage, setPerPage] = useState(search.per ?? 5);

  const { data: apiData, isLoading } = useQuery({
    queryKey: ["users", { page, perPage, filters: checkboxes }],
    queryFn: () => simulateApiCall({ page, perPage, filters: checkboxes }),
  });

  // Sync state to URL
  useEffect(() => {
    navigate({
      search: {
        p: page,
        per: perPage,
        roles: checkboxes.length > 0 ? checkboxes : undefined,
      },
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, checkboxes]);

  // Sync state from URL (on mount or URL change)
  useEffect(() => {
    setPage(search.p || 1);
    setPerPage(search.per || 5);
    setCheckboxes(search.roles ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.p, search.per, search.roles]);

  return (
    <>
      <TableHeader heading="User Management" />

      <FilterDrawer>
        <FilterDropdown
          placeholder="User Role"
          options={["superadmin", "admin", "patient", "clinician"]}
          value={checkboxes}
          onChange={(value) => {
            setCheckboxes(value as string[]);
            setPage(1); // reset to first page on filter change
          }}
          type="multiselect"
        />
      </FilterDrawer>

      {isLoading || !apiData ? (
        <div className="py-10 text-center text-gray-500">Loading...</div>
      ) : (
        <TableContent
          columns={[
            { header: "Username", accessor: "username" },
            { header: "Email", accessor: "email" },
            { header: "User Type", accessor: "userType" },
            {
              header: "Name",
              accessor: "information",
              render: (value) =>
                `${(value as { firstName: string; lastName: string }).firstName} ${(value as { firstName: string; lastName: string }).lastName}`,
            },
            { header: "Account Status", accessor: "accountStatus" },
            { header: "Created At", accessor: "createdAt" },
            { header: "Last Login", accessor: "lastLogin" },
          ]}
          data={apiData.data}
          rowsPerPage={perPage}
        />
      )}

      <TablePagination
        page={page}
        perPage={perPage}
        total={apiData?.total || 0}
        onPageChange={setPage}
        onPerPageChange={(val) => {
          setPerPage(val);
          setPage(1);
        }}
      />
    </>
  );
}
