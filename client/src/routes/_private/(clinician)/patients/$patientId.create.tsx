import { createFileRoute } from '@tanstack/react-router'
import CreateSoapPage from '#/modules/soaps/components/CreateSoapPage'
import { PAGE_META } from '#/constants/pageMeta'

export const Route = createFileRoute(
  '/_private/(clinician)/patients/$patientId/create',
)({
  staticData: { page: PAGE_META.patients.children.createRecord, bcLink: '.' },
  component: CreateSoapPage,
})
