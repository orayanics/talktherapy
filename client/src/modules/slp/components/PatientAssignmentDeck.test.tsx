/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import PatientAssignmentDeck from './PatientAssignmentDeck'

vi.mock('./AssignedExercise', () => ({ default: () => null }))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('speaks the active prompt outside the swipe target and follows card navigation', async () => {
  const voice = { name: 'English', localService: true, lang: 'en-US' }
  const speak = vi.fn()
  vi.stubGlobal(
    'speechSynthesis',
    Object.assign(new EventTarget(), {
      getVoices: () => [voice],
      cancel: vi.fn(),
      speak,
    }),
  )
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      constructor(public text: string) {}
    },
  )
  render(
    <PatientAssignmentDeck
      assignments={['First', 'Second'].map((text) => ({
        id: text,
        patient_id: 'p',
        clinician_id: 'c',
        exercise_version_id: text,
        schedule: null,
        status: 'active',
        version: {
          id: text,
          prompt_text: text,
          task_type: 'reading',
          language: 'en',
          status: 'published',
        },
      }))}
    />,
  )
  const listen = screen.getByRole('button', { name: 'Listen to prompt' })
  expect(
    screen.getByRole('group', { name: 'Exercise 1 of 2' }).contains(listen),
  ).toBe(false)
  fireEvent.click(listen)
  expect(speak).toHaveBeenCalledWith(
    expect.objectContaining({ text: 'First', voice }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Next exercise' }))
  await screen.findByRole('group', { name: 'Exercise 2 of 2' })
  fireEvent.click(listen)
  expect(speak).toHaveBeenLastCalledWith(
    expect.objectContaining({ text: 'Second', voice }),
  )
})
