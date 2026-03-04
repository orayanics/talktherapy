import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import debounce from 'debounce'

import type { ContentOverviewProps } from '~/models/components'

import PageTitle from '~/components/Page/PageTitle'
import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import TablePagination from '~/components/Table/TablePagination'
import ContentTable from '~/modules/content/ContentTable'

import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'
import InputMultiselect from '~/components/Input/InputMultiselect'
import { useAuthGuard } from '~/hooks/useAuthGuard'

export default function ContentOverview({
  search,
  isLoading,
  isError,
  data,
}: ContentOverviewProps) {
  const { content, diagnoses } = data || {}
  const navigate = useNavigate({ from: '/content/' })
  const [searchInput, setSearchInput] = useState(search.search ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(search.search ?? '')
  const diagnosisSearch = search.diagnosis ?? []

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

  const { can } = useAuthGuard()
  const isAllowedAction = can('content:create')

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

              <InputMultiselect
                placeholder="Diagnosis"
                options={
                  diagnoses?.map((d) => ({
                    value: d.value,
                    label: d.label,
                  })) || []
                }
                value={diagnosisSearch}
                onChange={(values) => {
                  navigate({
                    search: (prev) => ({ ...prev, diagnosis: values, page: 1 }),
                  })
                }}
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

          <Table isLoading={isLoading} isError={isError} data={data} />

          <TablePagination
            page={content?.meta.page ?? 1}
            perPage={content?.meta.per_page ?? 10}
            total={content?.meta.total ?? 0}
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

function Table({
  isLoading,
  isError,
  data,
}: {
  isLoading: boolean
  isError: boolean
  data: ContentOverviewProps['data']
}) {
  if (isLoading) return <LoaderTable />
  if (isError) return <SkeletonError />
  if (!data || data.content.data.length === 0) return <SkeletonNull />

  return <ContentTable items={data.content.data} />
}
