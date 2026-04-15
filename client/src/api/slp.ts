import axios from 'axios'

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
  status: 'accurate' | 'mixed' | 'needs_work'
}

export type StructuredAssessment = {
  reference: string
  transcript: string
  overall: OverallAssessment
  words: WordAssessment[]
  accurateUnits: UnitAssessment[]
  needsWorkUnits: UnitAssessment[]
}

export type LLMFeedbackNote = {
  unit: string
  note: string
}

export type LLMFeedback = {
  overallSummary: string
  needsWork: LLMFeedbackNote[]
  accurate: LLMFeedbackNote[]
  nextPractice: string[]
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
  structured?: LLMFeedback
  llmError?: string
}

export type AssessResponse = {
  meta: AssessMeta
  analysis: AssessAnalysis
  feedback: AssessFeedback
}

const SLP_API_BASE = import.meta.env.VITE_SLP_API_URL ?? 'http://localhost:8000'

const slpApi = axios.create({
  baseURL: SLP_API_BASE,
  headers: {
    Accept: 'application/json',
  },
})

export const assessPronunciation = async (
  audioBlob: Blob,
  referenceText: string,
): Promise<AssessResponse> => {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  formData.append('referenceText', referenceText)

  const { data } = await slpApi.post<AssessResponse>('/assess', formData)
  return data
}
