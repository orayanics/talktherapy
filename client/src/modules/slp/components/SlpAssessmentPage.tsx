import { useEffect, useReducer, useRef, useState } from 'react'
import { Star, Images, Pause, Play, SlidersHorizontal } from 'lucide-react'
import useSlpAssessment from '../hooks/useSlpAssessment'
import usePracticeRecorder from '../hooks/usePracticeRecorder'
import {
  getPracticeWord,
  getPictureUrl,
  picturePrompts,
  practiceCategories,
} from '../data/practiceContent'
import type {
  PracticeCategory,
  PracticeLanguage,
} from '../data/practiceContent'
import PracticePicture from './PracticePicture'
import PracticeTurn from './PracticeTurn'
import PracticeReview from './PracticeReview'
import {
  Root,
  PracticeWelcome,
  RoundPath,
  RoundRecap,
  useCalmMotion,
} from './PracticeRewards'
import type { WordResult } from './PracticeRewards'
import {
  getPracticeStars,
  getCheckOutcome,
  practiceGameReducer,
} from '../data/practiceGame'
import './practice.css'

export default function SlpAssessmentPage() {
  const [index, setIndex] = useState(0)
  const [lobby, setLobby] = useState(true)
  const [userCalm, setUserCalm] = useState(false)
  const calm = useCalmMotion(userCalm)
  const [language, setLanguage] = useState<PracticeLanguage>('en')
  const [category, setCategory] = useState<PracticeCategory>('everyday')
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
  const word = customWord.trim() || getPracticeWord(prompt, language)
  const currentProgress =
    game[prompt.id]?.word === word ? game[prompt.id] : undefined
  const completed = new Set(
    prompts.filter((item) => game[item.id]).map((item) => item.id),
  )
  const rewards: WordResult[] = prompts.map((item) => {
    const turn = game[item.id]
    return {
      word: turn?.word ?? getPracticeWord(item, language),
      stars: getPracticeStars(turn) as WordResult['stars'],
      attempts: turn?.attempts ?? 0,
      replayed: turn?.replayed ?? false,
      checkIn:
        turn?.reflection === 'with_help'
          ? 'helped'
          : turn?.reflection === 'try_again'
            ? 'again'
            : (turn?.reflection ?? null),
      skipped: !turn,
    }
  })
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
  const showingFeedback = !!recorder.audio && !capturing
  const canContinue =
    !locked &&
    !!assessment.result &&
    currentProgress?.recordingKey === recorder.url
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
    setLobby(true)
    setPaused(false)
  }
  const next = () => {
    if (!canContinue) return
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
    <Root calm={calm}>
      <section
        className="slp-practice slp-picture-practice mx-auto"
        data-theme="light"
        data-practice-mode={mode}
        aria-label="Speech practice"
      >
        <div className="slp-game-tools">
          <button
            type="button"
            className="slp-game-pill"
            aria-label={paused ? 'Come back to practice' : 'Take a break'}
            onClick={() => {
              clear()
              setPaused(!paused)
            }}
          >
            {paused ? (
              <Play size={18} aria-hidden="true" />
            ) : (
              <Pause size={18} aria-hidden="true" />
            )}
            <span className="sm:hidden">{paused ? 'Resume' : 'Break'}</span>
            <span className="hidden sm:inline">
              {paused ? 'Come back to practice' : 'Take a break'}
            </span>
          </button>
          <button
            type="button"
            className="slp-game-pill"
            aria-expanded={settingsOpen}
            aria-controls="practice-activity-settings"
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <SlidersHorizontal size={17} aria-hidden="true" />
            Settings
          </button>
        </div>
        <div
          id="practice-activity-settings"
          className={`${settingsOpen ? 'block' : 'hidden'} space-y-5`}
        >
          <label className="slp-calm-toggle">
            <input
              type="checkbox"
              checked={userCalm}
              onChange={(event) => setUserCalm(event.target.checked)}
            />
            Calm mode
          </label>
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
        </div>
        <header className="slp-game-heading">
          <h2>
            {paused
              ? 'Break time'
              : finished
                ? 'My results'
                : 'Picture practice'}
          </h2>
          <span className="slp-star-pill">
            <Star aria-hidden="true" size={20} fill="currentColor" />
            {rewards.reduce((sum, item) => sum + item.stars, 0)} stars
          </span>
        </header>
        <RoundPath
          results={rewards.map((result, i) =>
            visited.has(prompts[i].id) ? result : undefined,
          )}
          current={finished ? -1 : index}
          total={prompts.length}
        />
        {lobby && !paused ? (
          <PracticeWelcome
            pictures={prompts.slice(0, 3).map(getPictureUrl)}
            onGo={() => setLobby(false)}
          />
        ) : paused ? (
          <div className="slp-rest space-y-5">
            <Images
              size={72}
              strokeWidth={1.5}
              className="slp-adventure-mark mx-auto"
              aria-hidden="true"
            />
            <h2 className="text-2xl font-bold">Take a breather</h2>
            <p>
              {completed.size} practice{' '}
              {completed.size === 1 ? 'turn' : 'turns'} tried. Every try is part
              of learning.
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
          <RoundRecap
            results={rewards}
            calm={calm}
            onRetryWord={(i) => retryWord(prompts[i].id)}
            onAgain={restart}
            onDone={() => setPaused(true)}
          />
        ) : (
          <div
            className={
              showingFeedback ? 'slp-feedback-stage' : 'slp-lesson-stage'
            }
          >
            <PracticeTurn
              canContinue={canContinue}
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
            </PracticeTurn>
          </div>
        )}
      </section>
    </Root>
  )
}
