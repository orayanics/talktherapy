import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { getPictureUrl, getPracticeWord } from '../data/practiceContent'
import type { PicturePrompt, PracticeLanguage } from '../data/practiceContent'
import PracticeBuddy from './PracticeBuddy'

export default function PracticePicture({
  prompt,
  language,
  customWord,
  focusMode,
}: {
  prompt: PicturePrompt
  language: PracticeLanguage
  customWord: string
  focusMode: boolean
}) {
  const [revealed, setRevealed] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const word = customWord.trim() || getPracticeWord(prompt, language)
  const showWord = revealed || !!customWord.trim()
  return (
    <div className="slp-picture-panel">
      {!focusMode && (
        <div className="slp-prompt-buddy">
          <PracticeBuddy size={64} />
          <p>
            {language === 'tl'
              ? 'Ano ang nasa larawan? Sabihin natin!'
              : 'What’s in the picture? Let’s say it!'}
          </p>
        </div>
      )}
      <div className="slp-picture-frame">
        {customWord.trim() ? (
          <div
            className="slp-custom-word"
            lang={language === 'tl' ? 'fil' : 'en'}
          >
            {word}
          </div>
        ) : unavailable ? (
          <p role="status">
            This picture could not load. Ask your helper to show or describe the
            word.
          </p>
        ) : (
          <img
            src={getPictureUrl(prompt)}
            alt={
              language === 'tl' ? 'Larawang papangalanan' : 'Picture to name'
            }
            width={640}
            height={480}
            decoding="async"
            onError={() => setUnavailable(true)}
          />
        )}
      </div>
      <div className="space-y-4 pt-5 text-center">
        <h2
          className="text-xl font-bold sm:text-2xl"
          lang={language === 'tl' ? 'fil' : 'en'}
        >
          {customWord.trim()
            ? language === 'tl'
              ? 'Sabihin ang iyong salita.'
              : 'Say your practice word.'
            : prompt.question[language]}
        </h2>
        {!customWord.trim() && (
          <>
            <button
              className="slp-reveal"
              type="button"
              aria-expanded={revealed}
              aria-controls="practice-answer"
              onClick={() => setRevealed(!revealed)}
            >
              {revealed ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
              {language === 'tl'
                ? revealed
                  ? 'Itago ang salita'
                  : 'Ipakita ang salita'
                : revealed
                  ? 'Hide word'
                  : 'Show word'}
            </button>
            {showWord && (
              <p
                id="practice-answer"
                className="text-3xl font-bold"
                lang={language === 'tl' ? 'fil' : 'en'}
              >
                {word}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
