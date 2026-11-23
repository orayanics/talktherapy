
export default function ChoiceFilterOption({
  id,
  option,
  value,
  onChange,
}: {
  id: string
  option: { value: string; label: string }
  value: string[]
  onChange: (value: string[]) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
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
  )
}
