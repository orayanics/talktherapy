import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchDiagnoses } from '#/modules/diagnoses/api/diagnoses'
import type { DiagnosisItem } from '#/modules/diagnoses/types/diagnosis'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'
import { Controller } from 'react-hook-form'
import { ArrowLeft } from 'lucide-react'
import useContentForm from '#/modules/content/hooks/useContentForm'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'
import FormInput from '#/components/Form/FormInput'

export default function CreateContentPage() {
  const { register, onSubmit, control, errors, apiError, isLoading } =
    useContentForm()
  const { data: diagnoses, isPending, isError } = useQuery(fetchDiagnoses)

  if (isPending) return <StateLoading />
  if (isError) return <StateError />

  return (
    <div className="space-y-6">
      <Link
        to="/content"
        className="flex gap-2 items-center link link-hover text-muted"
      >
        <ArrowLeft size={16} />
        Content
      </Link>

      <form onSubmit={onSubmit} className="w-full bg-white">
        <div className="rounded-box border border-border flex flex-col gap-4 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide my-0!">
            New Content
          </h2>

          {apiError && (
            <div className="alert alert-soft alert-error" role="alert">
              {apiError}
            </div>
          )}

          <FormInput label="Title" error={errors.title?.message} required>
            <input
              id="content-title"
              {...register('title')}
              placeholder="Title"
              className="input w-full"
            />
          </FormInput>

          <FormInput
            label="Description"
            error={errors.description?.message}
            required
          >
            <input
              id="content-description"
              {...register('description')}
              placeholder="Description"
              className="input w-full"
            />
          </FormInput>

          <FormInput label="Content Body" error={errors.body?.message} required>
            <Controller
              name="body"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div id="content-body" data-color-mode="light">
                  <MDEditor
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
            label="Diagnosis Category"
            error={errors.diagnosis_id?.message}
            required
          >
            <select
              id="content-diagnosis"
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

          <FormInput label="Tags" error={errors.tag_names?.message}>
            <input
              id="content-tags"
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
