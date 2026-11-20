import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TableBase } from '#/components/Table/TableBase'
import Pagination from '#/components/Page/Pagination'
import FilterDrawer from '#/components/Page/FilterDrawer'
import { SearchFilter } from '#/components/Page/Filters'
import FormInput from '#/components/Form/FormInput'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'
import StateNull from '#/components/State/StateNull'
import ExerciseDelivery from './ExerciseDelivery'
import CreateSlpExercisePage from './CreateSlpExercisePage'
import ExerciseActions from './ExerciseActions'
import BulkExerciseAssignment from './BulkExerciseAssignment'
import { fetchSlpExercises } from '../api/exercises'
import type { SlpExercise, SlpExerciseFilters } from '../api/exercises'
import { slpExerciseModules } from '../types/exercises'

export default function SlpExerciseCatalog({
  collectionId,
  readOnly = false,
}: {
  collectionId?: string
  readOnly?: boolean
}) {
  const [creating, setCreating] = useState(false)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<SlpExerciseFilters>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { data, isPending, isError } = useQuery(
    fetchSlpExercises(
      page,
      collectionId ? { ...filters, collection_id: collectionId } : filters,
    ),
  )
  const updateFilters = (next: Partial<SlpExerciseFilters>) => {
    setFilters((current) => ({ ...current, ...next }))
    setPage(1)
  }
  useEffect(() => setSelectedIds(new Set()), [page])
  const selectedExercises =
    data?.data.filter((exercise) => selectedIds.has(exercise.id)) ?? []
  const toggleExercise = (id: string) =>
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <SearchFilter
            label="Language code"
            placeholder="Language code (e.g. en, tl)"
            value={filters.language ?? ''}
            onChange={(language) =>
              updateFilters({ language: language.trim() || undefined })
            }
          />
          <FilterDrawer>
            <div className="space-y-6">
              <FormInput htmlFor="slpexercisecatalog-field-1" label="Module">
                <select
                  id="slpexercisecatalog-field-1"
                  aria-label="Module"
                  className="select w-full"
                  value={filters.module ?? ''}
                  onChange={(event) =>
                    updateFilters({
                      module:
                        (event.target.value as SlpExerciseFilters['module']) ||
                        undefined,
                    })
                  }
                >
                  <option value="">All modules</option>
                  {slpExerciseModules.map((module) => (
                    <option key={module} value={module}>
                      {module.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </FormInput>
              <FormInput htmlFor="slpexercisecatalog-field-2" label="Scope">
                <select
                  id="slpexercisecatalog-field-2"
                  aria-label="Scope"
                  className="select w-full"
                  value={filters.scope ?? ''}
                  onChange={(event) =>
                    updateFilters({
                      scope:
                        (event.target.value as SlpExerciseFilters['scope']) ||
                        undefined,
                    })
                  }
                >
                  <option value="">All scopes</option>
                  <option value="private">Private</option>
                  <option value="shared">Shared catalog</option>
                </select>
              </FormInput>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setFilters({})
                  setPage(1)
                }}
              >
                Clear filters
              </button>
            </div>
          </FilterDrawer>
        </div>
        {!readOnly && collectionId ? (
          <button
            className="btn btn-neutral"
            onClick={() => setCreating(!creating)}
          >
            {creating ? 'Close new exercise' : 'New exercise'}
          </button>
        ) : null}
      </div>
      {!readOnly && (
        <div className="alert alert-soft alert-info" role="note">
          <div>
            <p className="font-medium">Two ways to deliver an exercise</p>
            <p className="text-sm">
              Patient visibility lets patients discover an exercise. Assignments
              put it directly in My assignments. Select published exercises in
              the table to assign several at once.
            </p>
          </div>
          {selectedExercises.length > 0 && (
            <BulkExerciseAssignment
              exercises={selectedExercises}
              onAssigned={() => setSelectedIds(new Set())}
            />
          )}
        </div>
      )}

      {creating && (
        <CreateSlpExercisePage
          collectionId={collectionId}
          onSaved={() => setCreating(false)}
        />
      )}

      <div className="overflow-hidden flex flex-col">
        {isPending ? (
          <StateLoading />
        ) : isError ? (
          <StateError />
        ) : data.data.length === 0 ? (
          <StateNull
            title="No exercises found"
            message="Try adjusting the module, language, or scope filters."
          />
        ) : (
          <TableBase
            data={data.data}
            keyExtractor={(exercise) => exercise.id}
            columns={[
              ...(!readOnly
                ? [
                    {
                      header: (
                        <input
                          type="checkbox"
                          className="checkbox"
                          aria-label="Select all exercises on this page"
                          checked={
                            data.data.length > 0 &&
                            data.data.every((exercise) =>
                              selectedIds.has(exercise.id),
                            )
                          }
                          onChange={(event) =>
                            setSelectedIds((current) => {
                              const next = new Set(current)
                              data.data.forEach((exercise) =>
                                event.target.checked
                                  ? next.add(exercise.id)
                                  : next.delete(exercise.id),
                              )
                              return next
                            })
                          }
                        />
                      ),
                      render: (exercise: SlpExercise) => (
                        <input
                          type="checkbox"
                          className="checkbox"
                          aria-label={`Select ${exercise.latest_version?.prompt_text ?? 'exercise'}`}
                          checked={selectedIds.has(exercise.id)}
                          onChange={() => toggleExercise(exercise.id)}
                        />
                      ),
                    },
                  ]
                : []),
              {
                header: 'Exercise',
                render: (exercise) => exercise.latest_version?.prompt_text,
              },
              {
                header: 'Module',
                render: (exercise) => exercise.module.replaceAll('_', ' '),
              },
              {
                header: 'Language',
                render: (exercise) => exercise.latest_version?.language,
              },
              { header: 'Scope', accessor: 'scope' },
              {
                header: 'Manage',
                render: (exercise) => (
                  <ExerciseActions
                    key={`${exercise.id}-${exercise.updated_at}-${exercise.is_hidden}`}
                    exercise={exercise}
                  />
                ),
              },
              {
                header: 'Revision',
                render: (exercise) => exercise.latest_version?.revision,
              },
              {
                header: 'Status',
                render: (exercise) => exercise.latest_version?.status,
              },
              {
                header: 'Delivery',
                render: (exercise) =>
                  exercise.can_manage ? (
                    <ExerciseDelivery
                      key={exercise.latest_version?.id}
                      exercise={exercise}
                    />
                  ) : (
                    <span>Read only</span>
                  ),
              },
            ]}
          />
        )}
        {data && !isError && (
          <Pagination
            meta={data.meta}
            page={page}
            updateSearch={({ page: next }) => setPage(next)}
          />
        )}
      </div>
    </div>
  )
}
