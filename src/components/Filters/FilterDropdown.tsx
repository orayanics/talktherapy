import { useEffect, useState, useRef } from "react";

interface FilterDropdownProps {
  placeholder?: string;
  options: string[];
  value?: string[] | string;
  onChange?: (value: string[] | string) => void;
  type: "select" | "checkbox" | "multiselect";
}

export default function FilterDropdown(props: FilterDropdownProps) {
  const { placeholder, options, type, value, onChange } = props;
  return (
    <>
      {type === "select" && (
        <DefaultSelect
          placeholder={placeholder}
          options={options}
          value={value as string}
          onChange={onChange as (value: string) => void}
        />
      )}
      {type === "multiselect" && (
        <MultiSelect
          placeholder={placeholder}
          options={options}
          value={value as string[]}
          onChange={onChange as (value: string[]) => void}
        />
      )}
    </>
  );
}

interface DefaultSelectProps {
  placeholder?: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}

function DefaultSelect({
  placeholder,
  options,
  value = "",
  onChange,
}: DefaultSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggleOption = (option: string) => {
    onChange?.(option);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref}>
      <button
        className="input input-select"
        type="button"
        onClick={() => setOpen((o) => !o)}
      >
        {value || placeholder || "Select an option"}
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-auto border rounded bg-white dark:bg-gray-900 shadow space-y-2 p-2">
          {options.map((option) => (
            <button
              className="block w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              key={option}
              onClick={() => toggleOption(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface MultiSelectProps {
  placeholder?: string;
  options: string[];
  value?: string[];
  onChange?: (value: string[]) => void;
}

function MultiSelect({
  placeholder = "Select options",
  options,
  value = [],
  onChange,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggleOption = (option: string) => {
    const nextValue = value.includes(option)
      ? value.filter((v) => v !== option)
      : [...value, option];

    onChange?.(nextValue);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const label = value.length === 0 ? placeholder : `${value.length} selected`;

  return (
    <div ref={ref}>
      <button
        className="input input-select"
        type="button"
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-auto border rounded bg-white dark:bg-gray-900 shadow space-y-2 p-2">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1"
            >
              <input
                className="input-checkbox"
                type="checkbox"
                checked={value.includes(option)}
                onChange={() => toggleOption(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
