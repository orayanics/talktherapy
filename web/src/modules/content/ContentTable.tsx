import { Link } from '@tanstack/react-router'
import type { ContentItem } from '~/models/content'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import { useAuthGuard } from '~/hooks/useAuthGuard'

export type { ContentItem }

export default function ContentTable(props: { items: Array<ContentItem> }) {
  const { items } = props
  const { is, can } = useAuthGuard()
  const isAdmin = is('admin')
  const isAllowedAction = can('content:update')

  return (
    <div className="bg-white">
      <Grid cols={12} gap={2}>
        {items.map((item) => {
          const { id, title, description, author, diagnosis, tags } = item
          return (
            <GridItem key={id} colSpan={12} className="lg:col-span-3">
              <div className="grid grid-cols-12 gap-2 rounded-lg bg-base-100 shadow-sm">
                <div className="col-span-12 p-4 flex flex-col gap-2">
                  <div className="flex gap-1 flex-wrap">
                    <span className="badge badge-sm badge-soft">
                      {diagnosis.label}
                    </span>
                    {tags.map(({ tag }) => (
                      <span
                        key={tag.name}
                        className="badge badge-sm badge-soft"
                      >
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
                  <p className="text-gray-600 text-sm truncate">
                    {description}
                  </p>
                  <p className="text-xs text-gray-400">
                    {author.name ?? author.email}
                  </p>
                  {isAdmin && isAllowedAction && (
                    <div className="flex gap-2 mt-1">
                      <Link
                        className="btn btn-primary btn-xs"
                        to="/content/$contentId/edit"
                        params={{ contentId: item.id }}
                      >
                        Edit
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </GridItem>
          )
        })}
      </Grid>
    </div>
  )
}
