import { useEffect, useRef, useState } from 'react'
import { MAX_AUDIO_BYTES } from '../api/slp'

import { makeWav } from './makeWav'

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
  const context = useRef<AudioContext | null>(null)
  const finishWav = useRef<(() => void) | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const release = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    finishWav.current = null
    if (context.current) void context.current.close()
    context.current = null
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
      if (!devices?.getUserMedia) {
        throw new Error(
          'Microphone access requires HTTPS or localhost and a supported browser.',
        )
      }
      const mimeType =
        typeof MediaRecorder !== 'undefined' &&
        ['audio/webm;codecs=opus', 'audio/webm'].find((type) =>
          MediaRecorder.isTypeSupported(type),
        )
      // Resume during the Record gesture, before the permission prompt can consume it.
      const ctx =
        typeof AudioContext !== 'undefined' &&
        typeof AudioWorkletNode !== 'undefined'
          ? new AudioContext()
          : null
      context.current = ctx
      const prepareWav = ctx?.audioWorklet
        ? Promise.all([
            ctx.resume(),
            ctx.audioWorklet.addModule('/slp/practice-pcm.js'),
          ]).then(
            () => true,
            () => false,
          )
        : Promise.resolve(false)
      const capture = await devices.getUserMedia({ audio: true })
      if (attempt !== generation.current) {
        capture.getTracks().forEach((track) => track.stop())
        return
      }
      stream.current = capture
      const wavReady = await prepareWav
      if (attempt !== generation.current) return
      if (ctx && wavReady) {
        const source = ctx.createMediaStreamSource(capture)
        const node = new AudioWorkletNode(ctx, 'practice-pcm', {
          channelCount: 1,
          channelCountMode: 'explicit',
        })
        const chunks: Array<ArrayBuffer> = []
        let size = 44
        node.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
          if (generation.current !== attempt || !finishWav.current) return
          size += event.data.byteLength
          if (size > MAX_AUDIO_BYTES) {
            release()
            setState('idle')
            setError('That recording was too long. Try a shorter turn.')
          } else chunks.push(event.data)
        }
        source.connect(node)
        node.connect(ctx.destination)
        finishWav.current = () => {
          release()
          if (!chunks.length) {
            setState('idle')
            setError('No audio was captured. Choose Retry recording.')
            return
          }
          const blob = makeWav(chunks, ctx.sampleRate)
          setAudio(blob)
          setUrl(URL.createObjectURL(blob))
          setState('reviewing')
        }
        timer.current = setTimeout(finishWav.current, 60_000)
        setState('recording')
        return
      }
      if (ctx) {
        void ctx.close()
        context.current = null
      }
      if (!mimeType) throw new Error('This browser cannot record audio.')
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
        if (attempt !== generation.current || active.current !== recorder)
          return
        generation.current++
        failed = true
        setError(
          'Recording stopped. Choose Retry recording to start a new take. If it keeps happening, check your microphone or try another browser.',
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
      if (stream.current) {
        generation.current++
        release()
        setState('idle')
        setError(
          'Recording could not start. Choose Retry recording to try again.',
        )
        return
      }
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
    if (finishWav.current) finishWav.current()
    else if (active.current?.state === 'recording') active.current.stop()
  }

  return { state, audio, url, error, start, stop, clear }
}
