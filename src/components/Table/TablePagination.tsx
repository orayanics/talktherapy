import React from "react";

type TablePaginationProps = {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  className?: string;
};

export default function TablePagination({
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
  perPageOptions = [5, 10, 20, 50],
  className = "",
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  // Clamp page
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div
      className={`flex flex-col md:flex-row md:items-center justify-between gap-2 ${className}`}
    >
      <div className="flex items-center gap-2">
        <button
          className="px-2 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="mx-2">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
        <button
          className="px-2 py-1 rounded border bg-gray-100 text-gray-700 gray-200 disabled:opacity-50"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span>Rows per page:</span>
        <select
          className="input input-select bg-white"
          value={perPage}
          onChange={(e) => onPerPageChange?.(Number(e.target.value))}
          id="table-select"
          name="table-select"
        >
          {perPageOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="ml-2 text-sm text-gray-500">{total} total</span>
      </div>
    </div>
  );
}
