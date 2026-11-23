
export default function AssignedExerciseItem({
  exercise,
  unassign,
}: {
  exercise: { id: string; prompt: string }
  unassign: { isPending: boolean; mutate: (id: string) => void }
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span>{exercise.prompt}</span>
      <button
        type="button"
        className="btn btn-ghost btn-xs text-error"
        disabled={unassign.isPending}
        onClick={() => unassign.mutate(exercise.id)}
      >
        Unassign
      </button>
    </li>
  )
}
