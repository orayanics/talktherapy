import { useEffect, useRef, useState } from 'react'
import { MAX_AUDIO_BYTES } from '../api/slp'

export default function usePracticeRecorder() {
  const [state, setState] = useState<
    'idle' | 'requesting_permission' | 'recording' | 'reviewing'
  >('idle')
  const [audio, setAudio] = useState<Blob | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const active = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const generation = useRef(0)
  const busy = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const release = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    const recorder = active.current
    active.current = null
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    stream.current?.getTracks().forEach((track) => track.stop())
    stream.current = null
    busy.current = false
  }

  const clear = () => {
    generation.current++
    release()
    setAudio(null)
    setUrl(null)
    setState('idle')
    setError(null)
  }

  useEffect(() => {
    return () => {
      generation.current++
      release()
    }
  }, [])

  useEffect(() => {
    if (url) return () => URL.revokeObjectURL(url)
  }, [url])

  const start = async () => {
    if (busy.current) return
    busy.current = true
    const attempt = ++generation.current
    setAudio(null)
    setUrl(null)
    setError(null)
    setState('requesting_permission')
    try {
      const devices = Reflect.get(navigator, 'mediaDevices') as
        MediaDevices | undefined
      if (
        typeof devices?.getUserMedia !== 'function' ||
        typeof MediaRecorder === 'undefined'
      ) {
        throw new Error(
          'Recording is unavailable. Ask your helper to check this browser.',
        )
      }
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm'].find((type) =>
        MediaRecorder.isTypeSupported(type),
      )
      if (!mimeType)
        throw new Error(
          'This browser needs WebM recording support. Try Chrome, Edge, or Firefox.',
        )
      const capture = await devices.getUserMedia({ audio: true })
      if (attempt !== generation.current) {
        capture.getTracks().forEach((track) => track.stop())
        return
      }
      stream.current = capture
      const recorder = new MediaRecorder(capture, { mimeType })
      active.current = recorder
      const chunks: Blob[] = []
      let bytes = 0
      let failed = false
      recorder.ondataavailable = (event) => {
        if (attempt !== generation.current || failed || !event.data.size) return
        bytes += event.data.size
        if (bytes > MAX_AUDIO_BYTES) {
          failed = true
          setError('That recording was too long. Try a shorter turn.')
          release()
        } else chunks.push(event.data)
      }
      recorder.onerror = () => {
        if (attempt !== generation.current) return
        failed = true
        setError(
          'The microphone stopped working. Ask your helper and try again.',
        )
        release()
        setState('idle')
      }
      recorder.onstop = () => {
        if (attempt !== generation.current) return
        release()
        const blob = new Blob(chunks, { type: recorder.mimeType })
        if (failed || !blob.size) {
          if (!failed)
            setError('I could not hear a recording. Let’s try again.')
          setState('idle')
          return
        }
        setAudio(blob)
        setUrl(URL.createObjectURL(blob))
        setState('reviewing')
      }
      recorder.start(250)
      setState('recording')
      timer.current = setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop()
      }, 60_000)
    } catch (cause) {
      if (attempt !== generation.current) return
      release()
      setState('idle')
      setError(
        cause instanceof Error && cause.name !== 'NotAllowedError'
          ? cause.message
          : 'Ask your helper to allow microphone access, then try again.',
      )
    }
  }

  const stop = () => {
    if (active.current?.state === 'recording') active.current.stop()
  }

  return { state, audio, url, error, start, stop, clear }
}
