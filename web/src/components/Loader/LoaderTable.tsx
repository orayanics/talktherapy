interface LoaderTableProps {
  className?: string;
  children?: React.ReactNode;
}

export default function LoaderTable(props: LoaderTableProps) {
  const { className, children } = props;
  return (
    <div
      className={`py-10 text-center text-gray-500 flex flex-col gap-4 items-center justify-center border border-dashed rounded-lg ${className}`}
    >
      <span className="loading loading-spinner loading-md text-primary"></span>
      {children || (
        <span className="text-sm animate-pulse">Loading your data...</span>
      )}
    </div>
  );
}
