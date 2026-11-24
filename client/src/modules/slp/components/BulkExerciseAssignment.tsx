import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Drawer from '#/components/Drawer'
import SearchInput from '#/components/Form/SearchInput'
import Pagination from '#/components/Page/Pagination'
import { api } from '#/lib/api/client'
import { fetchClinicianPatients } from '#/modules/patients/api/patients'
import type { ClinicianPatient } from '#/modules/patients/types/patients'
import type { SlpExercise } from '../api/exercises'
import SlpPatientOption from './SlpPatientOption'

export default function BulkExerciseAssignment({
  exercises,
  onAssigned,
}: {
  exercises: SlpExercise[]
  onAssigned: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [audience, setAudience] = useState<'all' | 'selected'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const queryClient = useQueryClient()
  const patients = useQuery({
    ...fetchClinicianPatients({ page }, { search: search || undefined }),
    enabled: isOpen && audience === 'selected',
  })
  const assign = useMutation({
    mutationFn: async () => {
      const payload =
        audience === 'selected' ? { patient_ids: [...selected] } : {}
      await Promise.all(
        assignable.map((exercise) =>
          api('/api/v1/slp/assignments', {
            method: 'POST',
            data: {
              audience,
              ...payload,
              exercise_version_id: exercise.latest_version?.id,
            },
          }),
        ),
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['slp-workflow'] })
      setIsOpen(false)
      onAssigned()
    },
  })
  const assignable = exercises.filter(
    (exercise) =>
      exercise.latest_version?.status === 'published' &&
      exercise.available_for_assignment !== false,
  )
  const togglePatient = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const close = () => setIsOpen(false)

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      label="Assign exercises"
      closeButtonRef={closeRef}
      content={
        <button
          ref={triggerRef}
          type="button"
          className="btn btn-neutral"
          disabled={exercises.length === 0}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
        >
          Assign {exercises.length} exercise{exercises.length === 1 ? '' : 's'}
        </button>
      }
      panelClassName="min-h-full bg-base-100 text-base-content"
      childrenCn="p-6"
    >
      {isOpen && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Assign exercises</h2>
            <p className="mt-1 text-sm text-slate-600">
              Assignments place these exercises in the patients’ My assignments
              list. Visibility controls whether patients can discover an
              exercise on their own; it does not create an assignment.
            </p>
          </div>
          {assignable.length !== exercises.length && (
            <div className="alert alert-soft alert-warning" role="alert">
              {exercises.length - assignable.length} selected exercise
              {exercises.length - assignable.length === 1 ? '' : 's'} cannot be
              assigned until published and available. They will be skipped.
            </div>
          )}
          <fieldset className="space-y-2">
            <legend className="font-medium">
              Who should receive the assignment?
            </legend>
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="bulk-assignment-audience"
                checked={audience === 'all'}
                onChange={() => setAudience('all')}
              />
              <span>
                <strong>All of my patients</strong>
                <span className="block text-sm text-slate-600">
                  Every patient on your caseload receives these exercises.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="bulk-assignment-audience"
                checked={audience === 'selected'}
                onChange={() => setAudience('selected')}
              />
              <span>
                <strong>Specific patients</strong>
                <span className="block text-sm text-slate-600">
                  Choose one or more patients below.
                </span>
              </span>
            </label>
          </fieldset>
          {audience === 'selected' && (
            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                htmlFor="bulk-patient-search"
              >
                Search patients
              </label>
              <SearchInput
                id="bulk-patient-search"
                className="input w-full"
                value={search}
                onSearch={(value) => {
                  setSearch(value)
                  setPage(1)
                }}
                placeholder="Search by name or email"
              />
              <div
                className="max-h-56 space-y-1 overflow-y-auto"
                aria-label="Patient selection"
              >
                {patients.isPending && (
                  <p className="text-sm text-slate-500">Loading patients…</p>
                )}
                {(patients.data?.data ?? []).map((item: ClinicianPatient) => (
                  <SlpPatientOption
                    key={item.patientId}
                    patient={item}
                    selected={selected.has(item.patientId)}
                    onToggle={() => togglePatient(item.patientId)}
                  />
                ))}
                {!patients.isPending &&
                  (patients.data?.data ?? []).length === 0 && (
                    <p className="text-sm text-slate-500">
                      No matching patients.
                    </p>
                  )}
              </div>
              {selected.size > 0 && (
                <p className="text-sm text-slate-600">
                  {selected.size} patient{selected.size === 1 ? '' : 's'}{' '}
                  selected
                </p>
              )}
              {patients.data?.meta && patients.data.meta.last_page > 1 && (
                <Pagination
                  meta={patients.data.meta}
                  page={page}
                  updateSearch={({ page: next }) => setPage(next)}
                />
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-neutral"
              disabled={
                assignable.length === 0 ||
                (audience === 'selected' && selected.size === 0) ||
                assign.isPending
              }
              onClick={() => assign.mutate()}
            >
              {assign.isPending
                ? 'Assigning…'
                : audience === 'all'
                  ? 'Assign to all my patients'
                  : `Assign to ${selected.size} patient${selected.size === 1 ? '' : 's'}`}
            </button>
            <button type="button" className="btn" onClick={close}>
              Cancel
            </button>
          </div>
          {assign.isError && (
            <div className="alert alert-soft alert-error" role="alert">
              Could not assign these exercises. Check access and try again.
            </div>
          )}
        </div>
      )}
    </Drawer>
  )
}
