import { fetchContentById } from '#/modules/content/api/content'
import { createFileRoute } from '@tanstack/react-router'
import ContentDetail from '#/modules/content/components/ContentDetail'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'

export const Route = createFileRoute('/_private/(shared)/content/$contentId')({
  staticData: { page: PAGE_META.content.children.details, bcLink: '.' },
  loader: ({ context, params }) =>
    context.queryClient.query(fetchContentById(params.contentId)),
  component: RouteComponent,
})

function RouteComponent() {
  const contentId = Route.useParams().contentId

  return (
    <PageLayout
      title={PAGE_META.content.children.details.title}
      description={PAGE_META.content.children.details.description}
      paddedCh
    >
      <ContentDetail contentId={contentId} />
    </PageLayout>
  )
}
