import { expect, it, vi } from 'vitest'
import { api } from '#/lib/api/client'
import { saveCollection } from './collections'

vi.mock('#/lib/api/client', () => ({
  api: vi.fn().mockResolvedValue({ data: {} }),
}))

it('preserves the uploaded cover and uses POST multipart with PATCH override', async () => {
  const data = new FormData()
  data.append(
    'cover',
    new Blob(['picture'], { type: 'image/png' }),
    'cover.png',
  )
  data.append('is_hidden', '0')
  await saveCollection(data, 'collection')
  expect(api).toHaveBeenCalledWith('/api/v1/slp/collections/collection', {
    method: 'POST',
    data,
  })
  expect(data.get('_method')).toBe('PATCH')
  expect((data.get('cover') as File).name).toBe('cover.png')
  expect(data.get('is_hidden')).toBe('0')
})
