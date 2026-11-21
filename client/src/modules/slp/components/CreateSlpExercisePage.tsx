import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Pagination from '#/components/Page/Pagination'
import RowError from '#/components/Table/RowError'
import FormInput from '#/components/Form/FormInput'
import { fetchClinicianPatients } from '#/modules/patients/api/patients'
import type { ClinicianPatient } from '#/modules/patients/types/patients'
import {
  useCreateSlpExerciseMutation,
  useUpdateSlpExerciseMutation,
} from '#/modules/slp/hooks/useExerciseMutations'
import { mutateUploadSlpAsset } from '../api/exercises'

import type { SlpExercise, SlpExerciseModule } from '../api/exercises'

import { slpExerciseModules } from '../types/exercises'

type Audience = 'all' | 'selected'

export default function CreateSlpExercisePage({
  exercise,
  collectionId,
  onSaved,
}: {
  exercise?: SlpExercise
  collectionId?: string
  onSaved?: () => void
}) {
  const formId = useId()
  const errorRef = useRef<HTMLParagraphElement>(null)
  const create = useCreateSlpExerciseMutation()
  const update = useUpdateSlpExerciseMutation(exercise?.id ?? '')
  const mutation = exercise ? update : create
  const version = exercise?.latest_version
  const [module, setModule] = useState<SlpExerciseModule>(
    exercise?.module ?? 'fluency',
  )
  const [language, setLanguage] = useState(version?.language ?? 'en')
  const [dialect, setDialect] = useState(version?.dialect ?? '')
  const [configuration, setConfiguration] = useState(
    JSON.stringify(
      version?.configuration ?? { patient_visible: false },
      null,
      2,
    ),
  )
  const [formError, setFormError] = useState('')
  const [hidden, setHidden] = useState(exercise?.is_hidden ?? false)
  const [taskType, setTaskType] = useState(
    version?.task_type ?? 'passage_reading',
  )
  const [prompt, setPrompt] = useState(version?.prompt_text ?? '')
  const [assetError, setAssetError] = useState('')
  const [assetUploading, setAssetUploading] = useState(false)
  const [visible, setVisible] = useState(
    version?.configuration?.patient_visible === true,
  )
  const [audience, setAudience] = useState<Audience>(
    version?.configuration?.patient_audience === 'selected'
      ? 'selected'
      : 'all',
  )
  const [search, setSearch] = useState('')
  const [patientPage, setPatientPage] = useState(1)
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(
    new Set(
      Array.isArray(version?.configuration?.patient_ids)
        ? version.configuration.patient_ids.filter(
            (id): id is string => typeof id === 'string',
          )
        : [],
    ),
  )
  const patients = useQuery({
    ...fetchClinicianPatients(
      { page: patientPage },
      { search: search || undefined },
    ),
    enabled: audience === 'selected',
  })
  const selectedNames = useMemo(() => {
    const names = new Map<string, string>()
    ;(patients.data?.data ?? []).forEach((item) =>
      names.set(item.patientId, item.patient.name),
    )
    return [...selectedPatients].map((id) => names.get(id) ?? id)
  }, [patients.data?.data, selectedPatients])
  useEffect(() => setPatientPage(1), [search])

  const uploadAsset = async (file: File) => {
    setAssetError('')
    setAssetUploading(true)
    try {
      const result = await mutateUploadSlpAsset(file)
      const parsed = JSON.parse(configuration) as Record<string, unknown>
      const ids = Array.isArray(parsed.asset_ids)
        ? parsed.asset_ids.filter((id): id is string => typeof id === 'string')
        : []
      parsed.asset_ids = [...new Set([...ids, result.data.id])]
      setConfiguration(JSON.stringify(parsed, null, 2))
    } catch {
      setAssetError(
        'Could not upload that asset. Use an image or supported audio file under 10 MiB.',
      )
    } finally {
      setAssetUploading(false)
    }
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError('')
    let config: Record<string, unknown>
    try {
      const parsed: unknown = JSON.parse(configuration)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
        throw new Error()
      config = parsed as Record<string, unknown>
    } catch {
      setFormError('Configuration must be a JSON object.')
      requestAnimationFrame(() => errorRef.current?.focus())
      return
    }
    if (audience === 'selected' && selectedPatients.size === 0) {
      setFormError(
        'Select at least one patient or choose all of your patients.',
      )
      requestAnimationFrame(() => errorRef.current?.focus())
      return
    }
    config.patient_visible = visible
    config.patient_audience = audience
    config.patient_ids = audience === 'selected' ? [...selectedPatients] : []
    try {
      await mutation.mutateAsync({
        module,
        language,
        task_type: taskType,
        prompt_text: prompt,
        collection_id: collectionId,
        dialect: dialect || null,
        is_hidden: hidden,
        configuration: config,
      })
      if (onSaved) onSaved()
      else setPrompt('')
    } catch {
      /* Mutation state displays the error and preserves the draft. */
    }
  }

  return (
    <div className="space-y-6">
      <form
        aria-label={exercise ? 'Edit exercise' : 'New exercise'}
        onSubmit={submit}
        className="space-y-4 rounded-box border border-border p-4"
      >
        <div>
          <p className="font-semibold my-0!">
            {exercise ? 'Edit exercise' : 'New Draft'}
          </p>
          <p className="text-muted my-0!">
            Exercises created can be toggled and assigned to patient/s or saved
            as draft for further revisions
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <FormInput
            htmlFor={`${formId}-createslpexercisepage-field-1`}
            label="Exercise category"
          >
            <select
              id={`${formId}-createslpexercisepage-field-1`}
              className="select w-full"
              value={module}
              onChange={(event) =>
                setModule(event.target.value as SlpExerciseModule)
              }
            >
              {slpExerciseModules.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </FormInput>
          <FormInput
            htmlFor={`${formId}-createslpexercisepage-field-2`}
            label="Language"
          >
            <input
              id={`${formId}-createslpexercisepage-field-2`}
              className="input w-full"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              maxLength={16}
            />
          </FormInput>
          <FormInput
            htmlFor={`${formId}-createslpexercisepage-field-3`}
            label="Task type"
          >
            <input
              id={`${formId}-createslpexercisepage-field-3`}
              className="input w-full"
              value={taskType}
              onChange={(event) => setTaskType(event.target.value)}
              maxLength={50}
            />
          </FormInput>
          <FormInput htmlFor={`${formId}-exercise-dialect`} label="Dialect">
            <input
              id={`${formId}-exercise-dialect`}
              className="input w-full"
              value={dialect}
              maxLength={64}
              onChange={(event) => setDialect(event.target.value)}
            />
          </FormInput>
        </div>
        <FormInput
          htmlFor={`${formId}-createslpexercisepage-field-5`}
          label="Prompt"
          required
        >
          <textarea
            id={`${formId}-createslpexercisepage-field-5`}
            className="textarea w-full"
            required
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            maxLength={2000}
          />
        </FormInput>
        <FormInput htmlFor={`${formId}-exercise-asset`} label="Exercise media">
          <input
            id={`${formId}-exercise-asset`}
            className="file-input w-full"
            type="file"
            accept="image/jpeg,image/png,audio/mpeg,audio/wav,audio/mp4"
            disabled={assetUploading}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void uploadAsset(file)
              event.currentTarget.value = ''
            }}
          />
          <p className="mt-1 text-xs text-muted">
            Uploaded media is attached through configuration and remains private
            until the exercise is visible.
          </p>
          {assetUploading && <p role="status">Uploading media…</p>}
          {assetError && <p role="alert">{assetError}</p>}
        </FormInput>
        <fieldset className="space-y-3 rounded-box border border-base-300 p-4">
          <legend className="px-1 font-medium">Patient visibility</legend>
          <label className="flex items-center gap-2">
            <input
              className="checkbox"
              type="checkbox"
              checked={visible}
              onChange={(event) => setVisible(event.target.checked)}
            />
            Make available after publishing
          </label>
          <p className="text-sm text-muted">
            An administrator must publish the exercise before patients can use
            it.
          </p>
          <div className="space-y-2">
            <p className="font-medium">Who can see it?</p>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`${formId}-patient-audience`}
                checked={audience === 'all'}
                onChange={() => setAudience('all')}
              />
              All of my patients
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`${formId}-patient-audience`}
                checked={audience === 'selected'}
                onChange={() => setAudience('selected')}
              />
              Specific patients
            </label>
          </div>
          {audience === 'selected' && (
            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                htmlFor={`${formId}-patient-search`}
              >
                Search patients
              </label>
              <input
                id={`${formId}-patient-search`}
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
                {(patients.data?.data ?? []).map((item: ClinicianPatient) => (
                  <label
                    key={item.patientId}
                    className="flex items-center gap-2 rounded p-2 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPatients.has(item.patientId)}
                      onChange={() =>
                        setSelectedPatients((current) => {
                          const next = new Set(current)
                          if (next.has(item.patientId))
                            next.delete(item.patientId)
                          else next.add(item.patientId)
                          return next
                        })
                      }
                    />
                    <span>{item.patient.name}</span>
                  </label>
                ))}
                {!patients.isPending && patients.data?.data.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No matching patients.
                  </p>
                )}
              </div>
              {selectedPatients.size > 0 && (
                <p className="text-sm text-slate-600" aria-live="polite">
                  {selectedPatients.size} patient
                  {selectedPatients.size === 1 ? '' : 's'} selected
                  {selectedNames.length > 0
                    ? `: ${selectedNames.join(', ')}`
                    : ''}
                </p>
              )}
              {patients.data?.meta && patients.data.meta.last_page > 1 && (
                <Pagination
                  meta={patients.data.meta}
                  page={patientPage}
                  updateSearch={({ page }) => setPatientPage(page)}
                />
              )}
            </div>
          )}
        </fieldset>
        <FormInput
          htmlFor={`${formId}-exercise-configuration`}
          label="Configuration (JSON object)"
        >
          <textarea
            id={`${formId}-exercise-configuration`}
            className="textarea w-full font-mono"
            value={configuration}
            onChange={(event) => setConfiguration(event.target.value)}
          />
        </FormInput>
        <label className="flex min-h-12 items-center gap-2">
          <input
            className="checkbox"
            type="checkbox"
            checked={hidden}
            onChange={(event) => setHidden(event.target.checked)}
          />
          Hide exercise from new assignments
        </label>
        {formError && (
          <p ref={errorRef} tabIndex={-1} role="alert">
            {formError}
          </p>
        )}
        {mutation.isError && (
          <RowError message="Could not save this draft. Check the fields and try again." />
        )}
        <button className="btn btn-neutral" disabled={mutation.isPending}>
          {exercise ? 'Save exercise' : 'Save Draft'}
        </button>
      </form>
    </div>
  )
}
