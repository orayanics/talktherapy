import MDEditor from '@uiw/react-md-editor'
import { useQuery } from '@tanstack/react-query'
import type { ContentMediaCreateProps } from '~/models/components'
import { useGetPublicDiagnoses } from '~/api/public'

export default function ContentMediaCreate(props: ContentMediaCreateProps) {
  const {
    form,
    onTitleChange,
    onDescriptionChange,
    onBodyChange,
    onDiagnosisIdChange,
    onTagsChange,
  } = props

  const { data: diagnoses = [] } = useQuery(useGetPublicDiagnoses)

  return (
    <>
      <p className="font-bold uppercase text-primary">Content Information</p>
      <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">
            Title <span className="text-error">*</span>
          </p>
          <input
            className="input"
            value={form.title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter title"
            required
          />
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">
            Description <span className="text-error">*</span>
          </p>
          <textarea
            className="textarea"
            value={form.description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Enter description"
            required
          />
        </div>

        <div className="flex flex-col justify-start gap-2">
          <p className="font-bold">
            Body <span className="text-error">*</span>
          </p>
          <MDEditor
            value={form.bodyValue}
            onChange={(val) => onBodyChange(val || '')}
            height={400}
            preview="edit"
            commandsFilter={(cmd) =>
              !['preview', 'live'].includes(cmd.name as string) && cmd
            }
          />
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">
            Category <span className="text-error">*</span>
          </p>
          <select
            className="select"
            value={form.diagnosisId}
            onChange={(e) => onDiagnosisIdChange(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {diagnoses.map((d: { id: string; label: string }) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bold">Tags</p>
          <input
            className="input"
            value={form.tags}
            onChange={(e) => onTagsChange(e.target.value)}
            placeholder="e.g. articulation, fluency, language"
          />
          <p className="text-xs text-gray-400">Separate tags with commas</p>
        </div>
      </div>
    </>
  )
}
