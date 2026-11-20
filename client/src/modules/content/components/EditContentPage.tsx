import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchDiagnoses } from '#/modules/diagnoses/api/diagnoses'
import type { DiagnosisItem } from '#/modules/diagnoses/types/diagnosis'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'
import { Controller } from 'react-hook-form'
import { ArrowLeft } from 'lucide-react'
import useUpdateContentForm from '#/modules/content/hooks/useUpdateContentForm'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'
import FormInput from '#/components/Form/FormInput'

export default function EditContentPage() {
  const { contentId } = useParams({
    from: '/_private/(shared)/content/_adm/$contentId/edit',
  })

  const { register, onSubmit, errors, apiError, isLoading, control } =
    useUpdateContentForm({ contentId })

  const { data: diagnoses, isPending, isError } = useQuery(fetchDiagnoses)

  if (isPending) return <StateLoading />
  if (isError) return <StateError />

  return (
    <div className="space-y-6">
      <Link
        to="/content"
        className="flex gap-2 items-center link link-hover text-slate-600"
      >
        <ArrowLeft size={16} />
        Content
      </Link>

      <form onSubmit={onSubmit} className="w-full bg-white">
        <div className="rounded-box border border-border flex flex-col gap-4 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide my-0!">
            Edit Content
          </h2>

          {apiError && (
            <div className="alert alert-soft alert-error" role="alert">
              {apiError}
            </div>
          )}

          <FormInput
            htmlFor="content-edit-title"
            label="Title"
            error={errors.title?.message}
            required
          >
            <input
              id="content-edit-title"
              {...register('title')}
              placeholder="Title"
              className="input  w-full"
            />
          </FormInput>

          <FormInput
            htmlFor="content-edit-description"
            label="Description"
            error={errors.description?.message}
            required
          >
            <input
              id="content-edit-description"
              {...register('description')}
              placeholder="Description"
              className="input  w-full"
            />
          </FormInput>

          <FormInput
            htmlFor="content-edit-body"
            label="Content Body"
            error={errors.body?.message}
            required
          >
            <Controller
              name="body"
              control={control}
              render={({ field }) => (
                <div data-color-mode="light">
                  <MDEditor
                    textareaProps={{ id: 'content-edit-body' }}
                    value={field.value}
                    onChange={field.onChange}
                    height={400}
                    highlightEnable={false}
                    previewOptions={{
                      rehypePlugins: [[rehypeSanitize]],
                    }}
                  />
                </div>
              )}
            />
          </FormInput>

          <FormInput
            htmlFor="content-edit-diagnosis"
            label="Diagnosis Category"
            error={errors.diagnosis_id?.message}
            required
          >
            <select
              id="content-edit-diagnosis"
              className="select w-full"
              {...register('diagnosis_id')}
            >
              <option value="" disabled>
                Select Diagnosis
              </option>
              {diagnoses.map((item: DiagnosisItem) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </FormInput>

          <FormInput
            htmlFor="content-edit-tags"
            label="Tags"
            error={errors.tag_names?.message}
          >
            <input
              id="content-edit-tags"
              {...register('tag_names', {
                setValueAs: (value) => {
                  if (Array.isArray(value)) return value
                  if (typeof value !== 'string') return []

                  return value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                },
              })}
              placeholder="Tags (comma separated)"
              className="input w-full "
            />
          </FormInput>

          <button disabled={isLoading} className="btn btn-neutral">
            Publish
          </button>
        </div>
      </form>
    </div>
  )
}
