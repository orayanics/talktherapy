import React from "react";
import cx from "classnames";

interface GridItemProps {
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  rowStart?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  className?: string;
}

const colSpanMap = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  12: "col-span-12",
};

const rowSpanMap = {
  1: "row-span-1",
  2: "row-span-2",
  3: "row-span-3",
  4: "row-span-4",
  5: "row-span-5",
  6: "row-span-6",
  12: "row-span-12",
};

const colStartMap = {
  1: "col-start-1",
  2: "col-start-2",
  3: "col-start-3",
  4: "col-start-4",
  5: "col-start-5",
  6: "col-start-6",
  12: "col-start-12",
};

const rowStartMap = {
  1: "row-start-1",
  2: "row-start-2",
  3: "row-start-3",
  4: "row-start-4",
  5: "row-start-5",
  6: "row-start-6",
  12: "row-start-12",
};

export default function GridItem({
  children,
  colSpan = 1,
  rowSpan = 1,
  colStart,
  rowStart,
  className,
}: GridItemProps) {
  return (
    <div
      className={cx(
        colSpanMap[colSpan],
        rowSpanMap[rowSpan],
        colStart && colStartMap[colStart],
        rowStart && rowStartMap[rowStart],
        className,
      )}
    >
      {children}
    </div>
  );
}
