import { useId } from 'react'

export function SearchFilter({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder?: string
}) {
  return (
    <label className="input min-w-0 w-full">
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? label}
        className="input"
      />
    </label>
  )
}

export function DateFilter({
  value,
  onChange,
  label,
}: {
  value?: string
  onChange: (value: string) => void
  label: string
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <input
        className="input"
        type="date"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

export function ChoiceFilter({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Array<{ value: string; label: string }>
  value: string[]
  onChange: (value: string[]) => void
}) {
  const id = useId()
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">{label}</legend>
      <div className="flex flex-col gap-6">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <input
              id={id + option.value}
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={value.includes(option.value)}
              onChange={() =>
                onChange(
                  value.includes(option.value)
                    ? value.filter((item) => item !== option.value)
                    : [...value, option.value],
                )
              }
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
