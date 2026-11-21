import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import { api } from '#/lib/api/client'
import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query'
import { useEffect,useState } from 'react'
import type { SlpReviewAttempt } from '../api/workflow'
import {
fetchSlpRecording,
fetchSlpReviewAttempts,
mutateApproveSlpReview,
mutateSaveSlpReview,
slpWorkflowKeys,
} from '../api/workflow'

export default function SlpReviewInbox() {
  const client = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [annotation, setAnnotation] = useState('')
  const { data, isPending, isError } = useQuery(fetchSlpReviewAttempts())
  const selected = data?.data.find((item) => item.id === selectedId) ?? null
  const recording = useQuery({
    ...fetchSlpRecording(selected?.id ?? ''),
    enabled: selected?.recording !== null && selected !== null,
  })
  const [audio, setAudio] = useState<{ id: string; url: string } | null>(null)
  useEffect(() => {
    if (!recording.data || !selectedId) return
    const url = URL.createObjectURL(recording.data)
    setAudio({ id: selectedId, url })
    return () => URL.revokeObjectURL(url)
  }, [recording.data, selectedId])
  const save = useMutation({
    mutationFn: () =>
      mutateSaveSlpReview(selected!.id, {
        annotations: [{ text: annotation.trim() }],
      }),
    onSuccess: () => {
      return client.invalidateQueries({
        queryKey: slpWorkflowKeys.reviewAttempts,
      })
    },
  })
  const approve = useMutation({
    mutationFn: (id: string) => mutateApproveSlpReview(id),
    onSuccess: () => {
      setSelectedId(null)
      setAnnotation('')
      void client.invalidateQueries({
        queryKey: slpWorkflowKeys.reviewAttempts,
      })
    },
  })
  const requestRecording = useMutation({
    mutationFn: (id: string) =>
      api(`/api/v1/slp/attempts/${id}/request-recording`, { method: 'POST' }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: slpWorkflowKeys.reviewAttempts }),
  })
  if (isPending) return <StateLoading />
  if (isError) return <StateError />
  if (!data.data.length)
    return <p role="status">No recordings are waiting for review.</p>

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <section aria-label="Review attempts" className="space-y-3">
        {data.data.map((attempt) => (
          <ReviewAttemptButton
            key={attempt.id}
            selectedId={selectedId}
            attempt={attempt}
            setSelectedId={setSelectedId}
            setAnnotation={setAnnotation}
          />
        ))}
      </section>
      {selected && (
        <div className="space-y-3">
          <ReviewPanel
            key={selected.id}
            attempt={selected}
            recordingUrl={audio?.id === selected.id ? audio.url : null}
            annotation={annotation}
            setAnnotation={setAnnotation}
            reviewId={
              annotation.trim() ===
              String(selected.latest_review?.annotations?.[0]?.text ?? '')
                ? (selected.latest_review?.id ?? null)
                : null
            }
            savePending={save.isPending}
            approvePending={approve.isPending}
            onSave={() => save.mutate()}
            onApprove={() =>
              selected.latest_review &&
              approve.mutate(selected.latest_review.id)
            }
            error={save.isError || approve.isError}
          />
          <button
            type="button"
            className="btn"
            disabled={
              requestRecording.isPending || save.isPending || approve.isPending
            }
            onClick={() => requestRecording.mutate(selected.id)}
          >
            Request clearer recording
          </button>
          {requestRecording.isError && (
            <p role="alert">Could not request another recording.</p>
          )}
        </div>
      )}
    </div>
  )
}

function ReviewPanel({
  attempt,
  recordingUrl,
  annotation,
  setAnnotation,
  reviewId,
  savePending,
  approvePending,
  onSave,
  onApprove,
  error,
}: {
  attempt: SlpReviewAttempt
  recordingUrl: string | null
  annotation: string
  setAnnotation: (value: string) => void
  reviewId: string | null
  savePending: boolean
  approvePending: boolean
  onSave: () => void
  onApprove: () => void
  error: boolean
}) {
  const [listened, setListened] = useState(false)
  const result = attempt.analysis?.result as
    | { analysis?: { transcript?: string }; feedback?: { text?: string } }
    | undefined
  return (
    <section
      aria-label="Review detail"
      className="space-y-4 rounded-box border border-base-300 p-5"
    >
      <div>
        <h2 className="text-xl font-semibold">
          {attempt.exercise.prompt_text}
        </h2>
        <p className="text-sm text-base-content/70">
          {attempt.patient.name ?? 'Patient'} · {attempt.exercise.language}
        </p>
      </div>
      {recordingUrl ? (
        <audio
          controls
          src={recordingUrl}
          onEnded={() => setListened(true)}
          className="w-full"
          aria-label="Patient recording"
        />
      ) : (
        <p>Loading recording…</p>
      )}
      {listened && result ? (
        <details className="rounded-box bg-base-200 p-3 text-sm">
          <summary>Show automated transcript</summary>
          <p>
            <strong>Transcript:</strong>{' '}
            {result?.analysis?.transcript ?? 'Not available'}
          </p>
          {result?.feedback?.text && (
            <p className="mt-2">
              <strong>Service note:</strong> {result.feedback.text}
            </p>
          )}
        </details>
      ) : (
        <p>
          {result
            ? 'Listen to the recording to reveal the transcript.'
            : 'You can review the audio without a transcript.'}
        </p>
      )}
      <label className="form-control">
        <span className="label-text font-medium">Clinician notes</span>
        <textarea
          className="textarea textarea-bordered min-h-32"
          value={annotation}
          onChange={(event) => setAnnotation(event.target.value)}
          placeholder="What I heard… What went well… One thing to try next…"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn"
          disabled={!annotation.trim() || savePending}
          onClick={onSave}
        >
          {savePending ? 'Saving…' : 'Save review'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!reviewId || approvePending}
          onClick={onApprove}
        >
          {approvePending ? 'Approving…' : 'Approve review'}
        </button>
      </div>
      {error && (
        <p role="alert">Could not save the review. Please try again.</p>
      )}
    </section>
  )
}

import ReviewAttemptButton from './ReviewAttemptButton'
