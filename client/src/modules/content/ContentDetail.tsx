import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import rehypeRaw from 'rehype-raw'
import MDEditor from '@uiw/react-md-editor'

import StateError from '@/components/State/StateError'
import StateLoading from '@/components/State/StateLoading'

import { fetchContentById } from '@/api/content'
import { Calendar } from 'lucide-react'
import { formatDate } from '@/utils/useDate'
import ModalConfirm from '@/components/Modal/ModalConfirm'

import useDeleteContent from './useDeleteContent'
import { useAuthGuard } from '@/hooks/useAuth'

export default function ContentDetail({ contentId }: { contentId: string }) {
  const { is } = useAuthGuard()
  const isAdmin = is('admin')

  const { data, isPending, isError } = useQuery(fetchContentById(contentId))

  const { isLoading: isDeleting, handleSubmit: handleDelete } =
    useDeleteContent({ contentId })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  return (
    <div>
      {isPending ? (
        <StateLoading />
      ) : isError ? (
        <StateError />
      ) : (
        <div className="space-y-4">
          {isAdmin && (
            <ModalConfirm
              title="Delete this content?"
              description={
                <>
                  This action is <b>irreversible</b>.
                </>
              }
              onConfirm={handleDelete}
              onCancel={async () => {
                setShowDeleteModal(false)
              }}
              confirmText="Delete"
              cancelText="Cancel"
              states={{ isLoading: isDeleting }}
              isOpen={showDeleteModal}
            />
          )}

          <div className="flex justify-between">
            <div>
              <h1 className="text-2xl font-bold">{data.title}</h1>
              <p className="text-sm text-slate-500">{data.description}</p>
              <p className="inline-flex gap-2 text-xs text-slate-500 mt-2">
                <Calendar size={14} />
                {formatDate(data.createdAt)}
              </p>
              {data.tags.length > 0 && (
                <div className="space-x-1">
                  {data.tags.map((item) => {
                    const tag = (item as any).tag ?? (item as any)
                    return (
                      <p
                        key={tag.id}
                        className="badge badge-neutral badge-soft"
                      >
                        {tag.name}
                      </p>
                    )
                  })}
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="space-x-2">
                <Link
                  to="/content/$contentId/edit"
                  params={{ contentId }}
                  className="btn btn-neutral"
                >
                  Edit
                </Link>

                <button
                  className="btn btn-error"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          <div className="prose max-w-none p-10 bg-white border border-slate-300 border-dashed rounded-lg">
            <div data-color-mode="light">
              <MDEditor.Markdown
                rehypePlugins={[rehypeRaw]}
                source={data.body}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
