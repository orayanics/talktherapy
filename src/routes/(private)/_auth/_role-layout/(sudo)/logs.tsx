import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

import TableHeader from "~/components/Table/TableHeader";
import TableContent from "~/components/Table/TableContent";
import FilterDropdown from "~/components/Filters/FilterDropdown";
import FilterDrawer from "~/components/Filters/FilterDrawer";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(sudo)/logs",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Grid cols={12} gap={6}>
      <GridItem colSpan={12} className="flex flex-col gap-4">
        <Table />
      </GridItem>
    </Grid>
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
      <TableHeader heading="System Logs" />

      <FilterDrawer>
        <FilterDropdown
          placeholder="Select one"
          options={["One", "Two", "Three"]}
          value={select}
          onChange={(value) => {
            setSelect(value as string);
          }}
          type="select"
        />
        <FilterDropdown
          placeholder="Checkbox filters"
          options={["Red", "Blue", "Green"]}
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
