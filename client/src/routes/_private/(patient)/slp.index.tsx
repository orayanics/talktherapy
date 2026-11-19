import { createFileRoute } from '@tanstack/react-router'
import SlpAssessmentPage from '#/modules/slp/components/SlpAssessmentPage'
import { PAGE_META } from '#/constants/pageMeta'

export const Route = createFileRoute('/_private/(patient)/slp/')({
  staticData: { page: PAGE_META.speechPractice, bcLink: '.' },
  component: RouteComponent,
})

function RouteComponent() {
  return <SlpAssessmentPage />
}
