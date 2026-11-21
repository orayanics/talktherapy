import AssignedExerciseItem from './AssignedExerciseItem'

export default function AssignedCollectionItem({
  collection,
  unassign,
}: {
  collection: {
    title: string
    exercises: { id: string; prompt: string }[]
  }
  unassign: { isPending: boolean; mutate: (id: string) => void }
}) {
  return (
    <li>
      <p className="font-medium">{collection.title}</p>
      <ul className="list-disc pl-5 text-sm text-slate-600">
        {collection.exercises.map((exercise) => (
          <AssignedExerciseItem
            key={exercise.id}
            exercise={exercise}
            unassign={unassign}
          />
        ))}
      </ul>
    </li>
  )
}
