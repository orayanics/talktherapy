import type { SlpReviewAttempt } from '../api/workflow'

export default function ReviewAttemptButton({
  selectedId,
  attempt,
  setSelectedId,
  setAnnotation,
}: {
  selectedId: string | null
  attempt: SlpReviewAttempt
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>
  setAnnotation: React.Dispatch<React.SetStateAction<string>>
}) {
  return (
    <button
      type="button"
      className={`w-full rounded-box border p-4 text-left ${selectedId === attempt.id ? 'border-primary bg-primary/5' : 'border-base-300'}`}
      onClick={() => {
        setSelectedId(attempt.id)
        setAnnotation(
          String(attempt.latest_review?.annotations?.[0]?.text ?? ''),
        )
      }}
    >
      <span className="block font-semibold">
        {attempt.patient.name ?? 'Patient'}
      </span>
      <span className="block text-sm">{attempt.exercise.prompt_text}</span>
      <span className="mt-1 block text-xs uppercase text-base-content/60">
        {attempt.status.replaceAll('_', ' ')}
      </span>
    </button>
  )
}
