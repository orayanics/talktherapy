import Pagination from '#/components/Page/Pagination'
import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchCollectionPractice } from '../api/collections'

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
        <PracticeExerciseCard
          key={exercise.id}
          exercise={exercise}
          active={active}
          setActive={setActive}
        />
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

import PracticeExerciseCard from './PracticeExerciseCard'
