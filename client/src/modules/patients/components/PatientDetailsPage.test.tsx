/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import PatientDetailsPage from './PatientDetailsPage'

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }))
vi.mock('@tanstack/react-router', () => ({
  useSearch: () => ({}),
  useParams: () => ({ patientId: 'patient-1' }),
  useNavigate: () => navigate,
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}))
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: {
      data: [
        {
          id: 'soap-1',
          createdAt: '2026-11-01',
          clinician: { name: 'Clinician' },
        },
      ],
    },
  }),
  queryOptions: (options: unknown) => options,
}))
vi.mock('#/modules/soaps/components/SoapDetails', () => ({
  default: ({ soapId }: { soapId: string }) => <div>{soapId}</div>,
}))
vi.mock('#/modules/soaps/components/UpdateSoapPage', () => ({
  default: ({ soapId }: { soapId: string }) => <div>{soapId}</div>,
}))
vi.mock('#/modules/soaps/components/CreateSoapPage', () => ({
  default: ({ patientId }: { patientId: string }) => <div>{patientId}</div>,
}))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it.each(['View', 'Edit'])(
  'opens and closes the %s drawer without navigation',
  (action) => {
    render(<PatientDetailsPage />)
    expect(screen.queryByRole('complementary')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: action }))
    expect(
      screen.getByRole('complementary', { name: `${action} SOAP` }).textContent,
    ).toContain('soap-1')
    expect(navigate).not.toHaveBeenCalled()
    fireEvent.click(
      screen.getByRole('button', { name: `Close ${action} SOAP` }),
    )
    expect(screen.queryByRole('complementary')).toBeNull()
  },
)

it('opens the create form for the current patient without navigation', () => {
  render(<PatientDetailsPage />)
  fireEvent.click(screen.getByRole('button', { name: 'Create SOAP' }))
  expect(
    screen.getByRole('complementary', { name: 'Create SOAP' }).textContent,
  ).toContain('patient-1')
  expect(navigate).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Close Create SOAP' }))
  expect(screen.queryByRole('complementary')).toBeNull()
})
