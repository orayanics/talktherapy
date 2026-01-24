import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

import TableHeader from "~/components/Table/TableHeader";
import TableContent from "~/components/Table/TableContent";
import FilterDropdown from "~/components/Input/InputSelect";
import FilterDrawer from "~/components/Filters/FilterDrawer";
import PageTitle from "~/components/Page/PageTitle";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(sudo)/logs",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <PageTitle
        heading="System Logs"
        subheading="View all activities within the system"
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          <Table />
        </GridItem>
      </Grid>
    </>
  );
}

const SAMPLE_LOGS = [
  {
    id: "1",
    timestamp: new Date().toLocaleDateString("en-US"),
    userId: "user1",
    action: "Login",
    details: "User logged in successfully",
  },
  {
    id: "2",
    timestamp: new Date().toLocaleDateString("en-US"),
    userId: "user2",
    action: "File Upload",
    details: "Uploaded file report.pdf",
  },
  {
    id: "3",
    timestamp: new Date().toLocaleDateString("en-US"),
    userId: "user3",
    action: "Password Change",
    details: "Changed password successfully",
  },
];

function Table() {
  const [select, setSelect] = useState<string>("");
  const [checkboxes, setCheckboxes] = useState<string[]>([]);
  return (
    <>
      <FilterDrawer>
        <FilterDropdown
          placeholder="Select one"
          options={[
            { value: "superadmin", label: "Super Admin" },
            { value: "admin", label: "Admin" },
            { value: "patient", label: "Patient" },
            { value: "clinician", label: "Clinician" },
          ]}
          value={select}
          onChange={(value) => {
            setSelect(value as string);
          }}
          type="select"
        />
        <FilterDropdown
          placeholder="Checkbox filters"
          options={[
            { value: "red", label: "Color Red" },
            { value: "blue", label: "Color Blue" },
            { value: "yellow", label: "Color Yellow" },
            { value: "green", label: "Color Green" },
          ]}
          value={checkboxes}
          onChange={(value) => {
            setCheckboxes(value as string[]);
          }}
          type="multiselect"
        />
      </FilterDrawer>

      <TableContent
        columns={[
          { header: "Timestamp", accessor: "timestamp" },
          { header: "User ID", accessor: "userId" },
          { header: "Action", accessor: "action" },
          { header: "Details", accessor: "details" },
        ]}
        data={SAMPLE_LOGS}
      />
    </>
  );
}
