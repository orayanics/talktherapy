import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import debounce from 'debounce'

import type {
  ContentListTableFilters,
  ContentListTableProps,
} from '~/models/table'

import { bookmarkListQueryOptions } from '~/api/content'

import TablePagination from '~/components/Table/TablePagination'
import ContentTable from '~/modules/content/ContentTable'

import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'
import InputMultiselect from '~/components/Input/InputMultiselect'
import { useAuthGuard } from '~/hooks/useAuthGuard'

export default function ContentList({
  search,
  isLoading,
  isError,
  data,
}: ContentListTableProps) {
  const { content, diagnoses } = data || {}
  const navigate = useNavigate({ from: '/content/' })
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [searchInput, setSearchInput] = useState(search.search ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(search.search ?? '')
  const diagnosisSearch = search.diagnosis ?? []

  const bookmarkQuery = useQuery(
    bookmarkListQueryOptions({
      page: search.page,
      perPage: search.perPage,
      search: search.search,
      diagnosis: search.diagnosis,
    }),
  )

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
      search: (prev) => ({ ...prev, diagnosis: [], search: '', page: 1 }),
    })
  }

  const activeIsLoading = showBookmarks ? bookmarkQuery.isLoading : isLoading
  const activeIsError = showBookmarks ? bookmarkQuery.isError : isError

  const displayItems = showBookmarks
    ? (bookmarkQuery.data?.data ?? []).map((b) => b.content)
    : (content?.data ?? [])

  const bookmarkedIds = showBookmarks
    ? new Set((bookmarkQuery.data?.data ?? []).map((b) => b.content_id))
    : new Set<string>()

  const activeMeta = showBookmarks ? bookmarkQuery.data?.meta : content?.meta

  return (
    <>
      <TableFilters
        search={searchInput}
        diagnosis={diagnosisSearch}
        diagnosisOptions={diagnoses ?? []}
        showBookmarks={showBookmarks}
        onSearchChange={handleSearchChange}
        onDiagnosisChange={(diagnosis) =>
          navigate({
            search: (prev) => ({ ...prev, diagnosis, page: 1 }),
          })
        }
        onClearFilters={handleClear}
        onToggleBookmarks={() => setShowBookmarks((prev) => !prev)}
      />

      {activeIsLoading ? (
        <LoaderTable />
      ) : activeIsError ? (
        <SkeletonError />
      ) : displayItems.length ? (
        <ContentTable items={displayItems} bookmarkedIds={bookmarkedIds} />
      ) : (
        <SkeletonNull />
      )}

      <TablePagination
        page={activeMeta?.page ?? 1}
        perPage={activeMeta?.per_page ?? 10}
        total={activeMeta?.total ?? 0}
        onPageChange={(v: number) =>
          navigate({ search: (prev) => ({ ...prev, page: v }) })
        }
        onPerPageChange={(v: number) => {
          navigate({
            search: (prev) => ({ ...prev, perPage: v, page: 1 }),
          })
        }}
      />
    </>
  )
}

function TableFilters(props: ContentListTableFilters) {
  const {
    search,
    diagnosis,
    diagnosisOptions,
    showBookmarks,
    onSearchChange,
    onDiagnosisChange,
    onClearFilters,
    onToggleBookmarks,
  } = props
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

        <InputMultiselect
          placeholder="Diagnosis"
          options={diagnosisOptions.map((d) => ({
            value: d.value,
            label: d.label,
          }))}
          value={diagnosis}
          onChange={onDiagnosisChange}
        />

        <button className="btn btn-primary" onClick={onClearFilters}>
          Clear Filters
        </button>

        <button
          className={`btn ${
            showBookmarks ? 'btn-secondary' : 'btn-outline btn-secondary'
          }`}
          onClick={onToggleBookmarks}
        >
          {showBookmarks ? 'Show All' : 'Show Bookmarks'}
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
