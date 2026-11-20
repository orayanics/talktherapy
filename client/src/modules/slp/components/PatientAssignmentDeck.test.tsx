/** @vitest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import PatientAssignmentDeck from './PatientAssignmentDeck'
import type { SlpAssignment } from '../api/workflow'

vi.mock('./AssignedExercise', () => ({
  default: () => <div>Record exercise</div>,
}))

const assignments = [
  {
    id: 'one',
    exercise_version_id: 'v1',
    patient_id: 'p',
    clinician_id: 'c',
    status: 'active',
    schedule: null,
    version: {
      id: 'v1',
      prompt_text: 'Say hello',
      task_type: 'reading',
      language: 'en',
      status: 'published',
    },
  },
  {
    id: 'two',
    exercise_version_id: 'v2',
    patient_id: 'p',
    clinician_id: 'c',
    status: 'active',
    schedule: null,
    version: {
      id: 'v2',
      prompt_text: 'Say goodbye',
      task_type: 'reading',
      language: 'en',
      status: 'published',
    },
  },
] satisfies SlpAssignment[]

afterEach(() => vi.useRealTimers())

Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
  value: vi.fn(),
})

it('moves through assignments with the next button and drag gesture', () => {
  vi.useFakeTimers()
  render(<PatientAssignmentDeck assignments={assignments} />)
  expect(screen.getByText('Say hello')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Next exercise' }))
  act(() => vi.runAllTimers())
  expect(screen.getByText('Say goodbye')).toBeTruthy()
  const card = screen.getByText('Say goodbye').closest('.slp-deck-card')
  expect(card).toBeTruthy()
  fireEvent.pointerDown(card!, { clientX: 240, pointerId: 1 })
  fireEvent.pointerMove(card!, { clientX: 400, pointerId: 1 })
  fireEvent.pointerUp(card!, { clientX: 400, pointerId: 1 })
  act(() => vi.runAllTimers())
  expect(screen.getByText('Say hello')).toBeTruthy()
})
