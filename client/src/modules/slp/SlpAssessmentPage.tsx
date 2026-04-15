import { useRef, useState } from 'react'
import useSlpAssessment from './useSlpAssessment'
import FormLabel from '@/components/Form/FormLabel'
import SlpImprovement from './SlpImprovement'
import SlpAccurate from './SlpAccurate'
import SlpBreakdown from './SlpBreakdown'
import SlpAlert from './SlpAlert'

export default function SlpAssessmentPage() {
  const [referenceText, setReferenceText] = useState(
    'She sells sea shells by the sea shore.',
  )
  const [isRecording, setIsRecording] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const { result, apiError, submitAssessment, resetAssessment, isSubmitting } =
    useSlpAssessment()

  const error = localError ?? apiError

  const startRecording = async () => {
    setLocalError(null)
    resetAssessment()

    if (!navigator.mediaDevices?.getUserMedia) {
      setLocalError('Microphone is not available in this browser.')
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
      setLocalError('Microphone permission denied or unavailable.')
    }
  }

  const stopRecording = () => {
    if (!recorderRef.current) return
    recorderRef.current.stop()
    setIsRecording(false)
  }

  const onAssess = async () => {
    setLocalError(null)

    if (!audioBlob) {
      setLocalError('Record audio first.')
      return
    }

    if (!referenceText.trim()) {
      setLocalError('Reference text is required.')
      return
    }

    try {
      await submitAssessment(audioBlob, referenceText)
    } catch {
      // Error state is handled inside the hook.
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-lg font-bold text-slate-900 uppercase">
          Assisted Practice
        </p>
        <p className="text-xs text-slate-400 font-medium">
          Get instant feedback on your pronunciation and tips for improvement.
        </p>
      </div>

      {error && <div className="alert alert-soft alert-error">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="space-y-4 col-span-4">
          {/* reference */}
          <div>
            <FormLabel title="Reference Text" />
            <input
              type="text"
              className="input w-full"
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              disabled={isRecording || isSubmitting}
            />
          </div>

          {/* recording controls */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <button
                className="btn btn-neutral"
                onClick={startRecording}
                disabled={isRecording || isSubmitting}
                type="button"
              >
                Start
              </button>
              <button
                className="btn btn-neutral"
                onClick={stopRecording}
                disabled={!isRecording || isSubmitting}
                type="button"
              >
                Stop
              </button>
              <button
                className="btn btn-primary"
                onClick={onAssess}
                disabled={!audioBlob || isRecording || isSubmitting}
                type="button"
              >
                Assess
              </button>
            </div>

            {audioUrl && (
              <div>
                <FormLabel title="Your Recording" />
                <audio controls className="w-full" src={audioUrl} />
              </div>
            )}
          </div>
        </div>

        <div className="col-span-8">
          {result && (
            <div className="space-y-4">
              <div>
                <p className="uppercase font-medium">Your Results</p>
                <SlpAlert status={result.analysis.structured.overall.status} />
              </div>

              <SlpImprovement result={result} />
              <SlpAccurate result={result} />
              <SlpBreakdown result={result} />

              {result.feedback.text ? (
                <div>
                  <div className="font-medium">Feedback</div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                    {result.feedback.text}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
