import { useMutation } from '@tanstack/react-query'
import { api } from '#/lib/api/client'
import { errMsg } from '#/lib/errorMessage'
import usePracticeRecorder from '../hooks/usePracticeRecorder'
import type { SlpExercise } from '../api/exercises'
import type { PracticeExercise } from '../api/collections'
import type { AssessResponse } from '../api/slp'

export default function ExercisePreview({
  exercise,
  version,
}: {
  exercise?: SlpExercise
  version?: PracticeExercise
}) {
  const content = version ?? exercise?.latest_version
  const recorder = usePracticeRecorder()
  const assess = useMutation({
    mutationFn: async () => {
      const data = new FormData()
      data.append('audio', recorder.audio!, recorder.audio!.type.includes('wav') ? 'recording.wav' : 'recording.webm')
      if (version) data.append('exercise_version_id', version.id)
      else data.append('exercise_id', exercise!.id)
      return api<{ data: AssessResponse }>('/api/v1/slp/assess', {
        method: 'POST',
        data,
        timeout: 50_000,
      })
    },
  })
  if (!['en', 'tl'].includes(content?.language ?? ''))
    return <p>Speech preview supports English and Filipino only.</p>
  return (
    <section
      aria-label={version ? 'Speech practice' : 'Speech preview'}
      className="space-y-3"
    >
      <p>{content?.prompt_text}</p>
      <p>
        Record up to 60 seconds to practise this exercise. This feedback is not
        a diagnosis.
      </p>
      {recorder.url && (
        <audio controls src={recorder.url} aria-label="Preview recording" />
      )}
      <div className="flex flex-wrap gap-2">
        {recorder.state === 'recording' ? (
          <button className="btn" onClick={recorder.stop}>
            Stop recording
          </button>
        ) : (
          <button
            className="btn"
            disabled={
              assess.isPending || recorder.state === 'requesting_permission'
            }
            onClick={() => {
              assess.reset()
              void recorder.start()
            }}
          >
            {recorder.error
              ? 'Retry recording'
              : version
                ? 'Record'
                : 'Record preview'}
          </button>
        )}
        <button
          className="btn"
          disabled={
            !recorder.audio ||
            assess.isPending ||
            recorder.state === 'recording'
          }
          onClick={() => assess.mutate()}
        >
          {assess.isPending ? 'Processing…' : 'Check recording'}
        </button>
      </div>
      {recorder.error && <p role="alert">{recorder.error}</p>}
      {assess.isError && (
        <p role="alert">
          {errMsg(
            assess.error,
            'Speech processing is unavailable. Please try again.',
          )}
        </p>
      )}
      {assess.data && <p role="status">{assess.data.data.feedback.text}</p>}
    </section>
  )
}
