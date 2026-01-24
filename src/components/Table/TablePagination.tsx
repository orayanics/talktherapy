import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import FilterDropdown from "~/components/Input/InputSelect";

type TablePaginationProps = {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  perPageOptions?: {
    value: number;
    label: string;
  }[];
  className?: string;
};

export default function TablePagination({
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
  perPageOptions = [
    { value: 10, label: "10" },
    { value: 20, label: "20" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
  ],
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
      <div className="flex items-center justify-center md:justify-start gap-2 w-full">
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
      <div className="flex flex-row items-center justify-center md:justify-end gap-2 w-auto">
        <p className="whitespace-nowrap">No. of Items</p>
        <FilterDropdown
          placeholder="Select one"
          options={perPageOptions}
          value={perPage}
          onChange={(e) =>
            onPerPageChange(typeof e === "number" ? e : parseInt(e, 10))
          }
          className="w-auto"
        />
      </div>
    </div>
  );
}
