import { createFileRoute } from '@tanstack/react-router'
import DiagnosisAdmin from '#/modules/diagnoses/components/DiagnosisAdmin'

export const Route = createFileRoute('/_private/(adm-shared)/diagnoses')({ component: DiagnosisAdmin })
