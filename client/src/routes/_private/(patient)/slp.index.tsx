import { createFileRoute } from '@tanstack/react-router'
import SlpAssessmentPage from '@/modules/slp/SlpAssessmentPage'

export const Route = createFileRoute('/_private/(patient)/slp/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SlpAssessmentPage />
}
