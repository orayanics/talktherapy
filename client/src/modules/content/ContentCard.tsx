import { Link } from '@tanstack/react-router'
import { Bookmark, Calendar } from 'lucide-react'
import useBookmark from './useBookmark'
import type { Content } from '@/api/content'
import { formatDate } from '@/utils/useDate'

export default function ContentCard({ content }: { content: Content }) {
  const { toggle, isLoading } = useBookmark(content.id)

  return (
    <div className="bg-white p-6 border border-slate-300 rounded-lg shadow-sm col-span-12 md:col-span-6 lg:col-span-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase truncate">
          {content.diagnosis.label}
        </p>

        <button
          onClick={() => toggle(content.is_bookmarked)}
          aria-label="bookmark"
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
      <Link
        to="/content/$contentId"
        params={{ contentId: content.id }}
        className="text-slate-900 font-serif "
      >
        {content.title}
      </Link>

      <p className="truncate block text-slate-500 text-sm">
        {content.description}
      </p>

      {content.tags.length > 0 && (
        <>
          <div className="divider h-px" />
          <div className="space-x-1">
            {content.tags.slice(0, 2).map((item) => {
              const tag = (item as any).tag ?? (item as any)
              return (
                <p key={tag.id} className="badge badge-neutral badge-soft">
                  {tag.name}
                </p>
              )
            })}

            {content.tags.length > 2 && (
              <p className="badge badge-neutral badge-soft">
                +{content.tags.length - 2}
              </p>
            )}
          </div>
        </>
      )}

      <p className="inline-flex gap-2 text-xs text-slate-500 mt-2">
        <Calendar size={14} />
        {formatDate(content.created_at)}
      </p>
    </div>
  )
}
