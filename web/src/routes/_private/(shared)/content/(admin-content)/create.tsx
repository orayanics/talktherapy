import { createFileRoute, useNavigate } from '@tanstack/react-router'

import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import PageTitle from '~/components/Page/PageTitle'

import ContentMediaCreate from '~/modules/content/ContentMediaCreate'
import useAddContent from '~/modules/content/useAddContent'

export const Route = createFileRoute(
  '/_private/(shared)/content/(admin-content)/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const {
    form,
    errors,
    handleChange,
    handleBodyChange,
    handleSubmit,
    isPending,
  } = useAddContent()

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
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            className="flex flex-col gap-4"
          >
            <ContentMediaCreate
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleBodyChange={handleBodyChange}
            />

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isPending}
              >
                {isPending ? 'Creating...' : 'Submit'}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => navigate({ to: '/content' })}
              >
                Cancel
              </button>
            </div>
          </form>
        </GridItem>

        <GridItem
          colSpan={12}
          className="flex flex-col gap-4 order-1 lg:col-span-6"
        >
          <p className="font-bold">Live Preview of Media Body</p>
          <div className="prose prose-sm max-w-none">
            <Markdown rehypePlugins={[rehypeRaw]}>{form.bodyValue}</Markdown>
          </div>
        </GridItem>
      </Grid>
    </>
  )
}
