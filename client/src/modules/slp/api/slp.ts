import { api } from '#/lib/api/client'

export type PhonemeScore = {
  phoneme: string
  score: number
  word?: string
  wordIndex?: number
}

export type LowScoringUnit = {
  unit: string
  score: number
}

export type WordAssessment = {
  word?: string
  avgScore: number
  lowUnits: LowScoringUnit[]
  status: 'accurate' | 'mixed' | 'needs_work'
}

export type UnitAssessment = {
  unit: string
  avgScore: number
  examples?: string[]
}

export type OverallAssessment = {
  avgScore: number
  percentAboveNeedsWork: number
  status: 'accurate' | 'mixed' | 'needs_work' | 'unknown'
}

export type StructuredAssessment = {
  reference: string
  transcript: string
  overall: OverallAssessment
  words: WordAssessment[]
  accurateUnits: UnitAssessment[]
  needsWorkUnits: UnitAssessment[]
}

export type AssessMeta = {
  alignmentSource: string
  cer: number
}

export type AssessAnalysis = {
  transcript: string
  lowScoring: PhonemeScore[]
  structured: StructuredAssessment
}

export type AssessFeedback = {
  text: string
}

export type AssessResponse = {
  meta: AssessMeta
  analysis: AssessAnalysis
  feedback: AssessFeedback
}

export const MAX_AUDIO_BYTES = 10 * 1024 * 1024
export const MAX_REFERENCE_LENGTH = 800

export const assessPronunciation = async (
  audioBlob: Blob,
  referenceText: string,
): Promise<AssessResponse> => {
  if (audioBlob.size === 0 || audioBlob.size > MAX_AUDIO_BYTES) {
    throw new Error('Recording must be between 1 byte and 10 MiB.')
  }

  const trimmedReferenceText = referenceText.trim()
  if (
    !trimmedReferenceText ||
    trimmedReferenceText.length > MAX_REFERENCE_LENGTH
  ) {
    throw new Error('Reference text must be between 1 and 800 characters.')
  }

  const formData = new FormData()
  const extension = audioBlob.type.toLowerCase().includes('wav')
    ? 'wav'
    : 'webm'
  formData.append('audio', audioBlob, `recording.${extension}`)
  formData.append('reference_text', trimmedReferenceText)

  const { data } = await api<{ data: AssessResponse }>('/api/v1/slp/assess', {
    method: 'POST',
    data: formData,
    timeout: 50_000,
  })
  return data
}
