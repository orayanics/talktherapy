import React from 'react'

type Column<T> = {
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
    <div className="overflow-x-auto w-full">
      <table className={`table w-full ${className ?? ''}`}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={keyExtractor?.(row, rowIndex) ?? rowIndex}>
              {columns.map((col, colIndex) => {
                const value = col.accessor
                  ? (row[col.accessor] as React.ReactNode)
                  : undefined

                return (
                  <td key={colIndex} className={col.className}>
                    {col.render ? col.render(row, rowIndex) : value}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
