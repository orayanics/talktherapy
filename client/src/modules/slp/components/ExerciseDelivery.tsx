import { useEffect, useMemo, useRef, useState } from 'react'
import Pagination from '#/components/Page/Pagination'
import Drawer from '#/components/Drawer'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api/client'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import { fetchClinicianPatients } from '#/modules/patients/api/patients'
import type { ClinicianPatient } from '#/modules/patients/types/patients'
import type { SlpExercise } from '../api/exercises'

type Audience = 'all' | 'selected'

export default function ExerciseDelivery({
  exercise,
}: {
  exercise: SlpExercise
}) {
  const { role } = useAuthGuard()
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!isOpen) return
    closeRef.current?.focus()
    return () => {
      triggerRef.current?.focus()
    }
  }, [isOpen])
  const client = useQueryClient()
  const version = exercise.latest_version
  const [audience, setAudience] = useState<Audience>(
    version?.configuration?.patient_audience === 'selected'
      ? 'selected'
      : 'all',
  )
  const [visible, setVisible] = useState(
    version?.configuration?.patient_visible === true,
  )
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const patients = useQuery({
    ...fetchClinicianPatients({ page }, { search: search || undefined }),
    enabled: isOpen && role === 'clinician' && audience === 'selected',
  })
  const pagePatients = patients.data?.data ?? []
  const meta = patients.data?.meta

  useEffect(() => setPage(1), [search])
  useEffect(() => {
    const configured = version?.configuration?.patient_ids
    if (Array.isArray(configured))
      setSelected(
        new Set(
          configured.filter((id): id is string => typeof id === 'string'),
        ),
      )
  }, [version?.id, version?.configuration?.patient_ids])
  const selectedNames = useMemo(() => {
    const names = new Map<string, string>()
    pagePatients.forEach((item) => names.set(item.patientId, item.patient.name))
    return [...selected].map((id) => names.get(id) ?? id)
  }, [pagePatients, selected])
  const visibility = useMutation({
    mutationFn: (nextVisible: boolean) =>
      api(`/api/v1/slp/exercise-versions/${version?.id}/visibility`, {
        method: 'PATCH',
        data: {
          visible: nextVisible,
          audience,
          patient_ids: audience === 'selected' ? [...selected] : [],
        },
      }),
    onSuccess: (_result, nextVisible) => {
      setVisible(nextVisible)
      client.invalidateQueries({ queryKey: ['slp-exercises'] })
    },
  })
  const assign = useMutation({
    mutationFn: () =>
      api('/api/v1/slp/assignments', {
        method: 'POST',
        data: {
          audience,
          patient_ids: audience === 'selected' ? [...selected] : [],
          exercise_version_id: version?.id,
        },
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['slp-workflow'] }),
  })
  if (!version) return null
  const canAssign = audience === 'all' || selected.size > 0
  const togglePatient = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      label="Patient visibility"
      closeButtonRef={closeRef}
      content={
        <button
          ref={triggerRef}
          type="button"
          className="btn btn-sm"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
        >
          Patient visibility
        </button>
      }
      panelClassName="min-h-full w-100 max-w-full bg-base-100 text-base-content"
    >
      {isOpen && (
        <div className="space-y-4 p-6">
          <section
            aria-label="Exercise content"
            className="space-y-3 border-b border-border pb-4"
          >
            <h2 className="my-0! text-lg font-semibold">Exercise content</h2>
            <p className="my-0! whitespace-pre-wrap wrap-break-word">
              {version.prompt_text}
            </p>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="font-medium">Module</dt>
                <dd className="m-0">{exercise.module.replaceAll('_', ' ')}</dd>
              </div>
              <div>
                <dt className="font-medium">Language</dt>
                <dd className="m-0">
                  {version.language}
                  {version.dialect ? ` (${version.dialect})` : ''}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Task type</dt>
                <dd className="m-0">
                  {version.task_type.replaceAll('_', ' ')}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Scope</dt>
                <dd className="m-0">{exercise.scope}</dd>
              </div>
              <div>
                <dt className="font-medium">Revision</dt>
                <dd className="m-0">{version.revision}</dd>
              </div>
              <div>
                <dt className="font-medium">Status</dt>
                <dd className="m-0">{version.status}</dd>
              </div>
            </dl>
          </section>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={visible}
              onChange={(event) => setVisible(event.target.checked)}
            />
            Allow patients to test this draft
          </label>
          {role === 'clinician' && (
            <fieldset className="space-y-2">
              <legend className="font-medium">Patient visibility</legend>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`audience-${version.id}`}
                  checked={audience === 'all'}
                  onChange={() => setAudience('all')}
                />{' '}
                All of my patients
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`audience-${version.id}`}
                  checked={audience === 'selected'}
                  onChange={() => setAudience('selected')}
                />{' '}
                Specific patients
              </label>
            </fieldset>
          )}
          {audience === 'selected' && role === 'clinician' && (
            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                htmlFor={`patient-search-${version.id}`}
              >
                Search patients
              </label>
              <input
                id={`patient-search-${version.id}`}
                className="input w-full"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
              />
              <div
                className="max-h-56 space-y-1 overflow-y-auto"
                aria-label="Patient selection"
              >
                {patients.isPending && (
                  <p className="text-sm text-slate-500">Loading patients…</p>
                )}
                {pagePatients.map((item: ClinicianPatient) => (
                  <label
                    key={item.patientId}
                    className="flex items-center gap-2 rounded p-2 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(item.patientId)}
                      onChange={() => togglePatient(item.patientId)}
                    />
                    <span>{item.patient.name}</span>
                  </label>
                ))}
                {!patients.isPending && pagePatients.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No matching patients.
                  </p>
                )}
              </div>
              {selected.size > 0 && (
                <p className="text-sm text-slate-600" aria-live="polite">
                  {selected.size} patient{selected.size === 1 ? '' : 's'}{' '}
                  selected
                  {selectedNames.length > 0
                    ? `: ${selectedNames.join(', ')}`
                    : ''}
                </p>
              )}
              {meta && meta.last_page > 1 && (
                <Pagination
                  meta={meta}
                  page={page}
                  updateSearch={({ page: nextPage }) => setPage(nextPage)}
                />
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-sm"
              disabled={
                visibility.isPending ||
                (audience === 'selected' && selected.size === 0)
              }
              onClick={() => visibility.mutate(visible)}
            >
              Save visibility and audience
            </button>
            {role === 'clinician' &&
              version.configuration?.patient_visible === true && (
                <button
                  className="btn btn-sm"
                  disabled={!canAssign || assign.isPending}
                  onClick={() => assign.mutate()}
                >
                  {audience === 'all'
                    ? 'Assign to all patients'
                    : `Assign to ${selected.size} patient${selected.size === 1 ? '' : 's'}`}
                </button>
              )}
          </div>
          {assign.isSuccess && <p role="status">Exercise assigned.</p>}
          {(visibility.isError || assign.isError || patients.isError) && (
            <p role="alert">
              Could not complete this action. Check access and try again.
            </p>
          )}
        </div>
      )}
    </Drawer>
  )
}
