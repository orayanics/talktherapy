import MDEditor from '@uiw/react-md-editor'
import type { MediaContentClient } from '~/models/content'

interface ContentMedaiInfoEditProps extends MediaContentClient {
  bodyValue: string
  onBodyChange: (value: string) => void
}

export default function ContentMediaInfoEdit(props: ContentMedaiInfoEditProps) {
  const {
    id,
    title,
    description,
    body,
    authorId,
    createdAt,
    updatedAt,
    category,
    tags,
    bodyValue,
    onBodyChange,
  } = props
  return (
    <>
      <p className="font-bold uppercase text-primary">Content Information</p>
      <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Title</p>
          <input className="input" defaultValue={title} />
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Author</p>
          <input className="input" defaultValue={authorId} />
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Description</p>
          <textarea className="textarea">{description}</textarea>
        </div>

        <div className="flex flex-col justify-start gap-2">
          <p className="font-bold">Body</p>
          <MDEditor
            value={bodyValue}
            onChange={(val) => onBodyChange(val || '')}
            height={400}
            preview="edit"
            commandsFilter={(cmd) =>
              !['preview', 'live'].includes(cmd.name as string) && cmd
            }
          />
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
          <input className="input" type="date" value={createdAt} />
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Update At</p>
          <input className="input" type="date" value={updatedAt} />
        </div>
      </div>
    </>
  )
}
