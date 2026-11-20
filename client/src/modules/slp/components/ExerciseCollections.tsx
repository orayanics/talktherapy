import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import FormInput from '#/components/Form/FormInput'
import Pagination from '#/components/Page/Pagination'
import ModalConfirm from '#/components/Modal/ModalConfirm'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'
import { errMsg } from '#/lib/errorMessage'
import {
  collectionKeys,
  deleteCollection,
  fetchCollections,
  saveCollection,
} from '../api/collections'
import type { ExerciseCollection } from '../api/collections'
import SlpExerciseCatalog from './SlpExerciseCatalog'
import CollectionPractice from './CollectionPractice'
import CollectionPatientPicker from './CollectionPatientPicker'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'

function CollectionForm({
  collection,
  onSaved,
  onCancel,
}: {
  collection?: ExerciseCollection
  onSaved: (collection: ExerciseCollection) => void
  onCancel: () => void
}) {
  const { role } = useAuthGuard()
  const [audience, setAudience] = useState(
    collection?.patient_audience ?? 'assigned',
  )
  const [patients, setPatients] = useState(collection?.patient_ids ?? [])
  const errorRef = useRef<HTMLParagraphElement>(null)
  const client = useQueryClient()
  const save = useMutation({
    mutationFn: (data: FormData) => saveCollection(data, collection?.id),
    onSuccess: ({ data }) => {
      void client.invalidateQueries({ queryKey: collectionKeys })
      void client.invalidateQueries({ queryKey: ['slp-exercises'] })
      onSaved(data)
    },
  })
  return (
    <form
      aria-label={collection ? 'Edit collection' : 'New collection'}
      className="space-y-4 rounded-box border border-base-300 p-4"
      onSubmit={async (event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        data.set('is_hidden', data.has('is_hidden') ? '1' : '0')
        data.set('patient_audience', audience)
        if (audience === 'selected')
          (patients.length ? patients : ['']).forEach((id) =>
            data.append('patient_ids[]', id),
          )
        const cover = data.get('cover') as File
        if (!cover.size) data.delete('cover')
        if (data.has('remove_cover')) data.set('remove_cover', '1')
        try {
          await save.mutateAsync(data)
        } catch {
          requestAnimationFrame(() => errorRef.current?.focus())
        }
      }}
    >
      <FormInput htmlFor="collection-title" label="Title" required>
        <input
          id="collection-title"
          name="title"
          className="input w-full"
          required
          maxLength={255}
          defaultValue={collection?.title}
        />
      </FormInput>
      <FormInput htmlFor="collection-description" label="Description">
        <textarea
          id="collection-description"
          name="description"
          className="textarea w-full"
          maxLength={5000}
          defaultValue={collection?.description ?? ''}
        />
      </FormInput>
      <FormInput htmlFor="collection-cover" label="Photo cover">
        <input
          id="collection-cover"
          name="cover"
          type="file"
          className="file-input w-full"
          accept="image/jpeg,image/png,image/webp"
          aria-describedby="cover-help"
        />
        <p id="cover-help">
          JPEG, PNG or WebP, up to 5 MiB and 6,000 × 6,000 pixels.
        </p>
      </FormInput>
      {collection?.cover_url && (
        <label className="flex min-h-12 items-center gap-2">
          <input name="remove_cover" type="checkbox" className="checkbox" />
          Remove current cover
        </label>
      )}
      <label className="flex min-h-12 items-center gap-2">
        <input
          name="is_hidden"
          type="checkbox"
          className="checkbox"
          defaultChecked={collection?.is_hidden}
        />
        Hide collection from new practice and assignments
      </label>
      <p>Existing assignments remain available.</p>
      <FormInput htmlFor="collection-audience" label="Patient access">
        <select
          id="collection-audience"
          className="select w-full"
          value={audience}
          onChange={(event) =>
            setAudience(
              event.target.value as ExerciseCollection['patient_audience'],
            )
          }
        >
          <option value="assigned">Assigned patients only</option>
          <option value="selected">Selected patients</option>
          {role === 'clinician' && (
            <option value="clinician">All of my patients</option>
          )}
          <option value="platform">Every platform patient</option>
        </select>
      </FormInput>
      <p>
        Audience access applies to published exercises. Hidden exercises remain
        unavailable for new practice.
      </p>
      {audience === 'selected' && (
        <CollectionPatientPicker selected={patients} onChange={setPatients} />
      )}
      {save.isError && (
        <p ref={errorRef} tabIndex={-1} role="alert">
          {errMsg(save.error, 'Could not save the collection.')}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="btn btn-neutral"
          disabled={save.isPending}
        >
          Save collection
        </button>
        <button
          type="button"
          className="btn"
          disabled={save.isPending}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function ExerciseCollections({
  patientView = false,
}: {
  patientView?: boolean
}) {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<ExerciseCollection | null>(null)
  const [editing, setEditing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [allExercises, setAllExercises] = useState(false)
  const client = useQueryClient()
  const collections = useQuery(fetchCollections(page))
  const remove = useMutation({
    mutationFn: () => deleteCollection(selected!.id),
    onSuccess: () => {
      setSelected(null)
      setDeleting(false)
      void client.invalidateQueries({ queryKey: collectionKeys })
      void client.invalidateQueries({ queryKey: ['slp-exercises'] })
    },
  })
  if (creating || editing)
    return (
      <CollectionForm
        collection={editing ? selected! : undefined}
        onSaved={(collection) => {
          setSelected(collection)
          setCreating(false)
          setEditing(false)
        }}
        onCancel={() => {
          setCreating(false)
          setEditing(false)
        }}
      />
    )
  if (allExercises)
    return (
      <div className="space-y-4">
        <button className="btn" onClick={() => setAllExercises(false)}>
          Back to collections
        </button>
        <SlpExerciseCatalog />
      </div>
    )
  if (selected)
    return (
      <div className="space-y-6">
        <button className="btn" onClick={() => setSelected(null)}>
          Back to collections
        </button>
        <div className="space-y-3">
          {selected.cover_url && (
            <img
              src={`${selected.cover_url}?v=${encodeURIComponent(selected.updated_at)}`}
              alt=""
              className="h-48 w-full rounded-box object-cover"
            />
          )}
          <h2 className="text-xl font-semibold">{selected.title}</h2>
          <p className="whitespace-pre-wrap">{selected.description}</p>
          {selected.is_hidden && (
            <p role="status">
              Hidden from new assignments. Existing assignments remain
              available.
            </p>
          )}
          {selected.can_manage && (
            <div className="flex flex-wrap gap-2">
              <button className="btn" onClick={() => setEditing(true)}>
                Edit collection
              </button>
              <button className="btn" onClick={() => setDeleting(true)}>
                Delete collection
              </button>
            </div>
          )}
          {remove.isError && (
            <p role="alert">
              {errMsg(remove.error, 'Could not delete the collection.')}
            </p>
          )}
        </div>
        {patientView ? (
          <CollectionPractice key={selected.id} collectionId={selected.id} />
        ) : (
          <SlpExerciseCatalog
            key={selected.id}
            collectionId={selected.id}
            readOnly={!selected.can_manage}
          />
        )}
        <ModalConfirm
          isOpen={deleting}
          title="Delete collection?"
          description="The collection and its exercises will be removed from your catalog. Existing patient assignments and exercise history are preserved."
          confirmText="Delete collection"
          cancelText="Cancel"
          states={{ isLoading: remove.isPending }}
          onConfirm={() => remove.mutate()}
          onCancel={() => setDeleting(false)}
        />
      </div>
    )
  return (
    <div className="space-y-4">
      {!patientView && (
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-neutral" onClick={() => setCreating(true)}>
            New collection
          </button>
          <button className="btn" onClick={() => setAllExercises(true)}>
            All exercises
          </button>
        </div>
      )}
      {collections.isPending ? (
        <StateLoading />
      ) : collections.isError ? (
        <StateError />
      ) : (
        <>
          {collections.data.data.length === 0 && (
            <p>
              {patientView
                ? 'No practice collections are available to you yet.'
                : 'No collections yet. Create one to organize your exercises.'}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.data.data.map((collection) => (
              <button
                key={collection.id}
                className="overflow-hidden rounded-box border border-base-300 text-left"
                onClick={() => setSelected(collection)}
              >
                {collection.cover_url && (
                  <img
                    src={collection.cover_url}
                    alt=""
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="space-y-2 p-4">
                  <h2 className="font-semibold">{collection.title}</h2>
                  <p className="line-clamp-3">{collection.description}</p>
                  <p>
                    {patientView
                      ? 'Open practice collection'
                      : `${collection.exercises_count ?? 0} exercises`}
                    {collection.is_hidden ? ' · Hidden' : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <Pagination
            meta={collections.data.meta}
            page={page}
            updateSearch={({ page: next }) => setPage(next)}
          />
        </>
      )}
    </div>
  )
}
