import type { InputMultiSelectProps } from '~/models/components'

export default function InputMultiselect(props: InputMultiSelectProps) {
  const { placeholder, options, value = [], onChange, className } = props
  const label = value.length === 0 ? placeholder : `${value.length} selected`

  const toggleOption = (option: string) => {
    const nextValue = value.includes(option)
      ? value.filter((v) => v !== option)
      : [...value, option]

    onChange?.(nextValue)
  }

  return (
    <div className="dropdown dropdown-start">
      <div
        tabIndex={0}
        className={`select text-left ${className}`}
        role="button"
      >
        {label}
      </div>

      <ul
        tabIndex={-1}
        className="dropdown-content menu bg-white rounded-box z-10 w-52 p-2 mt-1 shadow-sm"
      >
        {options.map((option) => (
          <label
            key={option.value as string}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 pt-1 pb-2 border-b last:border-b-0"
          >
            <input
              className="checkbox checkbox-sm rounded-md"
              type="checkbox"
              checked={value.includes(option.value as string)}
              onChange={() => toggleOption(option.value as string)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </ul>
    </div>
  )
}
