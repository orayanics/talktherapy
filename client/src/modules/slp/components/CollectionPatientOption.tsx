
export default function CollectionPatientOption({
  selected,
  patient,
  onChange,
}: {
  selected: string[]
  patient: { id: string; name: string }
  onChange: (ids: string[]) => void
}) {
  return (
    <label className="flex min-h-12 items-center gap-2">
      <input
        type="checkbox"
        className="checkbox"
        checked={selected.includes(patient.id)}
        onChange={(event) =>
          onChange(
            event.target.checked
              ? [...selected, patient.id]
              : selected.filter((id) => id !== patient.id),
          )
        }
      />
      {patient.name}
    </label>
  )
}
