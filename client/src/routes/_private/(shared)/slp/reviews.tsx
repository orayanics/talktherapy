import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '#/modules/auth/lib/auth-guard'
import PageLayout from '#/components/Page/PageLayout'
import { PAGE_META } from '#/constants/pageMeta'
import SlpReviewInbox from '#/modules/slp/components/SlpReviewInbox'

export const Route = createFileRoute('/_private/(shared)/slp/reviews')({
  staticData: { page: PAGE_META.slp.children.reviews, bcLink: '.' },
  beforeLoad: ({ context }) => {
    requireRole(context.user, 'clinician')
  },
  component: () => (
    <PageLayout
      title={PAGE_META.slp.children.reviews.title}
      description={PAGE_META.slp.children.reviews.description}
      paddedCh
    >
      <SlpReviewInbox />
    </PageLayout>
  ),
})
