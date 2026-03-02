import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import type { LogsTableProps } from '~/models/components'
import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'

// import TableHeader from '~/components/Table/TableHeader'
import TableContent from '~/components/Table/TableContent'
// import FilterDropdown from '~/components/Input/InputSelect'
// import FilterDrawer from '~/components/Filters/FilterDrawer'
import PageTitle from '~/components/Page/PageTitle'
// import InputMultiselect from '~/components/Input/InputMultiselect'
import InputDropdown from '~/components/Input/InputDropdown'
import LoaderTable from '~/components/Loader/LoaderTable'
import TablePagination from '~/components/Table/TablePagination'

export const Route = createFileRoute('/_private/(sudo)/logs')({
  component: RouteComponent,
})

function RouteComponent() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const isLoading = false

  return (
    <>
      <PageTitle
        heading="System Logs"
        subheading="View all activities within the system"
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          <Table
            data={SAMPLE_LOGS}
            page={page}
            perPage={perPage}
            isLoading={isLoading}
            onPageChange={setPage}
            onPerPageChange={(val) => {
              setPerPage(val)
              setPage(1)
            }}
          />
        </GridItem>
      </Grid>
    </>
  )
}

const SAMPLE_LOGS = [
  {
    id: '1',
    timestamp: '10/01/2024 10:00 AM',
    userId: 'user1',
    action: 'Login',
    details: 'User logged in successfully',
  },
  {
    id: '2',
    timestamp: '10/01/2024 10:05 AM',
    userId: 'user2',
    action: 'File Upload',
    details: 'Uploaded file report.pdf',
  },
  {
    id: '3',
    timestamp: '10/01/2024 10:05 AM',
    userId: 'user3',
    action: 'Password Change',
    details: 'Changed password successfully',
  },
]

function Table(props: LogsTableProps) {
  const { data, isLoading, page, perPage, onPageChange, onPerPageChange } =
    props
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-2">
        <InputDropdown
          label="Filter By Date"
          className="flex flex-row gap-2 lg:w-auto w-full"
          btnClassName="lg:w-auto w-full btn-primary"
          position="dropdown-start"
        >
          <label className="input w-full">
            <span className="label">Start Date</span>
            <input type="date" id="startDate" name="startDate" />
          </label>

          <label className="input w-full">
            <span className="label">End Date</span>
            <input type="date" id="endDate" name="endDate" />
          </label>
        </InputDropdown>
      </div>

      {isLoading ? (
        <LoaderTable />
      ) : (
        <TableContent
          columns={[
            { header: 'Timestamp', accessor: 'timestamp' },
            { header: 'User ID', accessor: 'userId' },
            { header: 'Action', accessor: 'action' },
            { header: 'Details', accessor: 'details' },
          ]}
          data={data}
        />
      )}

      <TablePagination
        page={page}
        perPage={perPage}
        total={SAMPLE_LOGS.length}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
      />
    </>
  )
}
