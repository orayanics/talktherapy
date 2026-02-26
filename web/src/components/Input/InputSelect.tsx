interface Option {
  value: unknown
  label: string
}

interface FilterDropdownProps<T> {
  placeholder?: string
  options: Array<Option>
  value: T
  onChange: (value: T) => void
  className?: string
}

export default function FilterDropdown<T>(props: FilterDropdownProps<T>) {
  const { placeholder, options, value, onChange, className } = props
  const selectedValue =
    value === null || value === undefined ? '' : String(value)
  const optionValueMap = new Map(
    options.map((option) => [String(option.value), option.value]),
  )
  return (
    <select
      className={`select rounded-md ${className}`}
      id="default-select"
      name="default-select"
      value={selectedValue}
      onChange={(e) => {
        const nextValue = optionValueMap.get(e.target.value) ?? e.target.value
        onChange(nextValue as T)
      }}
    >
      <option value="" disabled>
        {placeholder || 'Select an option'}
      </option>
      {options.map((option) => (
        <option key={option.value as string} value={option.value as string}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
