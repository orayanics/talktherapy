import { useEffect, useRef } from 'react'
import { Check, Circle, Medal } from 'lucide-react'
import { checkFeedback, getPracticeStars } from '../data/practiceGame'
import type { PracticeReflection, WordProgress } from '../data/practiceGame'
import { StarMeter, Tala, CheckInKeys } from './PracticeRewards'

export default function PracticeWordFeedback({
  progress,
  audioUrl,
  onReplayed,
  onReflect,
  focusMode,
  onAgain,
  onSkip,
  disabled,
}: {
  progress: WordProgress
  audioUrl: string | null
  onReplayed: () => void
  onReflect: (value: PracticeReflection) => void
  focusMode: boolean
  onAgain: () => void
  onSkip: () => void
  disabled: boolean
}) {
  const panel = useRef<HTMLHeadingElement>(null)
  const stars = getPracticeStars(progress)
  const check = checkFeedback[progress.outcome]
  useEffect(() => {
    panel.current?.focus({ preventScroll: true })
    panel.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }, [progress.recordingKey, progress.outcome])
  return (
    <div
      className="slp-word-feedback"
      aria-label={`Practice feedback for ${progress.word}`}
    >
      <header className="slp-reward-heading">
        {focusMode ? (
          <Medal size={36} aria-hidden="true" />
        ) : (
          <Tala size={80} mood="cheer" />
        )}
        <div>
          <p className="text-sm font-semibold">
            {focusMode ? 'Your turn in review' : 'A word for your collection!'}
          </p>
          <h3
            ref={panel}
            tabIndex={-1}
            className="break-words text-3xl font-bold"
          >
            {progress.word}
          </h3>
        </div>
      </header>
      <div className="slp-star-result" role="status" aria-live="polite">
        <StarMeter stars={stars} justEarned={stars} />
        <p className="font-bold">{stars} of 3 practice stars</p>
      </div>
      <ul
        className="slp-action-list"
        aria-label="Practice activities for this word"
      >
        {(
          [
            ['Recorded a turn', true],
            ['Listened back', progress.replayed],
            ['Shared a check-in', progress.reflected],
          ] as const
        ).map(([label, done]) => (
          <li key={label} data-done={done}>
            {done ? (
              <Check size={18} aria-hidden="true" />
            ) : (
              <Circle size={18} aria-hidden="true" />
            )}
            {label}
          </li>
        ))}
      </ul>
      {audioUrl && (
        <div className="space-y-2">
          <label
            htmlFor="practice-replay"
            className="block text-sm font-semibold"
          >
            {progress.replayed
              ? 'Listen to my turn again'
              : 'Listen back to earn a listening star'}
          </label>
          <audio
            id="practice-replay"
            controls
            src={audioUrl}
            onEnded={onReplayed}
            className="w-full"
            aria-label="Listen to my recording"
          />
        </div>
      )}
      <fieldset className="slp-reflection">
        <legend className="font-bold">How did that turn feel?</legend>
        <p className="mt-1 text-xs text-slate-600">
          Your check-in, or a helper’s observation.
        </p>
        <div className="mt-3">
          <CheckInKeys
            disabled={disabled}
            value={
              progress.reflection === 'with_help'
                ? 'helped'
                : progress.reflection === 'try_again'
                  ? 'again'
                  : progress.reflection
            }
            onPick={(value) => {
              if (value === 'skip') {
                onSkip()
                return
              }
              onReflect(
                value === 'helped'
                  ? 'with_help'
                  : value === 'again'
                    ? 'try_again'
                    : value,
              )
              if (value === 'again') onAgain()
            }}
          />
        </div>
      </fieldset>
      <div className="slp-word-check" data-outcome={progress.outcome}>
        <p className="slp-section-label">Automatic word check</p>
        <p className="mt-1 text-lg font-bold" role="status">
          {check.title}
        </p>
        {progress.transcript && (
          <dl className="slp-transcript-pair">
            <div>
              <dt>Practice word</dt>
              <dd>{progress.word}</dd>
            </div>
            <div>
              <dt>What was heard</dt>
              <dd>{progress.transcript}</dd>
            </div>
          </dl>
        )}
        <p className="mt-2 text-sm leading-relaxed">{check.detail}</p>
      </div>
      <p className="text-xs leading-relaxed text-slate-600">
        Stars celebrate recording, listening and reflection. Sound accuracy is
        not assessed.
      </p>
    </div>
  )
}
