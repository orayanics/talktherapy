import { FaExclamationCircle } from "react-icons/fa";

export default function SkeletonError() {
  return (
    <div className="py-10 text-center text-gray-500 flex flex-col gap-4 items-center justify-center border border-dashed border-error rounded-lg">
      <FaExclamationCircle className="text-error" />
      <span className="text-sm text-error">Failed to load data</span>
    </div>
  );
}
