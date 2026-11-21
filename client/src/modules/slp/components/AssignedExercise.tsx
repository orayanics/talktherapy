import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, LoaderCircle, Mic, Send, Square } from 'lucide-react'
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
  const [busy, setBusy] = useState(false)
  const [agreed, setAgreed] = useState(false)
  useEffect(() => {
    onNavigationLockChange?.(
      busy ||
        recorder.state === 'recording' ||
        recorder.state === 'requesting_permission',
    )
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
    if (!recorder.audio || busy || !agreed) return
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
              accepted: agreed,
            },
          },
        )
        const createdAttempt = await api<{ data: { id: string } }>(
          `/api/v1/slp/assignments/${assignmentId}/attempts`,
          {
            method: 'POST',
            data: {
              consent_id: accepted.data.id,
              submission_key: submissionKey.current,
            },
          },
        )
        attemptId.current = createdAttempt.data.id
      }
      const data = new FormData()
      data.append(
        'recording',
        recorder.audio,
        recorder.audio.type.includes('wav')
          ? 'recording.wav'
          : 'recording.webm',
      )
      await api(`/api/v1/slp/attempts/${attemptId.current}/recording`, {
        method: 'POST',
        data,
      })
      recorder.clear()
      setSubmittedAttemptId(attemptId.current)
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
      <div className="slp-recording-success" role="status">
        <Tala mood="cheer" size={48} />
        <div>
          <p className="slp-recording-status">
            <Check size={16} aria-hidden="true" /> Recording sent
          </p>
          <p className="font-semibold">
            {attempt.data?.data.status === 'failed'
              ? 'Analysis could not be completed. Please try a new recording.'
              : attempt.data?.data.status === 'awaiting_review'
                ? 'Your recording has been analyzed and is ready for clinician review.'
                : 'Your recording is being processed for clinician review.'}
          </p>
          {attempt.data?.data.status === 'failed' && (
            <button
              className="slp-secondary-button mt-3"
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
    <div className="slp-recorder">
      <div className="slp-recorder-intro">
        <Tala mood="idle" size={48} />
        <p className="text-sm leading-relaxed">
          Read the prompt at a comfortable pace. You can stop, listen, and try
          again before submitting.
        </p>
      </div>
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
      <div className="slp-recording-actions">
        <label>
          <input
            type="checkbox"
            checked={agreed}
            disabled={busy}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          I agree to send this recording for automated transcription and
          clinician review. Audio expires after 30 days. Analysis and clinician
          reports are stored separately. (Recording policy v1)
        </label>
        {recorder.state === 'recording' ? (
          <button
            type="button"
            className="slp-record-button"
            data-recording="true"
            onClick={recorder.stop}
          >
            <Square size={18} fill="currentColor" aria-hidden="true" />
            Stop recording
          </button>
        ) : (
          <button
            type="button"
            className="slp-record-button"
            disabled={busy || recorder.state === 'requesting_permission'}
            onClick={() => void recorder.start()}
          >
            {recorder.state === 'requesting_permission' ? (
              <LoaderCircle
                className="slp-recording-spinner"
                size={20}
                aria-hidden="true"
              />
            ) : (
              <Mic size={20} aria-hidden="true" />
            )}
            {recorder.state === 'requesting_permission'
              ? 'Connecting mic…'
              : recorder.error
                ? 'Retry recording'
                : recorder.audio
                  ? 'Record again'
                  : 'Start recording'}
          </button>
        )}
        <button
          type="button"
          className="slp-send-button"
          disabled={!recorder.audio || busy || !agreed}
          onClick={() => void submit()}
        >
          {busy ? (
            <LoaderCircle
              className="slp-recording-spinner"
              size={18}
              aria-hidden="true"
            />
          ) : (
            <Send size={18} aria-hidden="true" />
          )}
          {busy ? 'Submitting…' : 'Send recording'}
        </button>
      </div>
    </div>
  )
}
