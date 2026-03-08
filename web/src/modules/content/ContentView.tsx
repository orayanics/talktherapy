import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import type { AdminContentProps, ContentViewProps } from '~/models/components'
import { contentDetailQueryOptions } from '~/api/content'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import PageTitle from '~/components/Page/PageTitle'

import SkeletonNull from '~/components/Skeleton/SkeletonNull'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import LoaderTable from '~/components/Loader/LoaderTable'

import { useAuthGuard } from '~/hooks/useAuthGuard'
import ModalConfirm from '~/components/Modal/ModalConfirm'
import useDeleteContent from '~/modules/content/useDeleteContent'

export default function ContentView({ contentId }: ContentViewProps) {
  const { data, isLoading, isError } = useQuery(
    contentDetailQueryOptions(contentId),
  )

  if (isLoading) return <LoaderTable />
  if (isError) return <SkeletonError />
  if (!data) return <SkeletonNull />

  const { author, title, description, diagnosis, tags, updated_at } = data
  const { name } = author
  const { label } = diagnosis

  const { is } = useAuthGuard()
  const isAdmin = is('admin')

  const pageTitleProps = {
    brow: !isAdmin ? name : null,
    heading: !isAdmin ? title : 'Content Detail',
    subheading: !isAdmin
      ? description
      : 'View detailed information about the content',
  }

  return (
    <>
      <PageTitle {...pageTitleProps} />

      <Grid cols={12} gap={6}>
        {isAdmin && (
          <AdminContent
            {...data}
            contentId={contentId}
            name={name}
            label={label}
          />
        )}

        <GridItem
          colSpan={12}
          className={isAdmin ? 'lg:col-span-6' : 'lg:col-span-12'}
        >
          <div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-1 flex-wrap">
                <span className="badge badge-ghost badge-sm">{label}</span>
                {tags.map((t: { tag: { name: string } }) => (
                  <span key={t.tag.name} className="badge badge-sm">
                    {t.tag.name}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mb-2">
                Updated {updated_at.slice(0, 10)}
              </p>
            </div>
          </div>

          <Grid cols={12} gap={6}>
            <GridItem colSpan={12}>
              <div className="prose prose-sm max-w-none overflow-auto flex flex-col gap-4 bg-gray-50 border-dashed border-gray-200 border p-4 rounded-lg max-h-200">
                <Markdown rehypePlugins={[rehypeRaw]}>{data.body}</Markdown>
              </div>
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>
    </>
  )
}

const AdminContent = (props: AdminContentProps) => {
  const { title, name, description, label, tags, updated_at, contentId } = props
  const { handleSubmit, isLoading, errors } = useDeleteContent({ contentId })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { canAny } = useAuthGuard()
  const isAllowedAction = canAny(['content:update', 'content:delete'])

  return (
    <>
      <GridItem colSpan={12} className="lg:col-span-6">
        <p className="font-bold uppercase text-primary">Content Information</p>
        <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
          <ContentRow label="Title" value={title} />
          <ContentRow label="Author" value={name} />
          <ContentRow label="Description" value={description} />
          <ContentRow label="Category" value={label} />
          <ContentRow
            label="Tags"
            value={tags
              .map((t: { tag: { name: string } }) => t.tag.name)
              .join(', ')}
          />
          <ContentRow label="Last Updated" value={updated_at.slice(0, 10)} />
        </div>

        {isAllowedAction && (
          <div className="flex flex-col gap-2">
            <Link
              to="/content/$contentId/edit"
              params={{ contentId }}
              className="btn btn-soft btn-primary"
            >
              Edit
            </Link>
            <button
              className="btn btn-soft btn-error"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </button>
          </div>
        )}
      </GridItem>

      {showDeleteModal && isAllowedAction && (
        <ModalConfirm
          title="Delete Content"
          description="Are you sure you want to delete this content? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={async () => {
            const success = await handleSubmit()
            if (success) setShowDeleteModal(false)
          }}
          onCancel={() => setShowDeleteModal(false)}
          states={{ isLoading, errors }}
        />
      )}
    </>
  )
}

const ContentRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex flex-row justify-between gap-2">
      <p className="font-bold">{label}</p>
      <p>{value}</p>
    </div>
  )
}
