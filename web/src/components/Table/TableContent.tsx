import React from 'react'
import type { Column, ColumnForKey, TableContentProps } from '~/models/table'

export type { Column, ColumnForKey, TableContentProps }

function getRowId<T extends { id?: React.Key }>(
  row: T,
  rowIndex: number,
): React.Key {
  return row.id ?? rowIndex
}

export default function TableContent<T extends { id?: React.Key }>({
  columns,
  data,
  renderers = {},
  onRowClick,
  selectedRowId,
}: TableContentProps<T>) {
  return (
    <div className="overflow-auto h-120 max-h-120 bg-white rounded-lg border p-6">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead className="hover:bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                className={`border-b px-4 py-2 text-left font-semibold ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className=" [&>_tr:last-child>_td]:border-b-0">
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-gray-500"
              >
                No data available.
              </td>
            </tr>
          )}

          {data.map((row, rowIndex) => {
            const rowId = getRowId(row, rowIndex)
            const isSelected =
              selectedRowId !== undefined && rowId === selectedRowId
            return (
              <tr
                key={rowId}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''} ${isSelected ? 'bg-primary/10 hover:bg-primary/15' : ''}`}
              >
                {columns.map((col) => {
                  const value = row[col.accessor]
                  return (
                    <td
                      key={String(col.accessor)}
                      className={`border-b px-4 py-2 align-middle ${col.className ?? ''}`}
                    >
                      {col.render
                        ? col.render(value, row)
                        : renderers[col.accessor]
                          ? renderers[col.accessor]!(value, row)
                          : value != null
                            ? typeof value === 'object'
                              ? JSON.stringify(value)
                              : (value as unknown as React.ReactNode)
                            : ''}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
