import { useEffect, useReducer, useRef, useState } from 'react'
import { Pause, Star } from 'lucide-react'
import useSlpAssessment from '../hooks/useSlpAssessment'
import usePracticeRecorder from '../hooks/usePracticeRecorder'
import {
  getPracticeWord,
  picturePrompts,
  practiceCategories,
} from '../data/practiceContent'
import { practiceThemes } from '../data/practiceThemes'
import type {
  PracticeCategory,
  PracticeLanguage,
} from '../data/practiceContent'
import type { PracticeThemeId } from '../data/practiceThemes'
import PracticePicture from './PracticePicture'
import PracticeTurn from './PracticeTurn'
import PracticeReview from './PracticeReview'
import PracticeRoundSummary from './PracticeRoundSummary'
import {
  getCheckOutcome,
  practiceGameReducer,
  summarizePractice,
} from '../data/practiceGame'
import './practice.css'

export default function SlpAssessmentPage() {
  const [index, setIndex] = useState(0)
  const [language, setLanguage] = useState<PracticeLanguage>('en')
  const [category, setCategory] = useState<PracticeCategory>('everyday')
  const [themeId, setThemeId] = useState<PracticeThemeId>('jungle')
  const [mode, setMode] = useState<'explore' | 'focus'>('explore')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [customWord, setCustomWord] = useState('')
  const [paused, setPaused] = useState(false)
  const [finished, setFinished] = useState(false)
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [game, dispatchGame] = useReducer(practiceGameReducer, {})
  const roundGeneration = useRef(0)
  const recorder = usePracticeRecorder()
  const assessment = useSlpAssessment()
  const prompts = picturePrompts.filter((item) => item.category === category)
  const prompt = prompts[index]
  const theme =
    practiceThemes.find((item) => item.id === themeId) ?? practiceThemes[0]
  const Buddy = theme.icon
  const word = customWord.trim() || getPracticeWord(prompt, language)
  const currentProgress =
    game[prompt.id]?.word === word ? game[prompt.id] : undefined
  const summary = summarizePractice(
    game,
    prompts.map((item) => item.id),
  )
  const completed = new Set(
    prompts.filter((item) => game[item.id]).map((item) => item.id),
  )
  useEffect(() => {
    if (recorder.audio && recorder.url) {
      setVisited((previous) =>
        previous.has(prompt.id) ? previous : new Set(previous).add(prompt.id),
      )
      dispatchGame({
        type: 'recorded',
        promptId: prompt.id,
        word,
        recordingKey: recorder.url,
      })
    }
  }, [recorder.audio, recorder.url, prompt.id, word])
  const locked =
    recorder.state === 'recording' ||
    recorder.state === 'requesting_permission' ||
    assessment.isSubmitting
  const capturing =
    recorder.state === 'recording' || recorder.state === 'requesting_permission'
  const showingFeedback = !!currentProgress && !capturing
  const clear = () => {
    roundGeneration.current++
    dispatchGame({ type: 'cancel_checks' })
    recorder.clear()
    assessment.resetAssessment()
  }
  const restart = () => {
    clear()
    setCustomWord('')
    dispatchGame({ type: 'reset' })
    setIndex(0)
    setFinished(false)
    setVisited(new Set())
    setPaused(false)
  }
  const next = () => {
    setVisited((previous) => new Set(previous).add(prompt.id))
    clear()
    setCustomWord('')
    if (index === prompts.length - 1) setFinished(true)
    else setIndex(index + 1)
  }
  const analyze = async () => {
    if (!recorder.audio || !recorder.url) return
    const generation = roundGeneration.current
    const recordingKey = recorder.url
    dispatchGame({
      type: 'check',
      promptId: prompt.id,
      recordingKey,
      outcome: 'checking',
      transcript: '',
    })
    const response = await assessment.submitAssessment(
      recorder.audio,
      word,
      language,
    )
    if (roundGeneration.current !== generation) return
    dispatchGame({
      type: 'check',
      promptId: prompt.id,
      recordingKey,
      outcome: response ? getCheckOutcome(response) : 'unavailable',
      transcript: response?.analysis.transcript ?? '',
    })
  }
  const retryWord = (promptId: string) => {
    const target = prompts.findIndex((item) => item.id === promptId)
    if (target < 0) return
    clear()
    setIndex(target)
    setFinished(false)
    setPaused(false)
    const practicedWord = game[promptId]?.word
    setCustomWord(
      practicedWord &&
        practicedWord !== getPracticeWord(prompts[target], language)
        ? practicedWord
        : '',
    )
  }

  return (
    <section
      className="slp-practice mx-auto max-w-5xl space-y-5 sm:space-y-6"
      data-practice-theme={themeId}
      data-practice-mode={mode}
      aria-label="Speech practice"
    >
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {mode === 'explore' && (
            <Buddy
              size={48}
              strokeWidth={1.5}
              className="slp-adventure-mark hidden sm:block"
              aria-hidden="true"
            />
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              {mode === 'explore' ? 'Picture adventures' : 'Speech practice'}
            </h1>
            <p className="mt-1 text-sm text-slate-600 hidden sm:block">
              {mode === 'explore'
                ? theme.greeting
                : 'Record, replay, and practice at your pace.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="slp-secondary-button"
          aria-label={paused ? 'Come back to practice' : 'Take a break'}
          onClick={() => {
            clear()
            setPaused(!paused)
          }}
        >
          <Pause size={18} aria-hidden="true" />
          <span className="sm:hidden">{paused ? 'Resume' : 'Break'}</span>
          <span className="hidden sm:inline">
            {paused ? 'Come back to practice' : 'Take a break'}
          </span>
        </button>
      </header>

      <button
        type="button"
        className="slp-secondary-button"
        aria-expanded={settingsOpen}
        aria-controls="practice-activity-settings"
        onClick={() => setSettingsOpen(!settingsOpen)}
      >
        {settingsOpen
          ? 'Close activity settings'
          : 'Change theme, language or pictures'}
      </button>
      <div
        id="practice-activity-settings"
        className={`${settingsOpen ? 'block' : 'hidden'} space-y-5`}
      >
        {mode === 'explore' && (
          <fieldset className="space-y-3">
            <legend className="slp-section-label mb-3">
              Pick your adventure
            </legend>
            <div className="flex flex-wrap gap-2">
              {practiceThemes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="slp-theme-button"
                  aria-pressed={themeId === item.id}
                  onClick={() => setThemeId(item.id)}
                >
                  <item.icon size={18} aria-hidden="true" />
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-2 text-sm font-medium">
            <span className="block">Practice language</span>
            <select
              className="select min-h-12 w-full bg-white"
              value={language}
              disabled={locked}
              onChange={(event) => {
                restart()
                setLanguage(event.target.value as PracticeLanguage)
              }}
            >
              <option value="en">English</option>
              <option value="tl">Filipino (Tagalog)</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span className="block">Picture set</span>
            <select
              className="select min-h-12 w-full bg-white"
              value={category}
              disabled={locked}
              onChange={(event) => {
                restart()
                setCategory(event.target.value as PracticeCategory)
              }}
            >
              {practiceCategories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item[language]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span className="block">Activity style</span>
            <select
              className="select min-h-12 w-full bg-white"
              value={mode}
              onChange={(event) =>
                setMode(event.target.value as 'explore' | 'focus')
              }
            >
              <option value="explore">Explore with pictures</option>
              <option value="focus">Simple focus</option>
            </select>
          </label>
        </div>
      </div>
      <div className="slp-lesson-progress">
        <div className="flex items-center justify-between gap-3">
          <p className="slp-section-label">
            {finished
              ? 'Round complete'
              : `Picture ${index + 1} of ${prompts.length}`}
          </p>
          <p className="slp-section-label">{summary.stars} practice stars</p>
        </div>
        <progress
          className="slp-progress-meter"
          max={prompts.length}
          value={visited.size}
          aria-label="Picture stops visited"
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ol
            className="slp-progress hidden sm:flex"
            aria-label={`${completed.size} of ${prompts.length} practice turns tried`}
          >
            {prompts.map((item, step) => (
              <li
                key={item.id}
                className="slp-progress-step"
                aria-current={step === index && !finished ? 'step' : undefined}
                data-tried={completed.has(item.id)}
                aria-label={`Picture ${step + 1}${completed.has(item.id) ? ', tried' : ''}`}
              >
                {completed.has(item.id) ? (
                  <Star size={20} fill="currentColor" aria-hidden="true" />
                ) : (
                  step + 1
                )}
              </li>
            ))}
          </ol>
          <p className="text-sm text-slate-600 hidden sm:block">
            {summary.stars} of {prompts.length * 3} practice stars ·{' '}
            {completed.size} of {prompts.length} words
          </p>
        </div>
      </div>

      {paused ? (
        <div className="slp-rest space-y-5">
          <Buddy
            size={72}
            strokeWidth={1.5}
            className="slp-adventure-mark mx-auto"
            aria-hidden="true"
          />
          <h2 className="text-2xl font-bold">Time for a little rest</h2>
          <p>
            {completed.size} practice {completed.size === 1 ? 'turn' : 'turns'}{' '}
            tried. Every try is part of learning.
          </p>
          <button
            type="button"
            className="slp-secondary-button"
            onClick={() => {
              setPaused(false)
            }}
          >
            I’m ready
          </button>
        </div>
      ) : finished ? (
        <PracticeRoundSummary
          game={game}
          prompts={prompts}
          language={language}
          focusMode={mode === 'focus'}
          onRestart={restart}
          onRetry={retryWord}
        />
      ) : (
        <div
          className={
            showingFeedback ? 'slp-feedback-stage' : 'slp-lesson-stage'
          }
        >
          {!showingFeedback && (
            <PracticePicture
              key={`${prompt.id}-${language}-${customWord}`}
              prompt={prompt}
              language={language}
              customWord={customWord}
              focusMode={mode === 'focus'}
            />
          )}
          <PracticeTurn
            recorder={recorder}
            assessment={assessment}
            language={language}
            last={index === prompts.length - 1}
            progress={currentProgress}
            focusMode={mode === 'focus'}
            onReplayed={() =>
              dispatchGame({ type: 'replayed', promptId: prompt.id })
            }
            onReflect={(reflection) =>
              dispatchGame({
                type: 'reflected',
                promptId: prompt.id,
                reflection,
              })
            }
            onStart={() => {
              roundGeneration.current++
              dispatchGame({ type: 'cancel_checks' })
              assessment.resetAssessment()
              void recorder.start()
            }}
            onFinish={() => void analyze()}
            onNext={next}
            onClear={clear}
          />
        </div>
      )}
      <PracticeReview
        prompt={prompt}
        word={word}
        customWord={customWord}
        locked={locked}
        result={assessment.result}
        onChange={(value) => {
          clear()
          setCustomWord(value)
        }}
      />
    </section>
  )
}
