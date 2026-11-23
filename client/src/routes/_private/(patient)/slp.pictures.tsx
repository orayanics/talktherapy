import { createFileRoute } from '@tanstack/react-router'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'
import SlpAssessmentPage from '#/modules/slp/components/SlpAssessmentPage'

export const Route = createFileRoute('/_private/(patient)/slp/pictures')({
  staticData: { page: PAGE_META.picturePractice, bcLink: '.' },
  component: () => (
    <PageLayout
      title={PAGE_META.picturePractice.title}
      description={PAGE_META.picturePractice.description}
      paddedCh
    >
      <SlpAssessmentPage />
    </PageLayout>
  ),
})
