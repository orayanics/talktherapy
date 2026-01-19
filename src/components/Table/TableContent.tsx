interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface TableContentProps<T> {
  columns: Column<T>[];
  data: T[];
}

export default function TableContent<T extends Record<string, any>>({
  columns,
  data,
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
          {data.map((row, rowIndex) => (
            <tr
              key={(row as any).id ?? rowIndex}
              className="transition-colors hover:bg-gray-100"
            >
              {columns.map((col) => (
                <td
                  key={String(col.accessor)}
                  className="border-b px-4 py-2 align-middle"
                >
                  {col.render
                    ? col.render(row[col.accessor], row)
                    : String(row[col.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
