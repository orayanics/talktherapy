import MDEditor from '@uiw/react-md-editor'
import { useQuery } from '@tanstack/react-query'
import type { ContentMediaCreateProps } from '~/models/components'
import { useGetPublicDiagnoses } from '~/api/public'
import { fieldError, hasOnlyMessage } from '~/utils/errors'

import Loader from '~/components/Loader/Loader'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'

export default function ContentMediaCreate(props: ContentMediaCreateProps) {
  const { form, errors, handleChange, handleBodyChange } = props
  const { title, description, bodyValue, diagnosisId, tags } = form
  const { data = [], isLoading, isError } = useQuery(useGetPublicDiagnoses)
  const diagnoses = data.data

  return (
    <>
      <p className="font-bold uppercase text-primary">Content Information</p>
      {hasOnlyMessage(errors) && (
        <p className="text-error text-center text-sm mt-1">{errors!.message}</p>
      )}
      <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
        <div className="flex flex-col gap-1">
          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">
              Title <span className="text-error">*</span>
            </p>
            <input
              className="input"
              value={title}
              name="title"
              onChange={handleChange}
              placeholder="Enter title"
            />
          </div>
          {fieldError(errors, 'title') && (
            <p className="text-error text-xs text-right">
              {fieldError(errors, 'title')}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">
              Description <span className="text-error">*</span>
            </p>
            <textarea
              className="textarea"
              value={description}
              name="description"
              onChange={handleChange}
              placeholder="Enter description"
            />
          </div>
          {fieldError(errors, 'description') && (
            <p className="text-error text-xs text-right">
              {fieldError(errors, 'description')}
            </p>
          )}
        </div>

        <div className="flex flex-col justify-start gap-2">
          <p className="font-bold">
            Body <span className="text-error">*</span>
          </p>
          <MDEditor
            value={bodyValue}
            onChange={handleBodyChange}
            height={400}
            preview="edit"
            highlightEnable={false}
            commandsFilter={(cmd) =>
              !['preview', 'live'].includes(cmd.name as string) && cmd
            }
          />
          {fieldError(errors, 'body') && (
            <p className="text-error text-xs text-right">
              {fieldError(errors, 'body')}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">
              Category <span className="text-error">*</span>
            </p>
            {isLoading ? (
              <Loader />
            ) : isError ? (
              <SkeletonError />
            ) : diagnoses.length === 0 ? (
              <SkeletonNull />
            ) : (
              <select
                className="select"
                value={diagnosisId}
                name="diagnosisId"
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {diagnoses.map((d: { id: string; label: string }) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          {fieldError(errors, 'diagnosis_id') && (
            <p className="text-error text-xs text-right">
              {fieldError(errors, 'diagnosis_id')}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bold">Tags</p>
          <input
            className="input"
            value={tags}
            name="tags"
            onChange={handleChange}
            placeholder="e.g. articulation, fluency, language"
          />
          <p className="text-xs text-gray-400">Separate tags with commas</p>
        </div>
      </div>
    </>
  )
}
