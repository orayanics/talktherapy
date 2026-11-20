import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import {
  fetchSlpRecording,
  fetchSlpReviewAttempts,
  mutateApproveSlpReview,
  mutateSaveSlpReview,
  slpWorkflowKeys,
} from '../api/workflow'
import type { SlpReviewAttempt } from '../api/workflow'

export default function SlpReviewInbox() {
  const client = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [annotation, setAnnotation] = useState('')
  const [reviewId, setReviewId] = useState<string | null>(null)
  const { data, isPending, isError } = useQuery(fetchSlpReviewAttempts())
  const selected = data?.data.find((item) => item.id === selectedId) ?? null
  const recording = useQuery({
    ...fetchSlpRecording(selected?.id ?? ''),
    enabled: selected?.recording !== null && selected !== null,
  })
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!recording.data) return
    const url = URL.createObjectURL(recording.data)
    setRecordingUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [recording.data])
  const save = useMutation({
    mutationFn: () =>
      mutateSaveSlpReview(selected!.id, {
        annotations: [{ text: annotation.trim() }],
      }),
    onSuccess: (result: { data: { id: string } }) => {
      setReviewId(result.data.id)
      void client.invalidateQueries({
        queryKey: slpWorkflowKeys.reviewAttempts,
      })
    },
  })
  const approve = useMutation({
    mutationFn: () => mutateApproveSlpReview(reviewId!),
    onSuccess: () => {
      setSelectedId(null)
      setReviewId(null)
      setAnnotation('')
      void client.invalidateQueries({
        queryKey: slpWorkflowKeys.reviewAttempts,
      })
    },
  })
  if (isPending) return <StateLoading />
  if (isError) return <StateError />
  if (!data.data.length)
    return <p role="status">No recordings are waiting for review.</p>

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <section aria-label="Review attempts" className="space-y-3">
        {data.data.map((attempt) => (
          <button
            key={attempt.id}
            type="button"
            className={`w-full rounded-box border p-4 text-left ${selectedId === attempt.id ? 'border-primary bg-primary/5' : 'border-base-300'}`}
            onClick={() => {
              setSelectedId(attempt.id)
              setReviewId(attempt.latest_review?.id ?? null)
              setAnnotation('')
            }}
          >
            <span className="block font-semibold">
              {attempt.patient.name ?? 'Patient'}
            </span>
            <span className="block text-sm">
              {attempt.exercise.prompt_text}
            </span>
            <span className="mt-1 block text-xs uppercase text-base-content/60">
              {attempt.status.replaceAll('_', ' ')}
            </span>
          </button>
        ))}
      </section>
      {selected && (
        <ReviewPanel
          attempt={selected}
          recordingUrl={recordingUrl}
          annotation={annotation}
          setAnnotation={setAnnotation}
          reviewId={reviewId}
          savePending={save.isPending}
          approvePending={approve.isPending}
          onSave={() => save.mutate()}
          onApprove={() => approve.mutate()}
          error={save.isError || approve.isError}
        />
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
          className="w-full"
          aria-label="Patient recording"
        />
      ) : (
        <p>Loading recording…</p>
      )}
      <div className="rounded-box bg-base-200 p-3 text-sm">
        <p>
          <strong>Transcript:</strong>{' '}
          {result?.analysis?.transcript ?? 'Not available'}
        </p>
        {result?.feedback?.text && (
          <p className="mt-2">
            <strong>Service note:</strong> {result.feedback.text}
          </p>
        )}
      </div>
      <label className="form-control">
        <span className="label-text font-medium">Clinician notes</span>
        <textarea
          className="textarea textarea-bordered min-h-32"
          value={annotation}
          onChange={(event) => setAnnotation(event.target.value)}
          placeholder="Record observations or corrections"
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
