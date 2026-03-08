import { format, parseISO } from 'date-fns'
import type { LogItem, LogsTableProps } from '~/models/components'

import TableContent from '~/components/Table/TableContent'
import TablePagination from '~/components/Table/TablePagination'
import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'

export type { LogItem }

function flattenForTable(items: Array<LogItem>) {
  return items.map((item) => ({
    id: item.id,
    timestamp: format(parseISO(item.created_at), 'yyyy-MM-dd HH:mm:ss'),
    actor: item.actor_email || item.actor_id || '—',
    role: item.actor_role || '—',
    action: item.action,
    entity: item.entity || '—',
    details: item.details || '—',
  }))
}

export default function LogsTable(
  props: LogsTableProps & { isError?: boolean },
) {
  const {
    data,
    page,
    perPage,
    total,
    isLoading,
    isError,
    onPageChange,
    onPerPageChange,
  } = props

  const rows = flattenForTable(data)

  return (
    <>
      {isLoading ? (
        <LoaderTable />
      ) : isError ? (
        <SkeletonError />
      ) : rows.length === 0 ? (
        <SkeletonNull />
      ) : (
        <TableContent
          columns={[
            { header: 'Timestamp', accessor: 'timestamp' },
            { header: 'Actor', accessor: 'actor' },
            { header: 'Role', accessor: 'role' },
            { header: 'Action', accessor: 'action' },
            { header: 'Entity', accessor: 'entity' },
            { header: 'Details', accessor: 'details' },
          ]}
          data={rows}
        />
      )}

      <TablePagination
        page={page}
        perPage={perPage}
        total={total}
        from={(page - 1) * perPage + (rows.length > 0 ? 1 : 0)}
        to={Math.min(page * perPage, total)}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
      />
    </>
  )
}
