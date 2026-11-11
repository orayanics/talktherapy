/** @vitest-environment jsdom */
import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { api } from '#/lib/api/client'
import { fetchSlpExercises, slpExerciseKeys } from './exercises'

vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))

describe('SLP exercise API contract', () => {
  it('keeps list and detail keys separated', () => {
    expect(slpExerciseKeys.list(2)).toEqual(['slp-exercises', 'list', 2, {}])
    expect(slpExerciseKeys.detail('exercise-1')).toEqual([
      'slp-exercises',
      'exercise-1',
    ])
  })
})

it('sends pagination and filters to the API and caches each filter combination separately', async () => {
  vi.mocked(api).mockResolvedValue({ data: [], meta: {} })
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  })
  const filters = { module: 'voice', language: 'tl', scope: 'private' } as const
  await client.fetchQuery(fetchSlpExercises(2, filters))
  expect(api).toHaveBeenLastCalledWith('/api/v1/slp/exercises', {
    method: 'GET',
    params: { page: 2, ...filters },
  })
  await client.fetchQuery(fetchSlpExercises(2, { ...filters, language: 'en' }))
  expect(api).toHaveBeenCalledTimes(2)
  expect(api).toHaveBeenLastCalledWith('/api/v1/slp/exercises', {
    method: 'GET',
    params: { page: 2, ...filters, language: 'en' },
  })
  client.clear()
})
