import { useRef, useState } from 'react'
import { api } from '#/lib/api/client'
import { useSession } from '#/modules/auth/context/SessionContext'
import { errMsg } from '#/lib/errorMessage'
import usePracticeRecorder from '../hooks/usePracticeRecorder'

export default function AssignedExercise({ assignmentId }: { assignmentId: string }) {
  const session = useSession()
  const recorder = usePracticeRecorder()
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const attemptId = useRef<string | null>(null)
  const submissionKey = useRef(crypto.randomUUID())
  const submit = async () => {
    if (!recorder.audio || busy || !consent) return
    setBusy(true)
    setError(null)
    try {
      if (!attemptId.current) {
        const accepted = await api<{ data: { id: string } }>('/api/v1/slp/consents', { method: 'POST', data: { subject_id: session.id, purpose: 'slp_recording', policy_version: 'v1' } })
        const attempt = await api<{ data: { id: string } }>(`/api/v1/slp/assignments/${assignmentId}/attempts`, { method: 'POST', data: { consent_id: accepted.data.id, submission_key: submissionKey.current } })
        attemptId.current = attempt.data.id
      }
      const data = new FormData()
      data.append('recording', recorder.audio, 'recording.webm')
      await api(`/api/v1/slp/attempts/${attemptId.current}/recording`, { method: 'POST', data })
      recorder.clear()
      setSent(true)
    } catch (cause) { setError(errMsg(cause, 'Could not submit. Your recording is still available to retry.')) }
    finally { setBusy(false) }
  }
  if (sent) return <p role="status">Thank you. Your recording has been submitted for clinician review.</p>
  return <div className="space-y-3 mt-3">
    <p>Read the prompt at a comfortable pace. You can stop, listen, and try again before submitting. Each recording lasts up to 60 seconds.</p>
    <label className="flex gap-2"><input type="checkbox" checked={consent} disabled={busy} onChange={(e) => setConsent(e.target.checked)} />I agree to submit this voice recording for review by my assigned clinician. This testing exercise is not a diagnosis.</label>
    {recorder.error && <p role="alert">{recorder.error}</p>}
    {error && <p role="alert">{error}</p>}
    {recorder.url && <audio controls src={recorder.url} aria-label="Your recording" />}
    {recorder.state === 'recording' ? <button className="btn" onClick={recorder.stop}>Stop recording</button> : <button className="btn" disabled={!consent || busy || recorder.state === 'requesting_permission'} onClick={() => void recorder.start()}>{recorder.audio ? 'Record again' : 'Record'}</button>}
    <button className="btn btn-neutral ml-2" disabled={!consent || !recorder.audio || busy} onClick={() => void submit()}>{busy ? 'Submitting…' : 'Submit recording'}</button>
  </div>
}
