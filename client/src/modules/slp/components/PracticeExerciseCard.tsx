import type { PracticeExercise } from '../api/collections'
import AssignedExercise from './AssignedExercise'
import ExercisePreview from './ExercisePreview'

export default function PracticeExerciseCard({
  exercise,
  active,
  setActive,
}: {
  exercise: PracticeExercise
  active: string | null
  setActive: React.Dispatch<React.SetStateAction<string | null>>
}) {
  return (
    <section className="space-y-3 rounded-box border border-base-300 p-4">
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
        onClick={() => setActive(active === exercise.id ? null : exercise.id)}
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
  )
}
