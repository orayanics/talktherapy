import { useEffect, useRef, useState } from 'react'
import useSlpAssessment from '#/modules/slp/hooks/useSlpAssessment'
import { MAX_AUDIO_BYTES, MAX_REFERENCE_LENGTH } from '#/modules/slp/api/slp'
import FormLabel from '#/components/Form/FormLabel'
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

  useEffect(() => {
    if (!audioUrl) return
    return () => URL.revokeObjectURL(audioUrl)
  }, [audioUrl])

  const { result, apiError, submitAssessment, resetAssessment, isSubmitting } =
    useSlpAssessment()

  const error = localError ?? apiError

  const startRecording = async () => {
    setLocalError(null)
    resetAssessment()
    setAudioBlob(null)
    setAudioUrl(null)

    const mediaDevices = Reflect.get(navigator, 'mediaDevices') as
      MediaDevices | undefined
    if (typeof mediaDevices?.getUserMedia !== 'function' || typeof MediaRecorder === 'undefined') {
      setLocalError('Microphone is not available in this browser.')
      return
    }

    let stream: MediaStream | null = null
    try {
      stream = await mediaDevices.getUserMedia({ audio: true })
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm'].find((type) =>
        MediaRecorder.isTypeSupported(type),
      )
      if (!mimeType) {
        stream.getTracks().forEach((track) => track.stop())
        setLocalError('This browser cannot record the supported WebM audio format.')
        return
      }

      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []
      let recordedBytes = 0
      let exceededLimit = false

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size === 0 || exceededLimit) return
        if (recordedBytes + event.data.size > MAX_AUDIO_BYTES) {
          exceededLimit = true
          chunksRef.current = []
          setLocalError('Recording exceeded the 10 MiB upload limit. Try a shorter recording.')
          if (recorder.state !== 'inactive') recorder.stop()
          return
        }
        recordedBytes += event.data.size
        chunksRef.current.push(event.data)
      }

      recorder.onstop = () => {
        setIsRecording(false)
        recorderRef.current = null
        stream?.getTracks().forEach((track) => track.stop())
        if (exceededLimit) {
          setAudioBlob(null)
          setAudioUrl(null)
          return
        }

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType,
        })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
      }

      recorderRef.current = recorder
      recorder.start(1000)
      setIsRecording(true)
    } catch {
      stream?.getTracks().forEach((track) => track.stop())
      setLocalError('Microphone permission denied or unavailable.')
    }
  }

  const stopRecording = () => {
    if (!recorderRef.current) return
    recorderRef.current.stop()
  }

  const onAssess = async () => {
    setLocalError(null)

    if (!audioBlob) {
      setLocalError('Record audio first.')
      return
    }

    if (audioBlob.size > MAX_AUDIO_BYTES) {
      setLocalError('Recording exceeds the 10 MiB upload limit. Record a shorter clip.')
      return
    }

    if (!referenceText.trim()) {
      setLocalError('Reference text is required.')
      return
    }

    if (referenceText.trim().length > MAX_REFERENCE_LENGTH) {
      setLocalError('Reference text must be 800 characters or fewer.')
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
        <p className="text-xs text-slate-500 font-medium">
          Practice with an automated estimate. This is not a diagnosis or clinical measure.
        </p>
      </div>

      {error && <div className="alert alert-soft alert-error" role="alert">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="space-y-4 col-span-4">
          {/* reference */}
          <div>
            <FormLabel title="Reference Text" htmlFor="slp-reference-text" />
            <input
              id="slp-reference-text"
              type="text"
              maxLength={MAX_REFERENCE_LENGTH}
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
                Start recording
              </button>
              <button
                className="btn btn-neutral"
                onClick={stopRecording}
                disabled={!isRecording || isSubmitting}
                type="button"
              >
                Stop recording
              </button>
              <button
                className="btn btn-primary"
                onClick={onAssess}
                disabled={!audioBlob || isRecording || isSubmitting}
                type="button"
              >
                Analyze practice recording
              </button>
            </div>

            {isSubmitting && (
              <p className="text-sm text-slate-600" role="status">
                Analyzing your recording. This can take up to 45 seconds.
              </p>
            )}

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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
