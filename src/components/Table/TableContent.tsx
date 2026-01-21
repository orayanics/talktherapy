import React from "react";

export type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

export type TableContentProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowsPerPage?: 5 | 10 | 50;
};

function getRowId<T extends { id?: React.Key }>(
  row: T,
  rowIndex: number,
): React.Key {
  return row.id ?? rowIndex;
}

export default function TableContent<T extends { id?: React.Key }>({
  columns,
  data,
  rowsPerPage = 5,
}: TableContentProps<T>) {
  return (
    <div className="overflow-auto bg-white dark:bg-gray-900 rounded-lg border bg-background p-6">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead className="hover:bg-gray-100 ">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                className="border-b px-4 py-2 text-left font-semibold"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {data.slice(0, rowsPerPage).map((row, rowIndex) => (
            <tr
              key={getRowId(row, rowIndex)}
              className="transition-colors hover:bg-gray-100"
            >
              {columns.map((col) => {
                const value = row[col.accessor];
                return (
                  <td
                    key={String(col.accessor)}
                    className="border-b px-4 py-2 align-middle"
                  >
                    {col.render
                      ? col.render(value, row)
                      : value != null
                        ? String(value)
                        : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
