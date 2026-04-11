import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchDiagnoses } from '@/api/public'
import type { DiagnosisItem } from '@/api/public'

import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'

import { Controller } from 'react-hook-form'
import { ArrowLeft } from 'lucide-react'

import useContentForm from '@/modules/content/useContentForm'
import StateLoading from '@/components/State/StateLoading'
import StateError from '@/components/State/StateError'
import RowError from '@/components/Table/RowError'

export const Route = createFileRoute('/_private/(shared)/content/_adm/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const { register, onSubmit, control, errors, apiError, isLoading } =
    useContentForm()
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
        <div
          className="rounded-lg border border-slate-300
        shadow-sm flex flex-col gap-4 p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-wide">
            New Content
          </h2>

          {apiError && (
            <div className="alert alert-soft alert-error">{apiError}</div>
          )}

          <div>
            <label>
              <span className="text-xs font-mono text-gray-400">Title</span>
              <input
                {...register('title')}
                placeholder="Title"
                className="input shadow-sm w-full"
              />
            </label>
            <RowError message={errors.title?.message} />
          </div>

          <div>
            <label>
              <span className="text-xs font-mono text-gray-400">
                Description
              </span>
              <input
                {...register('description')}
                placeholder="Description"
                className="input shadow-sm w-full"
              />
            </label>
            <RowError message={errors.description?.message} />
          </div>

          <div>
            <span className="text-xs font-mono text-gray-400">
              Content Body
            </span>
            <Controller
              name="body"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div data-color-mode="light">
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
            <RowError message={errors.body?.message} />
          </div>

          <div>
            <label>
              <span className="text-xs font-mono text-gray-400">
                Diagonis Category
              </span>
              <select className="select w-full" {...register('diagnosis_id')}>
                <option value="">Select Diagnosis</option>
                {diagnoses.map((item: DiagnosisItem) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <RowError message={errors.diagnosis_id?.message} />
          </div>

          <div>
            <label>
              <span className="text-xs font-mono text-gray-400">Tags</span>
              <input
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
                className="input w-full shadow-sm"
              />
            </label>
            <RowError message={errors.tag_names?.message} />
          </div>

          <button disabled={isLoading} className="btn btn-neutral">
            Publish
          </button>
        </div>
      </form>
    </div>
  )
}
