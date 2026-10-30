/** @vitest-environment jsdom */
import { api } from '#/lib/api/client'
import { beforeEach, expect, it, vi } from 'vitest'
import { assessPronunciation } from './slp'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))

beforeEach(() => vi.clearAllMocks())

it('posts bounded assessment fields to Laravel using browser-managed multipart headers', async () => {
  vi.mocked(api).mockResolvedValue({
    data: { analysis: { transcript: 'test' } },
  })
  const audio = new Blob(['audio'], { type: 'audio/webm' })

  await assessPronunciation(audio, '  practice text  ')

  expect(api).toHaveBeenCalledOnce()
  const [path, config] = vi.mocked(api).mock.calls[0]
  expect(path).toBe('/api/v1/slp/assess')
  expect(config?.method).toBe('POST')
  expect(config?.timeout).toBe(50_000)
  expect(config?.headers).toBeUndefined()
  expect(config?.data).toBeInstanceOf(FormData)
  expect((config?.data as FormData).get('reference_text')).toBe('practice text')
  expect(((config?.data as FormData).get('audio') as File).name).toBe(
    'recording.webm',
  )
})

it('rejects empty, oversized audio and reference text before making a request', async () => {
  await expect(
    assessPronunciation(new Blob(), 'practice text'),
  ).rejects.toThrow('10 MiB')
  await expect(
    assessPronunciation(
      new Blob(['a'.repeat(10 * 1024 * 1024 + 1)]),
      'practice text',
    ),
  ).rejects.toThrow('10 MiB')
  await expect(
    assessPronunciation(new Blob(['audio']), 'a'.repeat(801)),
  ).rejects.toThrow('800')
  expect(api).not.toHaveBeenCalled()
})

it('sends the selected Filipino language and cancellation signal', async () => {
  vi.mocked(api).mockResolvedValue({ data: {} })
  const controller = new AbortController()
  await assessPronunciation(
    new Blob(['audio']),
    'araw',
    controller.signal,
    'tl',
  )
  const config = vi.mocked(api).mock.calls[0][1]
  expect((config?.data as FormData).get('language')).toBe('tl')
  expect(config?.signal).toBe(controller.signal)
})
