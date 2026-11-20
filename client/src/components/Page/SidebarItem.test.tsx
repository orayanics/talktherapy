/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { NAV_BY_ROLE } from '#/constants/sidebar'
import SidebarItem from './SidebarItem'

const location = vi.hoisted(() => ({ pathname: '/dashboard' }))
vi.mock('@tanstack/react-router', () => ({
  useRouterState: () => location.pathname,
  Link: ({
    to,
    children,
    'aria-label': label,
  }: {
    to: string
    children: ReactNode
    'aria-label': string
  }) => (
    <a href={to} aria-label={label}>
      {children}
    </a>
  ),
}))

afterEach(() => {
  cleanup()
  location.pathname = '/dashboard'
})

it.each(['admin', 'superadmin', 'clinician', 'patient'] as const)(
  'groups the %s speech links under one disclosure',
  (role) => {
    render(<SidebarItem items={NAV_BY_ROLE[role]} />)
    const trigger = screen.getByRole('button', { name: 'Speech Exercises' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('link', { name: 'Collections' })).toBeNull()
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(
      screen.getByRole('link', { name: 'Collections' }).getAttribute('href'),
    ).toBe(role === 'patient' ? '/slp' : '/slp/exercises')
    if (role === 'patient') {
      expect(
        screen
          .getByRole('link', { name: 'My assignments' })
          .getAttribute('href'),
      ).toBe('/slp/assignments')
      expect(screen.queryByRole('link', { name: 'New exercise' })).toBeNull()
    } else {
      expect(screen.queryByRole('link', { name: 'New exercise' })).toBeNull()
      expect(Boolean(screen.queryByRole('link', { name: 'Assignments' }))).toBe(
        role === 'clinician',
      )
    }
    fireEvent.click(trigger)
    expect(screen.queryByRole('link', { name: 'Collections' })).toBeNull()
  },
)

it('opens the group on a speech route and after navigation into it', () => {
  const { rerender } = render(<SidebarItem items={NAV_BY_ROLE.clinician} />)
  location.pathname = '/slp/exercises'
  rerender(<SidebarItem items={NAV_BY_ROLE.clinician} />)
  expect(
    screen
      .getByRole('button', { name: 'Speech Exercises' })
      .getAttribute('aria-expanded'),
  ).toBe('true')
  expect(screen.getByRole('link', { name: 'Collections' })).toBeTruthy()
})

it('expands the compact sidebar before showing the child links', () => {
  const onExpand = vi.fn()
  render(
    <SidebarItem items={NAV_BY_ROLE.patient} collapsed onExpand={onExpand} />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Speech Exercises' }))
  expect(onExpand).toHaveBeenCalledOnce()
  expect(screen.getByRole('link', { name: 'Collections' })).toBeTruthy()
})
