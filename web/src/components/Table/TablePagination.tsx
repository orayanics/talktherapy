import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import type { TablePaginationProps } from '~/models/table'
import InputSelect from '~/components/Input/InputSelect'

export default function TablePagination({
  page,
  perPage,
  total,
  lastPage,
  from,
  to,
  onPageChange,
  onPerPageChange,
  perPageOptions = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
  ],
  className = '',
}: TablePaginationProps) {
  const totalPages = Math.max(
    1,
    Number.isFinite(lastPage) ? Number(lastPage) : Math.ceil(total / perPage),
  )

  const currentPage = Math.min(Math.max(page, 1), totalPages)

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1)
  }
  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1)
  }

  return (
    <div
      className={`flex flex-col lg:flex-row lg:items-center justify-between gap-2 ${className}`}
    >
      <div className="flex items-center justify-center lg:justify-start gap-2 w-full">
        <button
          className="btn btn-primary p-2"
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          <FaChevronLeft />
        </button>
        <span className="mx-2">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
        <button
          className="btn btn-primary p-2"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          <FaChevronRight />
        </button>
      </div>
      <div className="flex flex-row items-center justify-center lg:justify-end gap-2 w-auto">
        {typeof from === 'number' && typeof to === 'number' && (
          <p className="whitespace-nowrap">
            Showing <strong>{from}</strong>-<strong>{to}</strong> of{' '}
            <strong>{total}</strong>
          </p>
        )}
        <p className="whitespace-nowrap">No. of Items</p>
        <InputSelect
          placeholder="Select one"
          options={perPageOptions}
          value={perPage}
          onChange={(e) =>
            onPerPageChange(typeof e === 'number' ? e : parseInt(e, 10))
          }
          className="w-auto"
        />
      </div>
    </div>
  )
}
