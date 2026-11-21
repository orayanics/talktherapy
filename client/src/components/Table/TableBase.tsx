import React from 'react'
import TableBaseRow from './TableBaseRow'

export type Column<T> = {
  header: React.ReactNode
  accessor?: keyof T
  render?: (row: T, index: number) => React.ReactNode
  className?: string
}

type TableProps<T> = {
  data: T[]
  columns: Column<T>[]
  keyExtractor?: (row: T, index: number) => string | number
  className?: string
}

export function TableBase<T>({
  data,
  columns,
  keyExtractor,
  className,
}: TableProps<T>) {
  return (
    <div
      className="app-table overflow-x-auto w-full"
      tabIndex={0}
      role="region"
      aria-label="Data table"
    >
      <table className={`table w-full ${className ?? ''}`}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} scope="col" className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <TableBaseRow
              key={keyExtractor?.(row, rowIndex) ?? rowIndex}
              row={row}
              rowIndex={rowIndex}
              columns={columns}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
