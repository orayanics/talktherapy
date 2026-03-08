import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import debounce from 'debounce'
import { format, parseISO } from 'date-fns'
import type { RecordListItem, RecordsListProps } from '~/models/table'

import CalenderSingleDropdown from '~/components/Calendar/CalenderSingleDropdown'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'
import TablePagination from '~/components/Table/TablePagination'
import Loader from '~/components/Loader/Loader'

export default function RecordsList(props: RecordsListProps) {
  const { search, isLoading, isError, data, selectedId, onSelect } = props
  const { data: records = [], meta } = data ?? {
    data: [],
    meta: { page: 1, per_page: 10, total: 0, last_page: 1 },
  }
  const navigate = useNavigate({ from: '/records/' })
  const [searchInput, setSearchInput] = useState(search.search ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(search.search ?? '')

  const selectedDate = search.date ? parseISO(search.date) : undefined

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

  const handleDateSelect = (date: Date | undefined) => {
    navigate({
      search: {
        ...search,
        date: date ? format(date, 'yyyy-MM-dd') : undefined,
        page: 1,
      },
    })
  }

  useEffect(() => {
    if (debouncedSearch === (search.search ?? '')) return
    navigate({
      search: { ...search, search: debouncedSearch || undefined, page: 1 },
    })
  }, [debouncedSearch])

  useEffect(() => {
    return () => updateDebouncedSearch.clear()
  }, [updateDebouncedSearch])

  return (
    <>
      <TableFilters
        search={searchInput}
        onSearchChange={handleSearchChange}
        onClearFilters={() => {
          setSearchInput('')
          navigate({ search: { page: 1 } })
        }}
      />

      <CalenderSingleDropdown
        date={selectedDate}
        onSelect={handleDateSelect}
        disablePast={false}
        placeholder="Filter by date"
      />

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <SkeletonError />
      ) : records.length === 0 ? (
        <SkeletonNull />
      ) : (
        <div className="flex flex-col gap-2">
          {records.map((record: RecordListItem) => (
            <button
              key={record.id}
              onClick={() => onSelect(record)}
              className={`w-full text-left p-4 border rounded-md transition-colors ${
                selectedId === record.id
                  ? 'border-primary bg-primary/10'
                  : 'hover:bg-base-200'
              }`}
            >
              <p className="font-bold">{record.clinician_name}</p>
              <p className="text-sm opacity-60">
                {format(parseISO(record.created_at), 'M/d/yyyy')}
              </p>
              <p className="text-xs uppercase font-semibold opacity-50 mt-1">
                {record.session_type}
              </p>
            </button>
          ))}
        </div>
      )}

      <TablePagination
        page={meta.page}
        perPage={meta.per_page}
        total={meta.total}
        onPageChange={(q: number) =>
          navigate({
            from: '/records/',
            to: '.',
            search: { ...search, page: q },
          })
        }
        onPerPageChange={(q: number) =>
          navigate({
            from: '/records/',
            to: '.',
            search: { ...search, perPage: q, page: 1 },
          })
        }
      />
    </>
  )
}

function TableFilters(props: any) {
  const { search, onSearchChange, onClearFilters } = props
  return (
    <div className="flex flex-col lg:flex-row gap-2 justify-between">
      <div className="flex flex-col lg:flex-row gap-2">
        <input
          type="text"
          placeholder="Search by clinician"
          className="input input-bordered w-full lg:w-42"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <button className="btn btn-primary" onClick={onClearFilters}>
          Clear Filters
        </button>
      </div>
    </div>
  )
}
