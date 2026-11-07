/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import SessionBoundary from './SessionBoundary'

const { useSession, retry } = vi.hoisted(() => ({
  useSession: vi.fn(),
  retry: vi.fn(),
}))
vi.mock('#/modules/auth/api/auth-client', () => ({
  authClient: { useSession },
}))
vi.mock('@tanstack/react-router', () => ({
  Navigate: () => <p>Login redirect</p>,
}))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('shows retryable session failures and recovers instead of redirecting', () => {
  useSession.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: true,
    refetch: retry,
  })
  const { rerender } = render(
    <SessionBoundary>Protected content</SessionBoundary>,
  )
  expect(screen.getByRole('alert')).toBeTruthy()
  expect(screen.queryByText('Login redirect')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  expect(retry).toHaveBeenCalledOnce()
  useSession.mockReturnValue({
    data: { user: { id: 'patient', role: 'patient' } },
    isPending: false,
    isError: false,
  })
  rerender(<SessionBoundary>Protected content</SessionBoundary>)
  expect(screen.getByText('Protected content')).toBeTruthy()
})

it('redirects a confirmed signed-out session', () => {
  useSession.mockReturnValue({ data: null, isPending: false, isError: false })
  render(<SessionBoundary>Protected content</SessionBoundary>)
  expect(screen.getByText('Login redirect')).toBeTruthy()
})
