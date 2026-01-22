import React, { useState } from "react";

type FilterDrawerProps = {
  children: React.ReactNode;
};

export default function FilterDrawer({ children }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => setOpen(true)}
        type="button"
      >
        Select Filters
      </button>

      <div
        className={`fixed inset-0 z-40 bg-black/50 duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`flex flex-col justify-between p-6 gap-2 fixed top-0 right-0 z-50 h-full w-100 max-w-md bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}

        `}
        style={{ maxWidth: "90vw" }}
        aria-modal="true"
        role="dialog"
      >
        <div className="flex flex-col gap-2">{children}</div>

        <button
          className="flex p-2 justify-center items-center btn btn-primary"
          onClick={() => setOpen(false)}
          aria-label="Close drawer"
        >
          Close
        </button>
      </aside>
    </>
  );
}
