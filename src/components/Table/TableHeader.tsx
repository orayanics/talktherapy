import React from "react";

interface TableHeaderProps {
  heading?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function TableHeader(props: TableHeaderProps) {
  const { heading, children, className } = props;
  const items = React.Children.toArray(children);
  return (
    <div className={className}>
      <h1 className="font-bold text-xl">{heading ?? "Table Header"}</h1>
      {children && items.map((child, index) => <div key={index}>{child}</div>)}
    </div>
  );
}
