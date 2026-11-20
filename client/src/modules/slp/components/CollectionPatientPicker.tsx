import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import { fetchClinicianPatients } from '#/modules/patients/api/patients'
import { fetchUsers } from '#/modules/users/api/users'
import Pagination from '#/components/Page/Pagination'

export default function CollectionPatientPicker({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const { role } = useAuthGuard()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const roster = useQuery({
    ...fetchClinicianPatients({ page }, { search }),
    enabled: role === 'clinician',
  })
  const users = useQuery({
    ...fetchUsers({ page }, { search, role: ['patient'] }),
    enabled: role !== 'clinician',
  })
  const query = role === 'clinician' ? roster : users
  const patients =
    role === 'clinician'
      ? roster.data?.data.map((item) => ({
          id: item.patientId,
          name: item.patient.name,
        }))
      : users.data?.data
  return (
    <fieldset className="space-y-3">
      <legend>Selected patients</legend>
      <label htmlFor="collection-patient-search">Search patients</label>
      <input
        id="collection-patient-search"
        className="input w-full"
        type="search"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value)
          setPage(1)
        }}
      />
      {query.isPending && <p>Loading patients…</p>}
      {query.isError && <p role="alert">Could not load patients.</p>}
      {patients?.map((patient) => (
        <label key={patient.id} className="flex min-h-12 items-center gap-2">
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
      ))}
      {patients?.length === 0 && <p>No matching patients.</p>}
      <p aria-live="polite">{selected.length} patients selected</p>
      <button type="button" className="btn" onClick={() => onChange([])}>
        Clear selection
      </button>
      {query.data && (
        <Pagination
          meta={query.data.meta}
          page={page}
          updateSearch={({ page: next }) => setPage(next)}
        />
      )}
    </fieldset>
  )
}
