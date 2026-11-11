/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { afterEach, expect, it, vi } from 'vitest'
import SoapFields from './SoapFields'
import { CreateSoapSchema } from '../types/schema'
import type { TCreateSoapSchema } from '../types/schema'

afterEach(cleanup)

function Form({
  idPrefix,
  onSubmit,
}: {
  idPrefix: string
  onSubmit: (data: TCreateSoapSchema) => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TCreateSoapSchema>({ resolver: zodResolver(CreateSoapSchema) })
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SoapFields register={register} errors={errors} idPrefix={idPrefix} />
      <button>Save</button>
    </form>
  )
}

it.each(['soap', 'soap-update'])(
  'registers every SOAP field and preserves %s IDs',
  async (idPrefix) => {
    const onSubmit = vi.fn()
    render(<Form idPrefix={idPrefix} onSubmit={onSubmit} />)
    const values = {
      activity_plan: ['Activity Plan', 'Practice words'],
      session_type: ['Session Type', 'Individual'],
      subjective_notes: ['Subjective Notes', 'Patient report'],
      objective_notes: ['Objective Notes', 'Observations'],
      assessment: ['Assessment', 'Progress'],
      recommendation: ['Recommendation', 'Continue'],
      comments: ['Comments', 'Follow up'],
    }
    for (const [field, [label, value]] of Object.entries(values)) {
      const input = screen.getByLabelText(label)
      expect(input.id).toBe(`${idPrefix}-${field.replaceAll('_', '-')}`)
      expect(input.tagName).toBe(
        field === 'activity_plan' || field === 'session_type'
          ? 'INPUT'
          : 'TEXTAREA',
      )
      fireEvent.change(input, { target: { value } })
    }
    fireEvent.click(screen.getByText('Save'))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0]).toEqual(
      Object.fromEntries(
        Object.entries(values).map(([field, [, value]]) => [field, value]),
      ),
    )
  },
)

it('shows schema validation errors without submitting invalid notes', async () => {
  const onSubmit = vi.fn()
  render(<Form idPrefix="soap" onSubmit={onSubmit} />)
  fireEvent.click(screen.getByText('Save'))
  expect(await screen.findByText('Activity plan is required')).toBeTruthy()
  expect(onSubmit).not.toHaveBeenCalled()
})
