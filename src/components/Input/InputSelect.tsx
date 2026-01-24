interface Option {
  value: unknown;
  label: string;
}

interface FilterDropdownProps<T> {
  placeholder?: string;
  options: Option[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export default function FilterDropdown<T>(props: FilterDropdownProps<T>) {
  const { placeholder, options, value, onChange, className } = props;
  return (
    <select
      className={`select rounded-md ${className}`}
      id="default-select"
      name="default-select"
      value={value as string}
      onChange={(e) => onChange(e.target.value as unknown as T)}
    >
      <option value="" disabled>
        {placeholder || "Select an option"}
      </option>
      {options.map((option) => (
        <option key={option.value as string} value={option.value as string}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
