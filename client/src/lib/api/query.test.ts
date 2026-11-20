import { AxiosError, CanceledError } from 'axios'
import type { AxiosResponse } from 'axios'
import { expect, it } from 'vitest'
import { QueryClient, queryOptions } from '@tanstack/react-query'
import { retryApiQuery } from './query'

const httpError = (status: number) =>
  new AxiosError('Request failed', undefined, undefined, undefined, {
    status,
  } as AxiosResponse)

it.each([400, 401, 403, 404, 409, 419, 422])(
  'does not retry permanent HTTP %s',
  (status) => {
    expect(retryApiQuery(0, httpError(status))).toBe(false)
  },
)

it.each([408, 429, 500, 502, 503])(
  'bounds transient HTTP %s retries',
  (status) => {
    expect(retryApiQuery(0, httpError(status))).toBe(true)
    expect(retryApiQuery(2, httpError(status))).toBe(true)
    expect(retryApiQuery(3, httpError(status))).toBe(false)
  },
)

it('retries Axios network failures but not cancellation or programming errors', () => {
  expect(retryApiQuery(0, new AxiosError('Network Error'))).toBe(true)
  expect(retryApiQuery(0, new CanceledError())).toBe(false)
  expect(retryApiQuery(0, new Error('Invalid response shape'))).toBe(false)
})

it('lets Query recover from a transient failure without retrying a later forbidden request', async () => {
  const client = new QueryClient()
  let attempts = 0
  const query = queryOptions({
    queryKey: ['retry-check'],
    retry: retryApiQuery,
    retryDelay: 0,
    queryFn: async () => {
      attempts++
      if (attempts === 1) throw httpError(503)
      return 'recovered'
    },
  })
  await expect(client.query(query)).resolves.toBe('recovered')
  expect(attempts).toBe(2)
  attempts = 0
  await expect(
    client.query({
      ...query,
      queryFn: async () => {
        attempts++
        throw httpError(403)
      },
    }),
  ).rejects.toMatchObject({ response: { status: 403 } })
  expect(attempts).toBe(1)
  client.clear()
})
