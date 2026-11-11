/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import Pagination from './Pagination'
import { ChoiceFilter } from './Filters'

afterEach(cleanup)

it('uses server pagination metadata and prevents navigation past the final page', () => {
  const updateSearch = vi.fn()
  render(
    <Pagination
      page={1}
      meta={{ current_page: 3, last_page: 3, total: 30, to: 30 }}
      updateSearch={updateSearch}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
  expect(updateSearch).toHaveBeenCalledWith({ page: 2 })
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' })
      .disabled,
  ).toBe(true)
})

it('retains other selected filters when toggling one option', () => {
  const onChange = vi.fn()
  render(
    <ChoiceFilter
      label="Status"
      options={[
        { value: 'active', label: 'Active' },
        { value: 'pending', label: 'Pending' },
      ]}
      value={['active']}
      onChange={onChange}
    />,
  )
  fireEvent.click(screen.getByRole('checkbox', { name: 'Pending' }))
  expect(onChange).toHaveBeenCalledWith(['active', 'pending'])
})
