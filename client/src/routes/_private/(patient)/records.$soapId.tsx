import { fetchSoapById } from '#/modules/soaps/api/soaps'
import { createFileRoute } from '@tanstack/react-router'
import PatientRecordPage from '#/modules/soaps/components/PatientRecordPage'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'

export const Route = createFileRoute('/_private/(patient)/records/$soapId')({
  staticData: { page: PAGE_META.records.children.details, bcLink: '.' },
  loader: ({ context, params }) =>
    context.queryClient.query(fetchSoapById(params.soapId)),
  component: () => (
    <PageLayout
      title={PAGE_META.records.children.details.title}
      description={PAGE_META.records.children.details.description}
      paddedCh
    >
      <PatientRecordPage />
    </PageLayout>
  ),
})
