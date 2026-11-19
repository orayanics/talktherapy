import { createFileRoute } from '@tanstack/react-router'
import DiagnosisAdmin from '#/modules/diagnoses/components/DiagnosisAdmin'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'

export const Route = createFileRoute('/_private/(adm-shared)/diagnoses')({
  staticData: {
    page: PAGE_META.administration.children.diagnoses,
    bcLink: '.',
  },
  component: () => (
    <PageLayout
      title={PAGE_META.administration.children.diagnoses.title}
      description={PAGE_META.administration.children.diagnoses.description}
      paddedCh
    >
      <DiagnosisAdmin />
    </PageLayout>
  ),
})
