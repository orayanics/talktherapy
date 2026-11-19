import { fetchSoapById } from '#/modules/soaps/api/soaps'
import { createFileRoute } from '@tanstack/react-router'
import PatientRecordPage from '#/modules/soaps/components/PatientRecordPage'
import { PAGE_META } from '#/constants/pageMeta'

export const Route = createFileRoute('/_private/(patient)/records/$soapId')({
  staticData: { page: PAGE_META.records.children.details, bcLink: '.' },
  loader: ({ context, params }) =>
    context.queryClient.query(fetchSoapById(params.soapId)),
  component: PatientRecordPage,
})
