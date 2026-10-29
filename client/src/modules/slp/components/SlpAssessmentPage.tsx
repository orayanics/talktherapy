import { useState } from 'react'
import {
  Bird,
  Cat,
  Fish,
  Flower2,
  Mic,
  Pause,
  RotateCcw,
  Square,
  Sun,
} from 'lucide-react'
import useSlpAssessment from '../hooks/useSlpAssessment'
import usePracticeRecorder from '../hooks/usePracticeRecorder'
import { MAX_REFERENCE_LENGTH } from '../api/slp'

const prompts = [
  { word: 'sun', filipino: 'araw', picture: Sun, scene: 'A sunny start' },
  { word: 'fish', filipino: 'isda', picture: Fish, scene: 'By the pond' },
  { word: 'cat', filipino: 'pusa', picture: Cat, scene: 'A little visitor' },
  { word: 'bird', filipino: 'ibon', picture: Bird, scene: 'Up in the trees' },
  {
    word: 'flower',
    filipino: 'bulaklak',
    picture: Flower2,
    scene: 'In the garden',
  },
]

export default function SlpAssessmentPage() {
  const [index, setIndex] = useState(0)
  const [language, setLanguage] = useState<'en' | 'tl'>('en')
  const [mode, setMode] = useState<'explore' | 'focus'>('explore')
  const [customWord, setCustomWord] = useState('')
  const [paused, setPaused] = useState(false)
  const [finished, setFinished] = useState(false)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const recorder = usePracticeRecorder()
  const assessment = useSlpAssessment()
  const prompt = prompts[index]
  const Picture = prompt.picture
  const word =
    customWord.trim() || (language === 'tl' ? prompt.filipino : prompt.word)
  const capturing =
    recorder.state === 'recording' || recorder.state === 'requesting_permission'
  const locked = capturing || assessment.isSubmitting
  const error = recorder.error ?? assessment.apiError
  const clear = () => {
    recorder.clear()
    assessment.resetAssessment()
  }
  const next = () => {
    clear()
    setCustomWord('')
    if (index === prompts.length - 1) setFinished(true)
    else setIndex(index + 1)
  }
  const analyze = async () => {
    if (!recorder.audio) return
    setCompleted((previous) => new Set(previous).add(index))
    await assessment.submitAssessment(recorder.audio, word, language)
  }
  const versioned = assessment.result?.meta.schemaVersion === '2.0'
  const feedback = versioned
    ? assessment.result?.feedback.text
    : 'Thanks for trying! Listen together, then try again or take a break.'

  return (
    <section
      className="mx-auto max-w-5xl space-y-6 text-slate-900"
      aria-label="Speech practice"
    >
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === 'explore' ? 'Our sound garden' : 'Speech practice'}
          </h1>
          <p className="text-sm text-slate-600">
            {mode === 'explore'
              ? 'One word, one turn. Explore with your helper.'
              : 'Record, replay, and practice at your pace.'}
          </p>
        </div>
        <button
          type="button"
          className="btn min-h-12"
          onClick={() => {
            clear()
            setPaused(!paused)
          }}
        >
          <Pause size={18} aria-hidden="true" />
          {paused ? 'Come back to practice' : 'Take a break'}
        </button>
      </header>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          Practice language
          <select
            className="select min-h-12"
            value={language}
            disabled={locked}
            onChange={(event) => {
              clear()
              setCustomWord('')
              setCompleted(new Set())
              setIndex(0)
              setFinished(false)
              setLanguage(event.target.value as 'en' | 'tl')
            }}
          >
            <option value="en">English</option>
            <option value="tl">Filipino (Tagalog)</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          Activity style
          <select
            className="select min-h-12"
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
      <div
        className="flex flex-wrap items-center gap-3"
        aria-label={`${completed.size} of 5 practice turns tried`}
      >
        {prompts.map((item, step) => (
          <span
            key={item.word}
            className={`rounded-full border px-4 py-2 text-sm ${completed.has(step) ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-slate-300 text-slate-600'}`}
          >
            {step + 1}
            {completed.has(step)
              ? ' · Tried'
              : step === index && !finished
                ? ' · Your turn'
                : ''}
          </span>
        ))}
      </div>
      {paused || finished ? (
        <div className="rounded-3xl bg-emerald-50 p-8 text-center space-y-5">
          <Flower2
            className="mx-auto text-emerald-800"
            size={80}
            aria-hidden="true"
          />
          <h2 className="text-2xl font-bold">
            {paused ? 'Time for a little rest' : 'Thanks for exploring!'}
          </h2>
          <p>
            {completed.size} practice {completed.size === 1 ? 'turn' : 'turns'}{' '}
            tried. Every try is part of learning.
          </p>
          <button
            type="button"
            className="btn btn-neutral min-h-12"
            onClick={() => {
              clear()
              setPaused(false)
              setFinished(false)
              if (finished) {
                setIndex(0)
                setCompleted(new Set())
              }
            }}
          >
            {paused ? 'I’m ready' : 'Explore again'}
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-amber-50 p-8 flex flex-col items-center justify-center gap-5 text-center">
            <p className="text-sm text-amber-900">
              {customWord.trim() ? 'Your practice word' : prompt.scene}
            </p>
            {!customWord.trim() && mode === 'explore' && (
              <Picture
                size={112}
                strokeWidth={1.5}
                className="text-amber-800"
                aria-hidden="true"
              />
            )}
            <h2
              lang={language === 'tl' ? 'fil' : 'en'}
              className="break-words max-w-full text-5xl font-bold"
            >
              {word}
            </h2>
            <p className="max-w-xs text-slate-700">
              {mode === 'explore'
                ? 'Ask your helper to say the word. Listen, then have your turn.'
                : 'Say the word or your chosen phrase. Replay to reflect on your practice.'}
            </p>
          </div>
          <div className="space-y-5 py-2">
            <div
              role="status"
              aria-live="polite"
              className="text-lg font-semibold"
            >
              {recorder.state === 'requesting_permission'
                ? 'Ask your helper to allow the microphone.'
                : recorder.state === 'recording'
                  ? 'I’m listening. Say your word, then tap Done.'
                  : assessment.isSubmitting
                    ? 'Listening to your turn…'
                    : assessment.result
                      ? 'Thanks for having a go!'
                      : recorder.audio
                        ? 'Want to hear your turn?'
                        : 'Ready when you are.'}
            </div>
            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-900">
                {error}
              </p>
            )}
            {recorder.state === 'recording' ? (
              <button
                type="button"
                className="btn btn-neutral min-h-14 w-full text-lg"
                onClick={recorder.stop}
              >
                <Square size={20} aria-hidden="true" />
                Done
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-neutral min-h-14 w-full text-lg"
                disabled={locked}
                onClick={() => {
                  assessment.resetAssessment()
                  void recorder.start()
                }}
              >
                <Mic size={20} aria-hidden="true" />
                {recorder.audio ? 'Record again' : 'My turn'}
              </button>
            )}
            {recorder.url && (
              <div className="space-y-2">
                <label htmlFor="practice-replay" className="font-medium">
                  Listen to my turn
                </label>
                <audio
                  id="practice-replay"
                  controls
                  src={recorder.url}
                  className="w-full"
                  aria-label="Listen to my recording"
                />
              </div>
            )}
            {recorder.audio && !assessment.result && (
              <button
                type="button"
                className="btn min-h-12 w-full"
                disabled={locked}
                onClick={() => void analyze()}
              >
                {assessment.isSubmitting ? 'Listening…' : 'Finish my turn'}
              </button>
            )}
            {assessment.result && (
              <div className="rounded-2xl bg-emerald-50 p-5" role="status">
                <p>{feedback}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn min-h-12"
                disabled={locked}
                onClick={next}
              >
                {index === 4 ? 'Finish exploring' : 'Next word'}
              </button>
              {(locked || recorder.audio) && (
                <button type="button" className="btn min-h-12" onClick={clear}>
                  <RotateCcw size={18} aria-hidden="true" />
                  {locked ? 'Cancel turn' : 'Start over'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <details className="border-t border-slate-200 pt-4">
        <summary className="cursor-pointer py-3 font-medium">
          Practice settings and review · for you and your helper
        </summary>
        <div className="space-y-4 py-4 text-sm text-slate-700">
          <p>
            Proof of concept for ages 3–18 in the Philippines. Younger children
            need a helper. These example words have not been reviewed as therapy
            targets. Automated transcription cannot judge sound accuracy.
          </p>
          <p>
            Filipino mode uses Tagalog transcription. Other Philippine languages
            and mixed-language speech have not been evaluated.
          </p>
          <div className="space-y-2">
            <label className="block font-medium" htmlFor="practice-word">
              Word or short phrase from your speech plan
            </label>
            <input
              id="practice-word"
              className="input w-full"
              maxLength={MAX_REFERENCE_LENGTH}
              value={customWord}
              disabled={locked}
              onChange={(event) => {
                clear()
                setCustomWord(event.target.value)
              }}
              placeholder={prompt.word}
            />
          </div>
          <p>
            Sending a turn uses the private analysis service. Recordings are not
            enrolled for model training.
          </p>
          {assessment.result && (
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">
                  Automatic transcript · may contain mistakes
                </dt>
                <dd>
                  {assessment.result.analysis.transcript ||
                    'No transcript available'}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Review</dt>
                <dd>
                  {versioned
                    ? assessment.result.meta.status?.replaceAll('_', ' ')
                    : 'Legacy result · sound judgments withheld'}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Model</dt>
                <dd>{assessment.result.meta.modelVersion ?? 'Not provided'}</dd>
              </div>
            </dl>
          )}
        </div>
      </details>
    </section>
  )
}
