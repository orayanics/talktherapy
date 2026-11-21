import type { PicturePrompt, PracticeLanguage } from '../data/practiceContent'
import { getPictureUrl, getPracticeWord } from '../data/practiceContent'
import type { WordProgress } from '../data/practiceGame'
import {
  checkFeedback,
  getPracticeStars,
  reflectionLabels,
} from '../data/practiceGame'
import PracticeStars from './PracticeStars'

export default function PracticeStoryWord({
  prompt,
  turn,
  language,
  onRetry,
}: {
  prompt: PicturePrompt
  turn?: WordProgress
  language: PracticeLanguage
  onRetry: (promptId: string) => void
}) {
  const word = turn?.word ?? getPracticeWord(prompt, language)

  return (
    <li>
      <img src={getPictureUrl(prompt)} alt="" width={64} height={64} />
      <div className="min-w-0 flex-1">
        <h4 className="break-words text-lg font-bold">{word}</h4>
        <PracticeStars earned={getPracticeStars(turn)} />
        <p className="mt-1 text-sm text-slate-700">
          {turn
            ? `${turn.attempts} ${turn.attempts === 1 ? 'attempt' : 'attempts'} · ${turn.reflection ? reflectionLabels[turn.reflection] : 'No check-in selected'}`
            : 'Not tried this round'}
        </p>
        {turn && (
          <p className="mt-1 text-sm text-slate-600">
            {checkFeedback[turn.outcome].title}
            {turn.transcript ? ` · Heard: “${turn.transcript}”` : ''}
          </p>
        )}
      </div>
      <button
        type="button"
        className="slp-secondary-button"
        onClick={() => onRetry(prompt.id)}
        aria-label={`Practice ${word} again`}
      >
        {turn ? 'Try again' : 'Try it'}
      </button>
    </li>
  )
}
