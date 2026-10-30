/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import SlpAlert from './SlpAlert'

it('shows a clear unscorable state for unknown overall results', () => {
  render(<SlpAlert status="unknown" />)

  expect(screen.getByRole('status').textContent).toContain(
    'could not be scored reliably',
  )
})
