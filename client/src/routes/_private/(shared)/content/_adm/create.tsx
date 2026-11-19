import { createFileRoute } from '@tanstack/react-router'
import CreateContentPage from '#/modules/content/components/CreateContentPage'

export const Route = createFileRoute('/_private/(shared)/content/_adm/create')({
  staticData: { crumb: 'Create content', bcLink: '.' },
  component: CreateContentPage,
})
