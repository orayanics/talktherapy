/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import type { PropsWithChildren } from 'react'
import { expect, it, vi } from 'vitest'
import { api } from '#/lib/api/client'
import { useResendOtpMutation } from './useActivationMutations'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))
vi.mock('#/context/AlertContext', () => ({ useAlert: vi.fn() }))
vi.mock('@tanstack/react-router', () => ({ useNavigate: vi.fn() }))

it('accepts the empty 202 response when resending an activation code', async () => {
  vi.mocked(api).mockResolvedValue(null)
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  const { result, unmount } = renderHook(() => useResendOtpMutation(), {
    wrapper: ({ children }: PropsWithChildren) =>
      createElement(QueryClientProvider, { client }, children),
  })

  await expect(
    result.current.mutateAsync({ email: 'patient@example.com' }),
  ).resolves.toBeUndefined()
  expect(api).toHaveBeenCalledWith('/api/v1/activation/otp/resend', {
    method: 'POST',
    data: JSON.stringify({ email: 'patient@example.com' }),
  })
  unmount()
  client.clear()
})
