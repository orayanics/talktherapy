import { createFileRoute } from '@tanstack/react-router'
import ClinicianSoapPage from '#/modules/soaps/components/ClinicianSoapPage'

export const Route = createFileRoute(
  '/_private/(clinician)/patients/$patientId/soap/$soapId/',
)({
  component: ClinicianSoapPage,
})
