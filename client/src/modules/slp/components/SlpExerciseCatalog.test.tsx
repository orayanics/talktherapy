/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import SlpExerciseCatalog from './SlpExerciseCatalog'
import { fetchSlpExercises } from '../api/exercises'

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: {
      data: [
        {
          id: 'exercise',
          module: 'voice',
          scope: 'private',
          latest_version: {
            id: 'version',
            language: 'tl',
            revision: 2,
            prompt_text: 'Practice voice',
          },
        },
      ],
      meta: { current_page: 1, last_page: 2, total: 16 },
    },
    isPending: false,
    isError: false,
  }),
}))
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}))
vi.mock('../api/exercises', () => ({ fetchSlpExercises: vi.fn() }))
vi.mock('./ExerciseDelivery', () => ({
  default: () => <button>Patient visibility</button>,
}))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('combines module, language and scope filters and resets pagination when filters change', () => {
  render(<SlpExerciseCatalog />)
  expect(
    screen
      .getByRole('searchbox', { name: 'Language code' })
      .closest('.drawer-side'),
  ).toBeNull()
  expect(screen.getByLabelText('Module').closest('.drawer-side')).not.toBeNull()
  expect(screen.getByLabelText('Scope').closest('.drawer-side')).not.toBeNull()
  expect(screen.getByRole('table').textContent).toContain('Practice voice')
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
  expect(fetchSlpExercises).toHaveBeenLastCalledWith(2, {})
  fireEvent.click(screen.getByRole('button', { name: 'Open Filters' }))
  fireEvent.change(screen.getByLabelText('Module'), {
    target: { value: 'voice' },
  })
  fireEvent.change(screen.getByRole('searchbox', { name: 'Language code' }), {
    target: { value: 'tl' },
  })
  fireEvent.change(screen.getByLabelText('Scope'), {
    target: { value: 'private' },
  })
  expect(fetchSlpExercises).toHaveBeenLastCalledWith(1, {
    module: 'voice',
    language: 'tl',
    scope: 'private',
  })
  fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
  expect(fetchSlpExercises).toHaveBeenLastCalledWith(1, {})
})
