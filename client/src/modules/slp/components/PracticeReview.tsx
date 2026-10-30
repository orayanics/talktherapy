import { MAX_REFERENCE_LENGTH } from '../api/slp'
import type { AssessResponse } from '../api/slp'
import type { PicturePrompt } from '../data/practiceContent'

export default function PracticeReview({
  prompt,
  word,
  customWord,
  onChange,
  locked,
  result,
}: {
  prompt: PicturePrompt
  word: string
  customWord: string
  onChange: (value: string) => void
  locked: boolean
  result: AssessResponse | null
}) {
  return (
    <details className="slp-review">
      <summary>Practice settings and review · for you and your helper</summary>
      <div className="space-y-4 py-4 text-sm leading-relaxed text-slate-700">
        <p>
          Picture-naming practice adapted from selected FIL-PAT vocabulary. This
          is a proof of concept, not the standardized assessment. Automated
          transcription cannot judge sound accuracy.
        </p>
        <p>
          <strong>Expected word:</strong> {word} · {prompt.filipino} /{' '}
          {prompt.english}. Accept familiar regional words when practicing; an
          ASR mismatch is not a speech error.
        </p>
        <label className="block space-y-2">
          <span className="block font-medium">
            Word or short phrase from your speech plan
          </span>
          <input
            className="input w-full"
            maxLength={MAX_REFERENCE_LENGTH}
            value={customWord}
            disabled={locked}
            onChange={(event) => onChange(event.target.value)}
            placeholder={word}
          />
        </label>
        <p>
          For ages 3–18; younger children need a helper. Filipino mode uses
          Tagalog transcription. Other Philippine languages and mixed-language
          speech have not been evaluated. Sending a turn uses the private
          analysis service; recordings are not enrolled for model training.
        </p>
        {result && (
          <dl className="space-y-2">
            <div>
              <dt className="font-medium">
                Automatic transcript · may contain mistakes
              </dt>
              <dd>{result.analysis.transcript || 'No transcript available'}</dd>
            </div>
            <div>
              <dt className="font-medium">Review</dt>
              <dd>
                {result.meta.schemaVersion === '2.0'
                  ? result.meta.status?.replaceAll('_', ' ')
                  : 'Legacy result · sound judgments withheld'}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Model</dt>
              <dd>{result.meta.modelVersion ?? 'Not provided'}</dd>
            </div>
          </dl>
        )}
      </div>
    </details>
  )
}
