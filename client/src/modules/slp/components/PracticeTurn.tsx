import { Mic, RotateCcw, Square } from 'lucide-react'
import type { ReactNode } from 'react'
import type usePracticeRecorder from '../hooks/usePracticeRecorder'
import type useSlpAssessment from '../hooks/useSlpAssessment'
import type { PracticeLanguage } from '../data/practiceContent'
import type { PracticeReflection, WordProgress } from '../data/practiceGame'
import PracticeWordFeedback from './PracticeWordFeedback'

export default function PracticeTurn({
  children,
  canContinue,
  recorder,
  assessment,
  language,
  onStart,
  onFinish,
  onNext,
  onClear,
  last,
  progress,
  focusMode,
  onReplayed,
  onReflect,
}: {
  children: ReactNode
  canContinue: boolean
  recorder: ReturnType<typeof usePracticeRecorder>
  assessment: ReturnType<typeof useSlpAssessment>
  language: PracticeLanguage
  onStart: () => void
  onFinish: () => void
  onNext: () => void
  onClear: () => void
  last: boolean
  progress?: WordProgress
  focusMode: boolean
  onReplayed: () => void
  onReflect: (value: PracticeReflection) => void
}) {
  const locked =
    recorder.state === 'recording' ||
    recorder.state === 'requesting_permission' ||
    assessment.isSubmitting
  const error = recorder.error ?? assessment.apiError
  const result = assessment.result
  const capturing =
    recorder.state === 'recording' || recorder.state === 'requesting_permission'
  const status =
    recorder.state === 'requesting_permission'
      ? 'Ask a grown-up to help turn on the mic.'
      : capturing
        ? 'Say your word. Tap Stop when you finish.'
        : assessment.isSubmitting
          ? 'Checking your word�'
          : recorder.audio
            ? 'Your recording is ready. Tap Check my word.'
            : language === 'tl'
              ? 'Pindutin ang Record my word, tapos sabihin ang salita.'
              : 'Tap Record my word, then say it out loud.'
  return (
    <div className="slp-game-turn">
      <div className="slp-game-card">
        {children}
        {!result && (
          <p className="slp-turn-instruction" role="status">
            {status}
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-box bg-red-50 p-4 text-red-900">
            {error}
          </p>
        )}
        {recorder.url && !result && (
          <div className="space-y-2">
            <label htmlFor="practice-replay" className="text-sm font-semibold">
              Listen to my turn
            </label>
            <audio
              id="practice-replay"
              controls
              src={recorder.url}
              className="w-full"
              aria-label="Listen to my recording"
              onEnded={onReplayed}
            />
          </div>
        )}
        {progress && canContinue && (
          <PracticeWordFeedback
            disabled={locked}
            progress={progress}
            audioUrl={recorder.url}
            onReplayed={onReplayed}
            onReflect={onReflect}
            focusMode={focusMode}
            onAgain={onStart}
            onSkip={onNext}
            canContinue={canContinue}
          />
        )}
      </div>
      {recorder.state === 'recording' ? (
        <button
          type="button"
          className="slp-main-button"
          onClick={recorder.stop}
        >
          <Square size={20} aria-hidden="true" />
          Stop recording
        </button>
      ) : !recorder.audio || capturing ? (
        <button
          type="button"
          className="slp-main-button"
          disabled={locked}
          onClick={onStart}
        >
          <Mic size={20} aria-hidden="true" />
          {recorder.error
            ? 'Retry recording'
            : recorder.audio
              ? 'Record again'
              : 'Record my word'}
        </button>
      ) : null}
      {recorder.audio && !result && (
        <button
          type="button"
          className="slp-main-button"
          disabled={locked}
          onClick={onFinish}
        >
          {assessment.isSubmitting ? 'Listening…' : 'Check my word'}
        </button>
      )}
      <div className="slp-turn-actions">
        {canContinue && (
          <button type="button" className="slp-main-button" onClick={onNext}>
            {last ? 'Finish my round' : 'Next picture'}
          </button>
        )}
        {recorder.audio && !capturing && (
          <button
            type="button"
            className="slp-secondary-button"
            disabled={locked}
            onClick={onStart}
          >
            Record again
          </button>
        )}
        {(locked || recorder.audio) && (
          <button type="button" className="slp-text-button" onClick={onClear}>
            <RotateCcw size={18} aria-hidden="true" />
            {locked ? 'Cancel turn' : 'Start over'}
          </button>
        )}
      </div>
    </div>
  )
}
