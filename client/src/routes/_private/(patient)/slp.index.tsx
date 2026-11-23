import { createFileRoute, Link } from '@tanstack/react-router'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'
import ExerciseCollections from '#/modules/slp/components/ExerciseCollections'

export const Route = createFileRoute('/_private/(patient)/slp/')({
  staticData: { page: PAGE_META.speechPractice, bcLink: '.' },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageLayout
      title={PAGE_META.speechPractice.title}
      description={PAGE_META.speechPractice.description}
      paddedCh
    >
      <div className="space-y-6">
        <Link to="/slp/pictures" className="btn">
          Picture practice
        </Link>
        <ExerciseCollections patientView />
      </div>
    </PageLayout>
  )
}
