import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'
import Pagination from '#/components/Page/Pagination'
import { fetchCollectionPractice } from '../api/collections'
import ExercisePreview from './ExercisePreview'
import AssignedExercise from './AssignedExercise'

export default function CollectionPractice({
  collectionId,
}: {
  collectionId: string
}) {
  const [page, setPage] = useState(1)
  const [active, setActive] = useState<string | null>(null)
  const query = useQuery(fetchCollectionPractice(collectionId, page))
  if (query.isPending) return <StateLoading />
  if (query.isError) return <StateError />
  return (
    <div className="space-y-4">
      {!query.data.data.length && (
        <p>No exercises are currently available in this collection.</p>
      )}
      {query.data.data.map((exercise) => (
        <section
          key={exercise.id}
          className="space-y-3 rounded-box border border-base-300 p-4"
        >
          <h3 className="text-lg font-semibold">{exercise.prompt_text}</h3>
          {(exercise.assets ?? []).map((asset) =>
            asset.mime_type?.startsWith('image/') ? (
              <img
                key={asset.id}
                src={asset.url}
                alt="Exercise media"
                className="max-h-48 rounded-box object-contain"
              />
            ) : asset.mime_type?.startsWith('audio/') ? (
              <audio
                key={asset.id}
                src={asset.url}
                controls
                aria-label="Exercise media"
                className="w-full"
              />
            ) : null,
          )}
          <p>
            {exercise.task_type.replaceAll('_', ' ')} · {exercise.language}
            {exercise.assignment_id ? ' · Assigned to you' : ''}
          </p>
          <button
            className="btn"
            aria-expanded={active === exercise.id}
            onClick={() =>
              setActive(active === exercise.id ? null : exercise.id)
            }
          >
            {active === exercise.id ? 'Close practice' : 'Practise'}
          </button>
          {active === exercise.id &&
            (exercise.assignment_id ? (
              <AssignedExercise assignmentId={exercise.assignment_id} />
            ) : (
              <ExercisePreview version={exercise} />
            ))}
        </section>
      ))}
      <Pagination
        meta={query.data.meta}
        page={page}
        updateSearch={({ page: next }) => {
          setPage(next)
          setActive(null)
        }}
      />
    </div>
  )
}
