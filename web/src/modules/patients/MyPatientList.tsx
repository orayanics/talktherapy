import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import debounce from 'debounce'

import type {
  MyPatientItem,
  MyPatientsListTableFilters,
  MyPatientsTableProps,
} from '~/models/table'

import TablePagination from '~/components/Table/TablePagination'
import TableContent from '~/components/Table/TableContent'

import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'
import { useAuthGuard } from '~/hooks/useAuthGuard'
import { formatToLocalDateTime } from '~/utils/date'

export default function MyPatientList({
  search,
  isLoading,
  isError,
  data,
}: MyPatientsTableProps) {
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

  return (
    <>
      <TableFilters
        search={searchInput}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClear}
      />

      {isLoading ? (
        <LoaderTable />
      ) : isError ? (
        <SkeletonError />
      ) : tableData.length ? (
        <Table data={tableData} />
      ) : (
        <SkeletonNull />
      )}

      <TablePagination
        page={page}
        perPage={perPage}
        total={meta.total}
        onPageChange={(q: number) =>
          navigate({ search: (prev) => ({ ...prev, page: q }) })
        }
        onPerPageChange={(q: number) => {
          navigate({
            search: (prev) => ({ ...prev, perPage: q, page: 1 }),
          })
        }}
      />
    </>
  )
}

function TableFilters(props: MyPatientsListTableFilters) {
  const { search, onSearchChange, onClearFilters } = props
  const { can } = useAuthGuard()
  const isAllowedAction = can('content:create')

  return (
    <div className="flex flex-col lg:flex-row justify-between gap-2">
      <div className="flex flex-col lg:flex-row gap-2">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input"
        />

        <button className="btn btn-primary" onClick={onClearFilters}>
          Clear Filters
        </button>
      </div>

      {isAllowedAction && (
        <Link to="/content/create" className="btn btn-primary">
          Add Content
        </Link>
      )}
    </div>
  )
}

function Table({ data }: { data: Array<MyPatientItem> }) {
  return (
    <TableContent
      columns={[
        { header: 'Id', accessor: 'id', className: 'hidden' },
        {
          header: 'Name',
          accessor: 'name',
          render: (value: string, row: MyPatientItem) => (
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
          render: (value: string, row: MyPatientItem) => (
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
          render: (value: string | null) =>
            value ? formatToLocalDateTime(value) : null,
        },
      ]}
      data={data}
    />
  )
}
