import { createFileRoute } from '@tanstack/react-router'
import PatientRecordPage from '#/modules/soaps/components/PatientRecordPage'

export const Route = createFileRoute('/_private/(patient)/records/$soapId')({
  component: PatientRecordPage,
})
