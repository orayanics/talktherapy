import { createFileRoute } from '@tanstack/react-router'
import CreateSoapPage from '#/modules/soaps/components/CreateSoapPage'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'

export const Route = createFileRoute(
  '/_private/(clinician)/patients/$patientId/create',
)({
  staticData: { page: PAGE_META.patients.children.createRecord, bcLink: '.' },
  component: () => (
    <PageLayout
      title={PAGE_META.patients.children.createRecord.title}
      description={PAGE_META.patients.children.createRecord.description}
      paddedCh
    >
      <CreateSoapPage />
    </PageLayout>
  ),
})
