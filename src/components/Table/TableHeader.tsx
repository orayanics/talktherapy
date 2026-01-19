import React from "react";

interface TableHeaderProps {
  heading?: string;
  filterOptions?: React.ReactNode;
}

export default function TableHeader(props: TableHeaderProps) {
  const { heading, filterOptions } = props;
  return (
    <div>
      <h1 className="font-bold text-2xl">{heading ?? "Table Header"}</h1>
      <div className="flex gap-2 mt-4 mb-2">{filterOptions}</div>
    </div>
  );
}
