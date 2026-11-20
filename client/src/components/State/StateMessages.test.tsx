/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import StateError from './StateError'
import StateLoading from './StateLoading'
import StateNull from './StateNull'

it('renders custom state messages', () => {
  const { rerender } = render(
    <StateNull title="No appointments" message="Try another date." />,
  )
  expect(screen.getByText('No appointments')).toBeTruthy()
  expect(screen.getByText('Try another date.')).toBeTruthy()

  rerender(<StateError title="Appointments unavailable" message="Try again." />)
  expect(screen.getByText('Appointments unavailable')).toBeTruthy()
  expect(screen.getByText('Try again.')).toBeTruthy()

  rerender(<StateLoading message="Loading appointments..." />)
  expect(screen.getByText('Loading appointments...')).toBeTruthy()
})
