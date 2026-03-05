import { Link } from '@tanstack/react-router'

import { FaBookmark } from 'react-icons/fa'
import useBookmark from './useBookmark'

import type { ContentItem } from '~/models/content'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'

import { useAuthGuard } from '~/hooks/useAuthGuard'

export type { ContentItem }

function ContentCard({
  item,
  isAdmin,
  isAllowedAction,
  initialIsBookmarked,
}: {
  item: ContentItem
  isAdmin: boolean
  isAllowedAction: boolean
  initialIsBookmarked: boolean
}) {
  const { id, title, description, author, diagnosis, tags } = item
  const { isBookmarked, isLoading, toggle } = useBookmark({
    contentId: id,
    initialIsBookmarked,
  })

  return (
    <div className="grid grid-cols-12 gap-2 rounded-lg bg-base-100 shadow-sm">
      <div className="col-span-12 p-4 flex flex-col gap-2">
        <div className="flex gap-1 flex-wrap">
          <span className="badge badge-sm badge-soft">{diagnosis.label}</span>
          {tags.map(({ tag }) => (
            <span key={tag.name} className="badge badge-sm badge-soft">
              {tag.name}
            </span>
          ))}
        </div>
        <Link
          className="card-title truncate text-base"
          to="/content/$contentId"
          params={{ contentId: id }}
        >
          {title}
        </Link>
        <p className="text-gray-600 text-sm truncate">{description}</p>
        <p className="text-xs text-gray-400">{author.name ?? author.email}</p>
        <button
          className={`btn btn-sm ${
            isBookmarked
              ? 'btn-secondary'
              : 'btn-outline btn-secondary hover:[&_svg]:text-white'
          }`}
          onClick={toggle}
          disabled={isLoading}
        >
          <FaBookmark
            className={isBookmarked ? 'text-white' : 'text-secondary'}
          />
        </button>
        {isAdmin && isAllowedAction && (
          <div className="flex gap-2 mt-1">
            <Link
              className="btn btn-primary btn-xs"
              to="/content/$contentId/edit"
              params={{ contentId: id }}
            >
              Edit
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ContentTable(props: {
  items: Array<ContentItem>
  bookmarkedIds?: Set<string>
}) {
  const { items, bookmarkedIds = new Set() } = props
  const { is, can } = useAuthGuard()
  const isAdmin = is('admin')
  const isAllowedAction = can('content:update')

  return (
    <div className="bg-white">
      <Grid cols={12} gap={2}>
        {items.map((item) => (
          <GridItem key={item.id} colSpan={12} className="lg:col-span-3">
            <ContentCard
              item={item}
              isAdmin={isAdmin}
              isAllowedAction={isAllowedAction}
              initialIsBookmarked={bookmarkedIds.has(item.id)}
            />
          </GridItem>
        ))}
      </Grid>
    </div>
  )
}
