import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import debounce from 'debounce'

import type {
  ClinicianPatientOverviewItem,
  PatientClinicianOverviewProps,
} from '~/models/components'

import PageTitle from '~/components/Page/PageTitle'
import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import TablePagination from '~/components/Table/TablePagination'
import TableContent from '~/components/Table/TableContent'

import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'
import { useAuthGuard } from '~/hooks/useAuthGuard'
import { formatToLocalDateTime } from '~/utils/date'

export default function PatientClinicianOverview({
  search,
  isLoading,
  isError,
  data,
}: PatientClinicianOverviewProps) {
  const { data: tableData = [], meta } = data ?? {
    data: [],
    meta: { page: 1, per_page: 10, total: 0 },
  }

  const navigate = useNavigate({ from: '/patients/' })
  const [searchInput, setSearchInput] = useState(search.search ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(search.search ?? '')
  const page = search.page ?? 1
  const perPage = search.perPage ?? 10

  const updateDebouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value)
      }, 200),
    [],
  )

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    updateDebouncedSearch(value)
  }

  useEffect(() => {
    if (debouncedSearch === search.search) return
    navigate({
      search: (prev) => ({ ...prev, search: debouncedSearch, page: 1 }),
    })
  }, [debouncedSearch])

  useEffect(() => {
    return () => updateDebouncedSearch.clear()
  }, [updateDebouncedSearch])

  const handleClear = () => {
    navigate({
      search: (prev) => ({ ...prev, search: '', page: 1 }),
    })
  }

  const { can } = useAuthGuard()
  const isAllowedAction = can('content:create')

  if (isLoading) return <LoaderTable />
  if (isError) return <SkeletonError />

  return (
    <>
      <PageTitle
        heading="Content Media"
        subheading="View all available speech therapy exercises in the system."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row justify-between gap-2">
            <div className="flex flex-col lg:flex-row gap-2">
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="input"
              />

              <button className="btn btn-primary" onClick={handleClear}>
                Clear Filters
              </button>
            </div>

            {isAllowedAction && (
              <Link to="/content/create" className="btn btn-primary">
                Add Content
              </Link>
            )}
          </div>

          {tableData.length > 0 ? <Table data={tableData} /> : <SkeletonNull />}

          <TablePagination
            page={page}
            perPage={perPage}
            total={meta.total}
            onPageChange={(v) =>
              navigate({ search: (prev) => ({ ...prev, page: v }) })
            }
            onPerPageChange={(v) => {
              navigate({
                search: (prev) => ({ ...prev, perPage: v, page: 1 }),
              })
            }}
          />
        </GridItem>
      </Grid>
    </>
  )
}

function Table({ data }: { data: Array<ClinicianPatientOverviewItem> }) {
  return (
    <TableContent
      columns={[
        { header: 'Id', accessor: 'id', className: 'hidden' },
        {
          header: 'Name',
          accessor: 'name',
          render: (value, row) => (
            <Link
              to={'/patients/$patientId'}
              search={{
                page: 1,
                perPage: 10,
              }}
              params={{ patientId: row.id }}
              className="link link-hover hover:text-primary"
            >
              {value}
            </Link>
          ),
        },
        {
          header: 'Email',
          accessor: 'email',
          render: (value, row) => (
            <Link
              to="/patients/$patientId"
              search={{
                page: 1,
                perPage: 10,
              }}
              params={{ patientId: row.id }}
              className="link link-hover hover:text-primary"
            >
              {value}
            </Link>
          ),
        },
        {
          header: 'Completed At',
          accessor: 'first_completed_at',
          render: (value) => formatToLocalDateTime(value),
        },
      ]}
      data={data}
    />
  )
}
