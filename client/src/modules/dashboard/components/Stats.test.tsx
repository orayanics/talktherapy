/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { RoleStat } from './RoleStats'
import { StatusStat } from './StatusStats'

it('preserves role labels, counts, custom labels and optional icons', () => {
  const { container, rerender } = render(
    <RoleStat role="SUPERADMIN" count={12} showIcon />,
  )
  expect(screen.getByText('SUDO')).toBeTruthy()
  expect(screen.getByText('12')).toBeTruthy()
  expect(container.querySelector('[aria-hidden="true"]')?.children.length).toBe(
    4,
  )

  rerender(<RoleStat role="patient" count={0} label="People" />)
  expect(screen.getByText('People')).toBeTruthy()
  expect(screen.getByText('0')).toBeTruthy()
  expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
})

it('preserves status labels and safely renders unknown role and status names', () => {
  const { rerender } = render(<StatusStat status="accepted" count={3} />)
  expect(screen.getByText('ACCEPTED')).toBeTruthy()
  rerender(<StatusStat status="other" count={3} />)
  expect(screen.getByText('OTHER')).toBeTruthy()
  rerender(<RoleStat role="constructor" count={3} />)
  expect(screen.getByText('CONSTRUCTOR')).toBeTruthy()
})
