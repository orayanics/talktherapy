import { createFileRoute } from '@tanstack/react-router'
import SlpAssessmentPage from '#/modules/slp/components/SlpAssessmentPage'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'
import { useState } from 'react'
import ExerciseCollections from '#/modules/slp/components/ExerciseCollections'
import SlpAssignments from '#/modules/slp/components/SlpAssignments'

export const Route = createFileRoute('/_private/(patient)/slp/')({
  staticData: { page: PAGE_META.speechPractice, bcLink: '.' },
  component: RouteComponent,
})

function RouteComponent() {
  const [pictures, setPictures] = useState(false)
  return (
    <PageLayout
      title={PAGE_META.speechPractice.title}
      description={PAGE_META.speechPractice.description}
      paddedCh
    >
      <div className="space-y-6">
        <button className="btn" onClick={() => setPictures(!pictures)}>
          {pictures ? 'Back to collections' : 'Picture practice'}
        </button>
        {pictures ? (
          <SlpAssessmentPage />
        ) : (
          <>
            <ExerciseCollections patientView />
            <SlpAssignments />
          </>
        )}
      </div>
    </PageLayout>
  )
}
