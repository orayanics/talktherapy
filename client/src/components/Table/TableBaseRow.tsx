import type { ReactNode } from 'react'
import type { Column } from './TableBase'

export default function TableBaseRow<T>({
  row,
  rowIndex,
  columns,
}: {
  row: T
  rowIndex: number
  columns: Column<T>[]
}) {
  return (
    <tr>
      {columns.map((col, colIndex) => {
        const value = col.accessor
          ? (row[col.accessor] as ReactNode)
          : undefined

        return (
          <td key={colIndex} className={col.className}>
            {col.render ? col.render(row, rowIndex) : value}
          </td>
        )
      })}
    </tr>
  )
}
