import {
  Award,
  Headphones,
  MessageCircle,
  Mic,
  Star,
  Trophy,
} from 'lucide-react'
import { getPictureUrl, getPracticeWord } from '../data/practiceContent'
import {
  checkFeedback,
  getPracticeStars,
  reflectionLabels,
  summarizePractice,
} from '../data/practiceGame'
import type { PicturePrompt, PracticeLanguage } from '../data/practiceContent'
import type { PracticeGame } from '../data/practiceGame'
import PracticeStars from './PracticeStars'
import PracticeBuddy from './PracticeBuddy'

export default function PracticeRoundSummary({
  game,
  prompts,
  language,
  focusMode,
  onRestart,
  onRetry,
}: {
  game: PracticeGame
  prompts: PicturePrompt[]
  language: PracticeLanguage
  focusMode: boolean
  onRestart: () => void
  onRetry: (promptId: string) => void
}) {
  const summary = summarizePractice(
    game,
    prompts.map((item) => item.id),
  )
  const badges = [
    {
      earned: summary.recorded > 0,
      icon: Mic,
      name: 'Brave first try',
      detail: 'Recorded a word',
    },
    {
      earned: summary.replayed > 0,
      icon: Headphones,
      name: 'Careful listener',
      detail: 'Listened back',
    },
    {
      earned: summary.reflected > 0,
      icon: MessageCircle,
      name: 'Thoughtful practicer',
      detail: 'Shared a check-in',
    },
    {
      earned: summary.recorded === prompts.length,
      icon: Award,
      name: 'Picture explorer',
      detail: 'Tried every picture',
    },
  ].filter((badge) => badge.earned)
  return (
    <section
      className="slp-round-summary space-y-6"
      aria-label="Round performance summary"
    >
      <div className="slp-summary-hero">
        {focusMode ? (
          <Trophy size={52} strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <PracticeBuddy size={120} celebrate />
        )}
        <div>
          <p className="text-sm font-semibold">
            {focusMode ? 'Practice round complete' : 'Your practice treasure'}
          </p>
          <h2 className="mt-1 text-3xl font-bold sm:text-4xl">
            {summary.recorded
              ? 'Look at what you practiced!'
              : 'Ready whenever you are'}
          </h2>
          <p className="mt-3 leading-relaxed">
            {summary.recorded} of {prompts.length} words explored.{' '}
            {summary.recorded
              ? 'Every try helped build your collection.'
              : 'No stars lost. You can start with any picture.'}
          </p>
        </div>
        <div className="slp-summary-score">
          <Star size={28} fill="currentColor" aria-hidden="true" />
          <strong>
            {summary.stars}
            <span> / {prompts.length * 3}</span>
          </strong>
          <span>practice stars</span>
        </div>
      </div>
      <div
        className="slp-summary-metrics"
        aria-label="Practice activity totals"
      >
        <p>
          <strong>{summary.attempts}</strong>recorded{' '}
          {summary.attempts === 1 ? 'attempt' : 'attempts'}
        </p>
        <p>
          <strong>{summary.replayed}</strong>words listened back
        </p>
        <p>
          <strong>{summary.independent}</strong>reported independent
        </p>
        <p>
          <strong>{summary.withHelp}</strong>reported using a clue
        </p>
      </div>
      {!!badges.length && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold">
            {focusMode ? 'Practice milestones' : 'Badges you collected'}
          </h3>
          <ul className="slp-badge-list">
            {badges.map((badge) => (
              <li key={badge.name}>
                <badge.icon size={24} aria-hidden="true" />
                <div>
                  <strong>{badge.name}</strong>
                  <span>{badge.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xl font-bold">Your word-by-word story</h3>
          <p className="text-sm text-slate-600">
            {summary.matched} transcript{' '}
            {summary.matched === 1 ? 'match' : 'matches'} · sound accuracy
            unassessed
          </p>
        </div>
        <ul className="slp-word-story">
          {prompts.map((prompt) => {
            const turn = game[prompt.id]
            return (
              <li key={prompt.id}>
                <img
                  src={getPictureUrl(prompt)}
                  alt=""
                  width={64}
                  height={64}
                />
                <div className="min-w-0 flex-1">
                  <h4 className="break-words text-lg font-bold">
                    {turn?.word ?? getPracticeWord(prompt, language)}
                  </h4>
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
                  aria-label={`Practice ${turn?.word ?? getPracticeWord(prompt, language)} again`}
                >
                  {turn ? 'Try again' : 'Try it'}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">
        Stars and badges measure practice activities. Independent/helped ratings
        are self-reported or helper-reported. Automatic transcription can make
        mistakes and does not score pronunciation.
      </p>
      <button type="button" className="slp-main-button" onClick={onRestart}>
        Start a fresh adventure
      </button>
    </section>
  )
}
