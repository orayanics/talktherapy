import type { ClinicianPatient } from '#/modules/patients/types/patients'

export default function SlpPatientOption({
  patient,
  selected,
  onToggle,
}: {
  patient: ClinicianPatient
  selected: boolean
  onToggle: () => void
}) {
  return (
    <label className="flex items-center gap-2 rounded p-2 hover:bg-slate-50">
      <input type="checkbox" checked={selected} onChange={onToggle} />
      <span>{patient.patient.name}</span>
    </label>
  )
}
