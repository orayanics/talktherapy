import { Link } from '@tanstack/react-router'
import type { MediaContentClient } from '~/models/content'

export default function ContentMediaInfo(props: MediaContentClient) {
  const {
    id,
    title,
    description,
    authorId,
    createdAt,
    updatedAt,
    category,
    tags,
  } = props

  return (
    <>
      <div>
        <p className="font-bold uppercase text-primary">Content Information</p>
        <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Title</p>
            <p>{title}</p>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Author</p>
            <p>{authorId}</p>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Description</p>
            <p>{description}</p>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Category</p>
            <p>{category}</p>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Tags</p>

            <div className="flex gap-1">
              {tags && (
                <>
                  {tags.map((tag) => {
                    return (
                      <span key={tag} className="badge">
                        {tag}
                      </span>
                    )
                  })}
                </>
              )}
            </div>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Created At</p>
            <p>{createdAt}</p>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Update At</p>
            <p>{updatedAt}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              className="btn btn-soft btn-primary"
              to="/content/$contentId/edit"
              params={{
                contentId: id,
              }}
            >
              Edit Media
            </Link>
            <button className="btn btn-soft btn-error">Delete Media</button>
          </div>
        </div>
      </div>
    </>
  )
}
