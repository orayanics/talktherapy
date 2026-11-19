import { createFileRoute } from '@tanstack/react-router'
import DiagnosisAdmin from '#/modules/diagnoses/components/DiagnosisAdmin'
import { PAGE_META } from '#/constants/pageMeta'

export const Route = createFileRoute('/_private/(adm-shared)/diagnoses')({
  staticData: {
    page: PAGE_META.administration.children.diagnoses,
    bcLink: '.',
  },
  component: DiagnosisAdmin,
})
