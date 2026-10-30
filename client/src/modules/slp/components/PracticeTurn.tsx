import { Mic, RotateCcw, Square } from 'lucide-react'
import type usePracticeRecorder from '../hooks/usePracticeRecorder'
import type useSlpAssessment from '../hooks/useSlpAssessment'
import type { PracticeLanguage } from '../data/practiceContent'
import type { PracticeReflection, WordProgress } from '../data/practiceGame'
import PracticeWordFeedback from './PracticeWordFeedback'

export default function PracticeTurn({
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
      ? 'Ask your helper to allow the microphone.'
      : recorder.state === 'recording'
        ? 'I’m listening. Say your word, then tap Done.'
        : assessment.isSubmitting
          ? 'Listening to your turn…'
          : result
            ? 'Thanks for having a go!'
            : recorder.audio
              ? 'Want to hear your turn?'
              : language === 'tl'
                ? 'Handa ka na ba?'
                : 'Ready when you are.'
  return (
    <div className="slp-turn space-y-5">
      {(!progress || capturing) && (
        <div>
          <p className="slp-section-label hidden sm:block">
            {language === 'tl' ? 'Ikaw naman' : 'Your turn'}
          </p>
          <p
            className="mt-2 text-xl font-bold"
            role="status"
            aria-live="polite"
          >
            {status}
          </p>
          {!recorder.audio && !locked && (
            <p className="mt-3 text-sm leading-relaxed text-slate-600 hidden sm:block">
              {language === 'tl'
                ? 'Tingnan ang larawan. Sabihin ang sagot. Puwedeng humingi ng tulong.'
                : 'Look at the picture and say its name. A helper can give you a clue or say the word first.'}
            </p>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-900">
          {error}
        </p>
      )}
      {recorder.state === 'recording' ? (
        <button
          type="button"
          className="slp-main-button"
          onClick={recorder.stop}
        >
          <Square size={20} aria-hidden="true" />
          Done
        </button>
      ) : !progress || capturing ? (
        <button
          type="button"
          className="slp-main-button"
          disabled={locked}
          onClick={onStart}
        >
          <Mic size={20} aria-hidden="true" />
          {recorder.audio ? 'Record again' : 'My turn'}
        </button>
      ) : null}
      {recorder.url && !progress && (
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
      {progress && !capturing && (
        <PracticeWordFeedback
          disabled={locked}
          progress={progress}
          audioUrl={recorder.url}
          onReplayed={onReplayed}
          onReflect={onReflect}
          focusMode={focusMode}
          onAgain={onStart}
          onSkip={onNext}
        />
      )}
      {recorder.audio && !result && (
        <button
          type="button"
          className="slp-secondary-button w-full"
          disabled={locked}
          onClick={onFinish}
        >
          {assessment.isSubmitting ? 'Listening…' : 'Check my word'}
        </button>
      )}
      <div className="slp-turn-actions">
        <button
          type="button"
          className={
            progress && !capturing ? 'slp-main-button' : 'slp-secondary-button'
          }
          disabled={locked}
          onClick={onNext}
        >
          {last ? 'See my results' : progress ? 'Continue' : 'Skip for now'}
        </button>
        {progress && !capturing && (
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
      <p className="text-xs leading-relaxed text-slate-600">
        No rush. A try counts, even when you need help.
      </p>
    </div>
  )
}
