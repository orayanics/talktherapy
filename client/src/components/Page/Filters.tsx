import { useId } from 'react'

import SearchInput from '#/components/Form/SearchInput'
import ChoiceFilterOption from './ChoiceFilterOption'

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
    <label className="input min-w-0 w-fit">
      <span className="sr-only">{label}</span>
      <SearchInput
        value={value}
        onSearch={onChange}
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
          <ChoiceFilterOption
            key={option.value}
            id={id}
            option={option}
            value={value}
            onChange={onChange}
          />
        ))}
      </div>
    </fieldset>
  )
}
