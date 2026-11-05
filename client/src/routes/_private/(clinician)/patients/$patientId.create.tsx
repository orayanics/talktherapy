import { createFileRoute } from '@tanstack/react-router'
import CreateSoapPage from '#/modules/soaps/components/CreateSoapPage'

export const Route = createFileRoute(
  '/_private/(clinician)/patients/$patientId/create',
)({
  component: CreateSoapPage,
})
