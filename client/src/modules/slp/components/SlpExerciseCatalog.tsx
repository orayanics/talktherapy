import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { TableBase } from '#/components/Table/TableBase'
import Pagination from '#/components/Page/Pagination'
import FilterDrawer from '#/components/Page/FilterDrawer'
import { SearchFilter } from '#/components/Page/Filters'
import FormInput from '#/components/Form/FormInput'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'
import StateNull from '#/components/State/StateNull'
import ExerciseDelivery from './ExerciseDelivery'
import { fetchSlpExercises } from '../api/exercises'
import type { SlpExerciseFilters } from '../api/exercises'
import { slpExerciseModules } from '../types/exercises'

export default function SlpExerciseCatalog() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<SlpExerciseFilters>({})
  const { data, isPending, isError } = useQuery(
    fetchSlpExercises(page, filters),
  )
  const updateFilters = (next: Partial<SlpExerciseFilters>) => {
    setFilters((current) => ({ ...current, ...next }))
    setPage(1)
  }

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
        <Link to="/slp/exercises/create" className="btn btn-neutral">
          New draft
        </Link>
      </div>

      <div className="bg-white rounded-box border border-border overflow-hidden flex flex-col">
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
                header: 'Revision',
                render: (exercise) => exercise.latest_version?.revision,
              },
              {
                header: 'Delivery',
                render: (exercise) => (
                  <ExerciseDelivery
                    key={exercise.latest_version?.id}
                    exercise={exercise}
                  />
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
