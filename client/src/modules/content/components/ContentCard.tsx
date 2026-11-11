import { Link } from '@tanstack/react-router'
import { Bookmark, Calendar } from 'lucide-react'
import useBookmark from '#/modules/content/hooks/useBookmark'
import type { Content } from '#/modules/content/api/content'
import { formatDate } from '#/utils/useDate'

export default function ContentCard({ content }: { content: Content }) {
  const { toggle, isLoading } = useBookmark(content.id)

  return (
    <div className="bg-white p-4 border border-border rounded-box col-span-12 md:col-span-6 lg:col-span-4">
      <div className="flex items-center justify-between mb-2">
        <div className="badge badge-sm badge-neutral uppercase tracking-wide">
          {content.diagnosis?.label ?? 'General'}
        </div>

        <button
          onClick={() => toggle(content.is_bookmarked)}
          aria-label={
            content.is_bookmarked ? 'Remove bookmark' : 'Add bookmark'
          }
          className={`btn btn-sm btn-square ${
            content.is_bookmarked
              ? 'btn-primary'
              : 'btn-ghost hover:[&_svg]:text-primary'
          }`}
          disabled={isLoading}
        >
          <Bookmark
            className={
              content.is_bookmarked ? 'text-white fill-white' : 'text-primary'
            }
          />
        </button>
      </div>
      <Link to="/content/$contentId" params={{ contentId: content.id }}>
        {content.title}
      </Link>

      <p className="truncate block text-muted my-0!">{content.description}</p>

      {content.tags.length > 0 && (
        <>
          <div className="divider h-px" />
          <div className="space-x-1">
            {content.tags.map((tag) => (
              <p key={tag.id} className="badge badge-neutral badge-soft">
                {tag.name}
              </p>
            ))}
          </div>
        </>
      )}

      <p className="inline-flex gap-2 text-xs text-muted mt-2 mb-0">
        <Calendar size={14} />
        {formatDate(content.created_at)}
      </p>
    </div>
  )
}
