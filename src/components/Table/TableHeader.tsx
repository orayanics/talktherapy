import React from "react";
import Grid from "~/components/Page/Grid";
import GridItem from "../Page/GridItem";

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
      <h1 className="font-bold text-2xl">{heading ?? "Table Header"}</h1>
      {children && (
        <Grid cols={12} gap={4}>
          {items.map((child, index) => (
            <GridItem key={index} colSpan={12} className="md:col-span-6">
              {child}
            </GridItem>
          ))}
        </Grid>
      )}
    </div>
  );
}
