import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '#/lib/api/client'
import { useSession } from '#/modules/auth/context/SessionContext'
import { errMsg } from '#/lib/errorMessage'
import usePracticeRecorder from '../hooks/usePracticeRecorder'
import { Tala } from './PracticeRewards'
import { fetchSlpAttempt } from '../api/workflow'

export default function AssignedExercise({
  assignmentId,
  onNavigationLockChange,
}: {
  assignmentId: string
  onNavigationLockChange?: (locked: boolean) => void
}) {
  const session = useSession()
  const recorder = usePracticeRecorder()
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    onNavigationLockChange?.(busy || recorder.state === 'recording' || recorder.state === 'requesting_permission')
  }, [busy, recorder.state, onNavigationLockChange])
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const attemptId = useRef<string | null>(null)
  const submissionKey = useRef(crypto.randomUUID())
  const [submittedAttemptId, setSubmittedAttemptId] = useState<string | null>(
    null,
  )
  const attempt = useQuery({
    ...fetchSlpAttempt(submittedAttemptId ?? ''),
    enabled: submittedAttemptId !== null,
    refetchInterval: (query) =>
      ['queued', 'running'].includes(
        query.state.data?.data.analysis_status ?? '',
      )
        ? 2000
        : false,
  })
  const submit = async () => {
    if (!recorder.audio || busy || !consent) return
    setBusy(true)
    setError(null)
    try {
      if (!attemptId.current) {
        const accepted = await api<{ data: { id: string } }>(
          '/api/v1/slp/consents',
          {
            method: 'POST',
            data: {
              subject_id: session.id,
              purpose: 'slp_recording',
              policy_version: 'v1',
            },
          },
        )
        const attempt = await api<{ data: { id: string } }>(
          `/api/v1/slp/assignments/${assignmentId}/attempts`,
          {
            method: 'POST',
            data: {
              consent_id: accepted.data.id,
              submission_key: submissionKey.current,
            },
          },
        )
        attemptId.current = attempt.data.id
        setSubmittedAttemptId(attempt.data.id)
      }
      const data = new FormData()
      data.append('recording', recorder.audio, 'recording.webm')
      await api(`/api/v1/slp/attempts/${attemptId.current}/recording`, {
        method: 'POST',
        data,
      })
      recorder.clear()
      setSent(true)
    } catch (cause) {
      setError(
        errMsg(
          cause,
          'Could not submit. Your recording is still available to retry.',
        ),
      )
    } finally {
      setBusy(false)
    }
  }
  if (sent)
    return (
      <div
        className="mt-4 flex items-center gap-3 rounded-box bg-[var(--practice-tint)] p-4"
        role="status"
      >
        <Tala mood="cheer" size={48} />
        <div>
          <p className="font-semibold">
            {attempt.data?.data.status === 'failed'
              ? 'Analysis could not be completed. Please try a new recording.'
              : attempt.data?.data.status === 'awaiting_review'
                ? 'Your recording has been analyzed and is ready for clinician review.'
                : 'Your recording is being processed for clinician review.'}
          </p>
          {attempt.data?.data.status === 'failed' && (
            <button
              className="tt-btn alt mt-3"
              onClick={() => {
                attemptId.current = null
                submissionKey.current = crypto.randomUUID()
                setSubmittedAttemptId(null)
                setSent(false)
              }}
            >
              Record another
            </button>
          )}
        </div>
      </div>
    )
  return (
    <div className="mt-4 space-y-4 rounded-box border-2 border-[var(--practice-tint)] bg-white p-4">
      <div className="flex items-start gap-3">
        <Tala mood="idle" size={48} />
        <p className="text-sm leading-relaxed">
          Read the prompt at a comfortable pace. You can stop, listen, and try
          again before submitting. Each recording lasts up to 60 seconds.
        </p>
      </div>
      <label className="flex min-h-12 items-start gap-3 text-sm leading-relaxed">
        <input
          className="mt-1"
          type="checkbox"
          checked={consent}
          disabled={busy}
          onChange={(e) => setConsent(e.target.checked)}
        />
        I agree to submit this voice recording for review by my assigned
        clinician. This testing exercise is not a diagnosis.
      </label>
      {recorder.error && (
        <p
          className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {recorder.error}
        </p>
      )}
      {error && (
        <p
          className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}
      {recorder.url && (
        <audio
          className="w-full"
          controls
          src={recorder.url}
          aria-label="Your recording"
        />
      )}
      <div className="flex flex-wrap gap-3">
        {recorder.state === 'recording' ? (
          <button className="tt-btn" onClick={recorder.stop}>
            Stop recording
          </button>
        ) : (
          <button
            className="tt-btn"
            disabled={
              !consent || busy || recorder.state === 'requesting_permission'
            }
            onClick={() => void recorder.start()}
          >
            {recorder.audio ? 'Record again' : 'Record'}
          </button>
        )}
        <button
          className="tt-btn alt"
          disabled={!consent || !recorder.audio || busy}
          onClick={() => void submit()}
        >
          {busy ? 'Submitting…' : 'Submit recording'}
        </button>
      </div>
    </div>
  )
}
