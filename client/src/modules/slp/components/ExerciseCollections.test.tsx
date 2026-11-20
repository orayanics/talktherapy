/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, expect, it, vi } from 'vitest'
import { api } from '#/lib/api/client'
import ExerciseCollections from './ExerciseCollections'

vi.mock('#/modules/auth/hooks/useAuth', () => ({
  useAuthGuard: () => ({ role: 'clinician' }),
}))
vi.mock('#/lib/api/client', () => ({ api: vi.fn() }))
vi.mock('./SlpExerciseCatalog', () => ({
  default: ({ collectionId }: { collectionId: string }) => (
    <p>Exercises in {collectionId}</p>
  ),
}))
vi.mock('./CollectionPractice', () => ({
  default: ({ collectionId }: { collectionId: string }) => (
    <p>Patient practice in {collectionId}</p>
  ),
}))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const collection = {
  id: 'collection-1',
  owner_id: 'owner',
  can_manage: true,
  patient_audience: 'assigned',
  title: 'Words',
  description: 'Practice words',
  is_hidden: false,
  cover_url: null,
  updated_at: '2026-11-20',
}
const meta = {
  current_page: 1,
  last_page: 1,
  total: 1,
  per_page: 15,
  from: 1,
  to: 1,
}
function mount(patientView = false) {
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <ExerciseCollections patientView={patientView} />
    </QueryClientProvider>,
  )
}

it('uploads a cover and hidden collection using multipart data, then opens its exercises', async () => {
  vi.mocked(api).mockImplementation(async (_path, options) =>
    options?.method === 'POST'
      ? { data: { ...collection, is_hidden: true } }
      : { data: [], meta },
  )
  mount()
  fireEvent.click(screen.getByRole('button', { name: 'New collection' }))
  fireEvent.change(screen.getByLabelText(/Title/), {
    target: { value: 'Words' },
  })
  const cover = new File(['image'], 'cover.png', { type: 'image/png' })
  fireEvent.change(screen.getByLabelText('Photo cover'), {
    target: { files: [cover] },
  })
  fireEvent.click(
    screen.getByLabelText('Hide collection from new practice and assignments'),
  )
  fireEvent.submit(screen.getByRole('form', { name: 'New collection' }))
  await screen.findByText('Exercises in collection-1')
  const post = vi
    .mocked(api)
    .mock.calls.find(([, options]) => options?.method === 'POST')!
  expect(post[0]).toBe('/api/v1/slp/collections')
  expect((post[1]?.data as FormData).get('title')).toBe('Words')
  expect((post[1]?.data as FormData).get('is_hidden')).toBe('1')
  expect(post[1]?.headers).toBeUndefined()
  expect(screen.getByRole('status').textContent).toContain(
    'Existing assignments remain available',
  )
})

it('edits with method spoofing, preserves input on failure, and confirms deletion', async () => {
  vi.mocked(api).mockImplementation(async (_path, options) => {
    if (options?.method === 'POST') throw new Error('Upload unavailable')
    return { data: [collection], meta }
  })
  mount()
  fireEvent.click(
    await screen.findByRole('button', { name: /Words Practice words/ }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Edit collection' }))
  fireEvent.change(screen.getByLabelText(/Title/), {
    target: { value: 'Updated words' },
  })
  fireEvent.submit(screen.getByRole('form', { name: 'Edit collection' }))
  expect((await screen.findByRole('alert')).textContent).toContain(
    'Upload unavailable',
  )
  expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
    'Updated words',
  )
  const post = vi
    .mocked(api)
    .mock.calls.find(([, options]) => options?.method === 'POST')!
  expect(post[0]).toBe('/api/v1/slp/collections/collection-1')
  expect((post[1]?.data as FormData).get('_method')).toBe('PATCH')
  expect((post[1]?.data as FormData).has('cover')).toBe(false)
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete collection' }))
  expect(
    vi
      .mocked(api)
      .mock.calls.some(([, options]) => options?.method === 'DELETE'),
  ).toBe(false)
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Delete collection' }).at(-1)!,
  )
  await waitFor(() =>
    expect(api).toHaveBeenCalledWith('/api/v1/slp/collections/collection-1', {
      method: 'DELETE',
    }),
  )
})

it('shows patient collections without authoring controls and opens patient practice', async () => {
  vi.mocked(api).mockResolvedValue({
    data: [{ ...collection, can_manage: false }],
    meta,
  })
  mount(true)
  fireEvent.click(
    await screen.findByRole('button', { name: /Words Practice words/ }),
  )
  expect(screen.getByText('Patient practice in collection-1')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'New collection' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Edit collection' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Delete collection' })).toBeNull()
})

it("keeps another owner's collection read-only for staff", async () => {
  vi.mocked(api).mockResolvedValue({
    data: [{ ...collection, can_manage: false }],
    meta,
  })
  mount()
  fireEvent.click(
    await screen.findByRole('button', { name: /Words Practice words/ }),
  )
  expect(screen.getByText('Exercises in collection-1')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Edit collection' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Delete collection' })).toBeNull()
})

it('lets a clinician explicitly share with every platform patient', async () => {
  vi.mocked(api).mockImplementation(async (_path, options) =>
    options?.method === 'POST' ? { data: collection } : { data: [], meta },
  )
  mount()
  fireEvent.click(screen.getByRole('button', { name: 'New collection' }))
  fireEvent.change(screen.getByLabelText(/Title/), {
    target: { value: 'Words' },
  })
  expect(
    screen.getByRole('option', { name: 'All of my patients' }),
  ).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Patient access'), {
    target: { value: 'platform' },
  })
  fireEvent.submit(screen.getByRole('form', { name: 'New collection' }))
  await screen.findByText('Exercises in collection-1')
  const post = vi
    .mocked(api)
    .mock.calls.find(([, options]) => options?.method === 'POST')!
  expect((post[1]?.data as FormData).get('patient_audience')).toBe('platform')
})
