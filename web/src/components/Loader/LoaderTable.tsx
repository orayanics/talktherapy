import LoaderSpin from "./LoaderSpin";
interface LoaderTableProps {
  className?: string;
}

export default function LoaderTable({ className }: LoaderTableProps) {
  return (
    <div
      className={`py-10 text-center text-gray-500 flex items-center justify-center border rounded-lg ${className}`}
    >
      <LoaderSpin />
    </div>
  );
}
