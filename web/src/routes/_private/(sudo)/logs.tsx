import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Download, RefreshCcw } from 'lucide-react'

import { logsQueryOptions } from '~/api/logs'
import { useLogsExport } from '~/modules/logs/useLogsExport'
import LogsTable from '~/modules/logs/LogsTable'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import PageTitle from '~/components/Page/PageTitle'
import InputDropdown from '~/components/Input/InputDropdown'
import { useAlert } from '~/context/AlertContext'

export const Route = createFileRoute('/_private/(sudo)/logs')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: typeof search.page === 'number' ? search.page : 1,
      perPage: typeof search.perPage === 'number' ? search.perPage : 10,
      search: typeof search.search === 'string' ? search.search : undefined,
      action: typeof search.action === 'string' ? search.action : undefined,
      date_from:
        typeof search.date_from === 'string' ? search.date_from : undefined,
      date_to: typeof search.date_to === 'string' ? search.date_to : undefined,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/logs' })

  const { data, isLoading, isError } = useQuery(
    logsQueryOptions({
      page: search.page,
      perPage: search.perPage,
      search: search.search,
      action: search.action,
      date_from: search.date_from,
      date_to: search.date_to,
    }),
  )

  const logs = data?.data ?? []
  const meta = data?.meta ?? { total: 0, page: 1, per_page: 10 }

  // Local state for the export date (separate from browsing filters)
  const [exportDate, setExportDate] = useState<string>('')

  const { showAlert } = useAlert()

  const {
    status: exportStatus,
    error: exportError,
    startExport,
    reset: resetExport,
  } = useLogsExport()

  useEffect(() => {
    if (exportStatus === 'done') {
      showAlert('Logs export downloaded successfully.', 'success')
      resetExport()
    } else if (exportStatus === 'error' && exportError) {
      showAlert(exportError, 'error')
      resetExport()
    }
  }, [exportStatus])

  const isExporting =
    exportStatus === 'connecting' || exportStatus === 'exporting'

  return (
    <>
      <PageTitle
        heading="System Logs"
        subheading="View all activities within the system"
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-2 justify-between">
            <div className="flex flex-col lg:flex-row gap-2">
              <input
                type="text"
                placeholder="Search logs..."
                className="input input-bordered w-full lg:w-64"
                value={search.search ?? ''}
                onChange={(e) =>
                  navigate({
                    search: {
                      ...search,
                      search: e.target.value || undefined,
                      page: 1,
                    },
                  })
                }
              />

              <InputDropdown
                label="Filter By Date"
                className="flex flex-row gap-2 lg:w-auto w-full"
                btnClassName="lg:w-auto w-full btn-primary"
                position="dropdown-start"
              >
                <label className="input w-full">
                  <span className="label">Start Date</span>
                  <input
                    type="date"
                    value={search.date_from ?? ''}
                    onChange={(e) =>
                      navigate({
                        search: {
                          ...search,
                          date_from: e.target.value || undefined,
                          page: 1,
                        },
                      })
                    }
                  />
                </label>
                <label className="input w-full">
                  <span className="label">End Date</span>
                  <input
                    type="date"
                    value={search.date_to ?? ''}
                    onChange={(e) =>
                      navigate({
                        search: {
                          ...search,
                          date_to: e.target.value || undefined,
                          page: 1,
                        },
                      })
                    }
                  />
                </label>
              </InputDropdown>

              <button
                className="btn btn-ghost"
                onClick={() =>
                  navigate({
                    search: {
                      page: 1,
                      perPage: search.perPage,
                      search: undefined,
                      action: undefined,
                      date_from: undefined,
                      date_to: undefined,
                    },
                  })
                }
              >
                Clear Filters
              </button>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2">
              <label className="input input-bordered">
                <span className="label text-xs whitespace-nowrap">
                  Export date
                </span>
                <input
                  type="date"
                  value={exportDate}
                  onChange={(e) => setExportDate(e.target.value)}
                />
              </label>

              <button
                className="btn btn-secondary gap-2 whitespace-nowrap"
                onClick={() => startExport(exportDate || undefined)}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <RefreshCcw className="animate-spin" />
                    Exporting
                  </>
                ) : (
                  <>
                    <Download />
                    Export Logs
                  </>
                )}
              </button>
            </div>
          </div>

          <LogsTable
            data={logs}
            isLoading={isLoading}
            isError={isError}
            page={search.page}
            perPage={search.perPage}
            total={meta.total}
            onPageChange={(p) => navigate({ search: { ...search, page: p } })}
            onPerPageChange={(pp) =>
              navigate({ search: { ...search, perPage: pp, page: 1 } })
            }
          />
        </GridItem>
      </Grid>
    </>
  )
}
