import { createFileRoute } from '@tanstack/react-router'
import CreateContentPage from '#/modules/content/components/CreateContentPage'
import { PAGE_META } from '#/constants/pageMeta'

export const Route = createFileRoute('/_private/(shared)/content/_adm/create')({
  staticData: { page: PAGE_META.content.children.create, bcLink: '.' },
  component: CreateContentPage,
})
