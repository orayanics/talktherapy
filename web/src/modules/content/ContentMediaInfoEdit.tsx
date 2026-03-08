import { useQuery } from '@tanstack/react-query'
import MDEditor from '@uiw/react-md-editor'
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import useUpdateContent from './useEditContent'
import type { ContentMediaInfoEditProps } from '~/models/components'
import { useGetPublicDiagnoses } from '~/api/public'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'

import Loader from '~/components/Loader/Loader'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'
import { fieldError, hasOnlyMessage } from '~/utils/errors'

export default function ContentMediaInfoEdit({
  data,
  id,
}: ContentMediaInfoEditProps) {
  const {
    data: diagnoses = [],
    isLoading,
    isError,
  } = useQuery(useGetPublicDiagnoses)
  const diagnosesData = diagnoses.data
  const {
    form,
    errors,
    handleChange,
    handleBodyChange,
    handleSave,
    handleCancel,
    isPending,
  } = useUpdateContent({ content: data, id })
  const { title, description, bodyValue, diagnosisId, tags } = form

  return (
    <Grid cols={12} gap={6}>
      <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-6">
        <p className="font-bold uppercase text-primary">Content Information</p>
        {hasOnlyMessage(errors) && (
          <p className="text-error text-center text-sm mt-1">
            {errors!.message}
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
          className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed"
        >
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

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">
              Category <span className="text-error">*</span>
            </p>
            {isLoading ? (
              <Loader />
            ) : isError ? (
              <SkeletonError />
            ) : diagnosesData.length === 0 ? (
              <SkeletonNull />
            ) : (
              <>
                <select
                  className="select"
                  value={diagnosisId}
                  name="diagnosisId"
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>
                  {diagnosesData.map((d: { id: string; label: string }) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
                {fieldError(errors, 'diagnosis_id') && (
                  <p className="text-error text-xs text-right">
                    {fieldError(errors, 'diagnosis_id')}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-bold">Tags</p>
            <input
              className="input"
              value={tags}
              onChange={handleChange}
              name="tags"
              placeholder="e.g. articulation, fluency, language"
            />
            <p className="text-xs text-gray-400">Separate tags with commas</p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending}
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </GridItem>

      <GridItem
        colSpan={12}
        className="flex flex-col gap-4 lg:col-span-6 lg:max-h-screen lg:overflow-y-auto"
      >
        <p className="font-bold">Live Preview of Media Body</p>
        <div className="prose prose-sm max-w-none">
          <Markdown rehypePlugins={[rehypeRaw]}>{bodyValue}</Markdown>
        </div>
      </GridItem>
    </Grid>
  )
}
