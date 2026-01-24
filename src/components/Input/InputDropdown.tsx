import React from "react";

interface InputDropdownProps {
  label?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  btnClassName?: string;
  position?: string;
}

export default function InputDropdown(props: InputDropdownProps) {
  const { label, onClick, children, className, btnClassName, position } = props;
  return (
    <>
      <div className={`dropdown ${position || "dropdown-end"}`}>
        <div
          tabIndex={0}
          role="button"
          className={`btn ${btnClassName || ""}`}
          onClick={onClick}
        >
          {label || "Select Option"}
        </div>
        <ul
          tabIndex={-1}
          className={`dropdown-content menu bg-white rounded-lg p-2 shadow-md border ${className}`}
        >
          {children}
        </ul>
      </div>
    </>
  );
}
