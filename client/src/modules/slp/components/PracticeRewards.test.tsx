/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { CheckInKeys, ReadyCountdown, RoundPath } from './PracticeRewards'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it('waits for Start in calm mode and starts only once', () => {
  vi.useFakeTimers()
  const go = vi.fn()
  render(<ReadyCountdown calm onGo={go} />)
  vi.advanceTimersByTime(5000)
  expect(go).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Start' }))
  fireEvent.click(screen.getByRole('button', { name: 'Start' }))
  expect(go).toHaveBeenCalledOnce()
})

it('supports shape-key shortcuts without treating them as correctness', () => {
  const pick = vi.fn()
  render(<CheckInKeys value={null} onPick={pick} />)
  fireEvent.keyDown(screen.getByRole('button', { name: /I said it/ }), {
    key: '4',
  })
  expect(pick).toHaveBeenCalledWith('skip')
})

it('counts visited entries rather than future empty path slots', () => {
  render(<RoundPath results={[undefined, undefined]} current={0} total={2} />)
  expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
    '0',
  )
})

it('starts once after the countdown finishes', () => {
  vi.useFakeTimers()
  const go = vi.fn()
  render(<ReadyCountdown calm={false} onGo={go} />)
  for (let i = 0; i < 3; i++) act(() => vi.advanceTimersByTime(900))
  expect(go).toHaveBeenCalledOnce()
  fireEvent.click(screen.getByRole('button', { name: 'Start now' }))
  expect(go).toHaveBeenCalledOnce()
})

it('blocks mouse and shortcut actions while a turn is busy', () => {
  const pick = vi.fn()
  render(<CheckInKeys disabled value={null} onPick={pick} />)
  const button = screen.getByRole('button', { name: /Another go/ })
  fireEvent.click(button)
  fireEvent.keyDown(button, { key: '3' })
  expect(pick).not.toHaveBeenCalled()
})
