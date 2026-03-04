import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import type { ContentFormState } from '~/models/content'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import PageTitle from '~/components/Page/PageTitle'

import ContentMediaCreate from '~/modules/content/ContentMediaCreate'
import { useCreateContent } from '~/api/content'

export const Route = createFileRoute(
  '/_private/(shared)/content/(admin-content)/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const createContent = useCreateContent()

  const [form, setForm] = useState<ContentFormState>({
    title: '',
    description: '',
    bodyValue: '',
    diagnosisId: '',
    tags: '',
  })

  function handleSubmit() {
    if (
      !form.title ||
      !form.description ||
      !form.bodyValue ||
      !form.diagnosisId
    )
      return
    createContent.mutate({
      title: form.title,
      description: form.description,
      body: form.bodyValue,
      diagnosis_id: form.diagnosisId,
      tag_names: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    })
  }

  return (
    <>
      <PageTitle
        heading={'Add Content'}
        subheading={'Add and manage the content of this media.'}
      />

      <Grid cols={12} gap={6} className="w-auto">
        <GridItem
          colSpan={12}
          className="flex flex-col gap-4 order-1 lg:col-span-6"
        >
          <ContentMediaCreate
            form={form}
            onTitleChange={(v) => setForm((f) => ({ ...f, title: v }))}
            onDescriptionChange={(v) =>
              setForm((f) => ({ ...f, description: v }))
            }
            onBodyChange={(v) => setForm((f) => ({ ...f, bodyValue: v }))}
            onDiagnosisIdChange={(v) =>
              setForm((f) => ({ ...f, diagnosisId: v }))
            }
            onTagsChange={(v) => setForm((f) => ({ ...f, tags: v }))}
          />

          <div className="flex flex-col gap-2 col-span-12">
            <button
              className="btn btn-soft btn-primary"
              disabled={createContent.isPending}
              onClick={handleSubmit}
            >
              {createContent.isPending ? 'Creating...' : 'Submit'}
            </button>
            <button
              className="btn btn-soft btn-error"
              onClick={() => navigate({ to: '/content' })}
            >
              Cancel
            </button>
          </div>
        </GridItem>

        <GridItem
          colSpan={12}
          className="flex flex-col gap-4 order-1 lg:col-span-6"
        >
          <p className="font-bold">Live Preview of Media Body</p>
          <Markdown rehypePlugins={[rehypeRaw]}>{form.bodyValue}</Markdown>
        </GridItem>
      </Grid>
    </>
  )
}
