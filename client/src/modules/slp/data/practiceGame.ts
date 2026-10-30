import type { AssessResponse } from '../api/slp'

export type PracticeReflection = 'independent' | 'with_help' | 'try_again'
export type CheckOutcome =
  | 'not_checked'
  | 'checking'
  | 'matched'
  | 'review'
  | 'different'
  | 'unscorable'
  | 'unavailable'
export type WordProgress = {
  promptId: string
  word: string
  recordingKey: string
  attempts: number
  replayed: boolean
  reflected: boolean
  reflection: PracticeReflection | null
  outcome: CheckOutcome
  transcript: string
}
export type PracticeGame = Partial<Record<string, WordProgress>>
export type GameAction =
  | { type: 'recorded'; promptId: string; word: string; recordingKey: string }
  | { type: 'replayed'; promptId: string }
  | { type: 'reflected'; promptId: string; reflection: PracticeReflection }
  | {
      type: 'check'
      promptId: string
      recordingKey: string
      outcome: CheckOutcome
      transcript: string
    }
  | { type: 'cancel_checks' }
  | { type: 'reset' }

export function practiceGameReducer(
  state: PracticeGame,
  action: GameAction,
): PracticeGame {
  if (action.type === 'reset') return {}
  if (action.type === 'cancel_checks') {
    return Object.fromEntries(
      Object.entries(state).map(([key, value]) => [
        key,
        value?.outcome === 'checking'
          ? { ...value, outcome: 'not_checked' }
          : value,
      ]),
    )
  }
  const previous = state[action.promptId]
  if (action.type === 'recorded') {
    if (
      previous?.recordingKey === action.recordingKey &&
      previous.word === action.word
    )
      return state
    const sameWord = previous?.word === action.word
    return {
      ...state,
      [action.promptId]: {
        promptId: action.promptId,
        word: action.word,
        recordingKey: action.recordingKey,
        attempts: sameWord ? previous.attempts + 1 : 1,
        replayed: sameWord && previous.replayed,
        reflected: sameWord && previous.reflected,
        reflection: null,
        outcome: 'not_checked',
        transcript: '',
      },
    }
  }
  if (!previous) return state
  if (action.type === 'replayed')
    return { ...state, [action.promptId]: { ...previous, replayed: true } }
  if (action.type === 'reflected')
    return {
      ...state,
      [action.promptId]: {
        ...previous,
        reflected: true,
        reflection: action.reflection,
      },
    }
  if (action.recordingKey !== previous.recordingKey) return state
  return {
    ...state,
    [action.promptId]: {
      ...previous,
      outcome: action.outcome,
      transcript: action.transcript,
    },
  }
}

export function getPracticeStars(progress?: WordProgress): number {
  return progress
    ? 1 + Number(progress.replayed) + Number(progress.reflected)
    : 0
}

export function getCheckOutcome(result: AssessResponse): CheckOutcome {
  if (
    result.meta.schemaVersion !== '2.0' ||
    result.meta.measurement !== 'transcript_agreement_only'
  )
    return 'review'
  if (result.meta.status === 'unscorable') return 'unscorable'
  if (result.meta.status === 'task_mismatch') return 'different'
  return result.meta.status === 'review_required' && result.meta.cer === 0
    ? 'matched'
    : 'review'
}

export function summarizePractice(state: PracticeGame, promptIds: string[]) {
  const turns = promptIds.flatMap((id) => (state[id] ? [state[id]] : []))
  return {
    stars: turns.reduce((total, turn) => total + getPracticeStars(turn), 0),
    recorded: turns.length,
    replayed: turns.filter((turn) => turn.replayed).length,
    reflected: turns.filter((turn) => turn.reflected).length,
    independent: turns.filter((turn) => turn.reflection === 'independent')
      .length,
    withHelp: turns.filter((turn) => turn.reflection === 'with_help').length,
    attempts: turns.reduce((total, turn) => total + turn.attempts, 0),
    matched: turns.filter((turn) => turn.outcome === 'matched').length,
  }
}

export const reflectionLabels: Record<PracticeReflection, string> = {
  independent: 'I tried on my own',
  with_help: 'I used a clue',
  try_again: 'I want another go',
}

export const checkFeedback: Record<
  CheckOutcome,
  { title: string; detail: string }
> = {
  not_checked: {
    title: 'A practice turn recorded',
    detail: 'Listen back together. The automatic word check is optional.',
  },
  checking: {
    title: 'The word listener is checking…',
    detail: 'Your practice star is already earned.',
  },
  matched: {
    title: 'The transcript matched!',
    detail:
      'The automatic listener wrote the practice word. This does not measure sound accuracy.',
  },
  review: {
    title: 'Let’s listen together',
    detail:
      'A helper can compare the recording and the practice word. The listener can make mistakes.',
  },
  different: {
    title: 'Let’s check what was heard',
    detail:
      'The listener heard something different. Play it back together; this is not a sound-correctness score.',
  },
  unscorable: {
    title: 'A quieter spot might help',
    detail:
      'The listener could not pick up usable speech. Try a short recording closer to the microphone.',
  },
  unavailable: {
    title: 'Your practice still counts',
    detail:
      'The word check is unavailable. Keep your stars and try the check again later.',
  },
}
