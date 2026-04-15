import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react'

export const Route = createFileRoute('/slp/')({
  component: RouteComponent,
})

type PhonemeScore = {
  phoneme: string
  score: number
  word?: string | null
  wordIndex?: number | null
}

type StructuredWordUnit = {
  unit: string
  score: number
}

type StructuredWord = {
  word: string
  avgScore: number
  status: 'accurate' | 'mixed' | 'needs_work' | 'unknown'
  lowUnits: StructuredWordUnit[]
}

type StructuredUnit = {
  unit: string
  avgScore: number
  examples?: string[]
}

type FeedbackStructured = {
  reference: string
  transcript: string
  overall: {
    avgScore: number
    percentAboveNeedsWork: number
    status: 'accurate' | 'mixed' | 'needs_work' | 'unknown'
  }
  words: StructuredWord[]
  accurateUnits: StructuredUnit[]
  needsWorkUnits: StructuredUnit[]
  llm?: {
    overallSummary?: string
    nextPractice?: string[]
  }
  llmError?: string
  llmRaw?: string
}

type AssessResponse = {
  transcript: string
  lowScoring: PhonemeScore[]
  feedback: string
  feedbackStructured?: FeedbackStructured | null
}

type AssessResponseV2 = {
  meta?: {
    alignmentSource?: string
    cer?: number
  }
  analysis?: {
    transcript?: string
    lowScoring?: PhonemeScore[]
    structured?: Omit<FeedbackStructured, 'llm' | 'llmError' | 'llmRaw'>
  }
  feedback?: {
    text?: string
    structured?: {
      overallSummary?: string
      nextPractice?: string[]
    }
    llmError?: string | null
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeResponse(raw: unknown): AssessResponse {
  if (!isObject(raw)) {
    return {
      transcript: '',
      lowScoring: [],
      feedback: '',
      feedbackStructured: null,
    }
  }

  const maybeLegacy = raw as Partial<AssessResponse>
  if (Array.isArray(maybeLegacy.lowScoring)) {
    return {
      transcript: maybeLegacy.transcript ?? '',

      lowScoring: maybeLegacy.lowScoring,
      feedback: maybeLegacy.feedback ?? '',
      feedbackStructured: maybeLegacy.feedbackStructured ?? null,
    }
  }

  const v2 = raw as AssessResponseV2
  const transcript = v2.analysis?.transcript ?? ''
  const lowScoring = Array.isArray(v2.analysis?.lowScoring)
    ? v2.analysis?.lowScoring
    : []
  const feedback = v2.feedback?.text ?? ''

  const structuredCore = v2.analysis?.structured
  const llm = v2.feedback?.structured
  const llmError = v2.feedback?.llmError ?? undefined

  const feedbackStructured = structuredCore
    ? {
        ...structuredCore,
        llm,
        llmError,
      }
    : null

  return {
    transcript,
    lowScoring,
    feedback,
    feedbackStructured,
  }
}

const API_BASE = import.meta.env.VITE_SLP_API_URL ?? 'http://localhost:8000'

function RouteComponent() {
  const [referenceText, setReferenceText] = useState(
    'She sells sea shells by the sea shore.',
  )
  const [isRecording, setIsRecording] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [result, setResult] = useState<AssessResponse | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const sortedLowScores = useMemo(() => {
    if (!result) return []
    return [...(result.lowScoring ?? [])].sort((a, b) => a.score - b.score)
  }, [result])

  const startRecording = async () => {
    setError(null)
    setResult(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Microphone is not available in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        setAudioBlob(blob)

        if (audioUrl) URL.revokeObjectURL(audioUrl)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        for (const track of stream.getTracks()) track.stop()
      }

      recorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch {
      setError('Microphone permission denied or unavailable.')
    }
  }

  const stopRecording = () => {
    if (!recorderRef.current) return
    recorderRef.current.stop()
    setIsRecording(false)
  }

  const submitAssessment = async () => {
    setError(null)
    if (!audioBlob) {
      setError('Record audio first.')
      return
    }
    if (!referenceText.trim()) {
      setError('Reference text is required.')
      return
    }

    try {
      setIsSubmitting(true)
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('referenceText', referenceText)

      const response = await fetch(`${API_BASE}/assess`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Request failed with ${response.status}`)
      }

      const data = await response.json()
      setResult(normalizeResponse(data))
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to submit assessment.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStatusBadge = (
    status: FeedbackStructured['overall']['status'],
  ) => {
    const label =
      status === 'accurate'
        ? 'Accurate'
        : status === 'mixed'
          ? 'Mixed'
          : status === 'needs_work'
            ? 'Needs work'
            : 'Unknown'

    const className =
      status === 'accurate'
        ? 'badge badge-success'
        : status === 'mixed'
          ? 'badge badge-warning'
          : status === 'needs_work'
            ? 'badge badge-error'
            : 'badge'

    return <span className={className}>{label}</span>
  }

  const NEEDS_WORK_THRESHOLD = 65

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-6">
      <div className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">SLP Pronunciation Tester</h1>
        <p className="mt-2 text-sm text-base-content/70">
          Record speech from your microphone and compare pronunciation against a
          target sentence.
        </p>
      </div>

      <div className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
        <label className="label" htmlFor="referenceText">
          <span className="label-text font-medium">Reference sentence</span>
        </label>
        <textarea
          id="referenceText"
          className="textarea textarea-bordered min-h-28 w-full"
          value={referenceText}
          onChange={(event) => setReferenceText(event.target.value)}
          placeholder="Enter a sentence to practice"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="btn btn-primary"
            onClick={startRecording}
            disabled={isRecording || isSubmitting}
            type="button"
          >
            Start recording
          </button>
          <button
            className="btn btn-secondary"
            onClick={stopRecording}
            disabled={!isRecording || isSubmitting}
            type="button"
          >
            Stop
          </button>
          <button
            className="btn btn-accent"
            onClick={submitAssessment}
            disabled={!audioBlob || isRecording || isSubmitting}
            type="button"
          >
            {isSubmitting ? 'Analyzing...' : 'Assess pronunciation'}
          </button>
        </div>

        {isRecording && (
          <p className="mt-3 text-sm text-warning">Recording in progress...</p>
        )}

        {audioUrl && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium">Preview recording</p>
            <audio controls className="w-full" src={audioUrl} />
          </div>
        )}

        {error && <div className="alert alert-error mt-4">{error}</div>}
      </div>

      {result && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Decoded transcript</h2>
            <p className="mt-2 text-sm">{result.transcript || '(empty)'}</p>

            <h3 className="mt-5 text-base font-semibold">
              Low-confidence phonemes
            </h3>
            {sortedLowScores.length === 0 ? (
              <p className="mt-2 text-sm">No low-confidence phonemes found.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {sortedLowScores.map((item, index) => (
                  <li
                    key={`${item.phoneme}-${index}`}
                    className="flex items-center justify-between rounded-md border border-base-300 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="font-mono">{item.phoneme}</div>
                      {item.word ? (
                        <div className="truncate text-xs text-base-content/60">
                          in “{item.word}”
                        </div>
                      ) : null}
                    </div>
                    <span>{item.score.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
            <h2 className="text-lg font-semibold">AI feedback</h2>

            {result.feedbackStructured ? (
              <div className="mt-3 space-y-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {renderStatusBadge(result.feedbackStructured.overall.status)}
                  <span className="text-base-content/70">
                    Avg {result.feedbackStructured.overall.avgScore.toFixed(1)}%
                    {' • '}
                    {result.feedbackStructured.overall.percentAboveNeedsWork.toFixed(
                      1,
                    )}
                    %{' of units ≥ '}
                    {NEEDS_WORK_THRESHOLD}%
                  </span>
                </div>

                {result.feedbackStructured.llm?.overallSummary ? (
                  <div className="rounded-md border border-base-300 bg-base-100 px-3 py-2">
                    <div className="font-medium">Coach summary</div>
                    <div className="mt-1 whitespace-pre-wrap text-base-content/80">
                      {result.feedbackStructured.llm.overallSummary}
                    </div>
                  </div>
                ) : null}

                {result.feedbackStructured.llmError ? (
                  <div className="rounded-md border border-base-300 bg-base-100 px-3 py-2">
                    <div className="font-medium">LLM error</div>
                    <div className="mt-1 text-sm text-error">
                      {result.feedbackStructured.llmError}
                    </div>
                    {result.feedbackStructured.llmRaw ? (
                      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-base-content/70">
                        {result.feedbackStructured.llmRaw}
                      </pre>
                    ) : null}
                  </div>
                ) : null}

                <div>
                  <div className="font-medium">Needs improvement</div>
                  {result.feedbackStructured.needsWorkUnits.length === 0 ? (
                    <div className="mt-1 text-base-content/70">
                      No low-scoring units found.
                    </div>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {result.feedbackStructured.needsWorkUnits
                        .slice(0, 10)
                        .map((item) => (
                          <li
                            key={`needs-${item.unit}`}
                            className="flex items-start justify-between gap-3 rounded-md border border-base-300 px-3 py-2"
                          >
                            <div>
                              <div className="font-mono">{item.unit}</div>
                              {item.examples?.length ? (
                                <div className="text-xs text-base-content/70">
                                  e.g. {item.examples.join(', ')}
                                </div>
                              ) : null}
                            </div>
                            <div className="shrink-0">
                              {item.avgScore.toFixed(1)}%
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>

                <div>
                  <div className="font-medium">Accurate</div>
                  {result.feedbackStructured.accurateUnits.length === 0 ? (
                    <div className="mt-1 text-base-content/70">
                      No high-scoring units found.
                    </div>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {result.feedbackStructured.accurateUnits
                        .slice(0, 10)
                        .map((item) => (
                          <li
                            key={`acc-${item.unit}`}
                            className="flex items-start justify-between gap-3 rounded-md border border-base-300 px-3 py-2"
                          >
                            <div>
                              <div className="font-mono">{item.unit}</div>
                              {item.examples?.length ? (
                                <div className="text-xs text-base-content/70">
                                  e.g. {item.examples.join(', ')}
                                </div>
                              ) : null}
                            </div>
                            <div className="shrink-0">
                              {item.avgScore.toFixed(1)}%
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>

                <div>
                  <div className="font-medium">Word breakdown</div>
                  {result.feedbackStructured.words.length === 0 ? (
                    <div className="mt-1 text-base-content/70">
                      No word-level breakdown available.
                    </div>
                  ) : (
                    <div className="mt-2 overflow-x-auto rounded-md border border-base-300">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Word</th>
                            <th className="text-right">Avg (%)</th>
                            <th>Status</th>
                            <th>Focus (lowest units)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.feedbackStructured.words
                            .slice(0, 25)
                            .map((w, idx) => {
                              const focus = (w.lowUnits ?? [])
                                .slice(0, 4)
                                .map((u) => `${u.unit}(${u.score.toFixed(0)}%)`)
                                .join(', ')

                              return (
                                <tr key={`${w.word}-${idx}`}>
                                  <td className="font-medium">{w.word}</td>
                                  <td className="text-right">
                                    {w.avgScore.toFixed(1)}%
                                  </td>
                                  <td>{renderStatusBadge(w.status)}</td>
                                  <td className="text-base-content/80">
                                    {focus || '—'}
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {result.feedbackStructured.words.length > 25 ? (
                    <div className="mt-2 text-xs text-base-content/60">
                      Showing first 25 words.
                    </div>
                  ) : null}
                </div>

                {result.feedbackStructured.llm?.nextPractice?.length ? (
                  <div>
                    <div className="font-medium">Next practice</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-base-content/80">
                      {result.feedbackStructured.llm.nextPractice
                        .slice(0, 5)
                        .map((item, idx) => (
                          <li key={`next-${idx}`}>{item}</li>
                        ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-sm">
                {result.feedback}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
