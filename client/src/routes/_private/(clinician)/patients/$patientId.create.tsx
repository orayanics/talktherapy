import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import RowError from '@/components/Table/RowError'
import useCreateSoapForm from '@/modules/soaps/useCreateSoapForm'

export const Route = createFileRoute(
  '/_private/(clinician)/patients/$patientId/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { patientId } = Route.useParams()
  const createHook = useCreateSoapForm({ patientId: patientId })

  return (
    <div className="space-y-6">
      <Link
        to="/patients/$patientId"
        params={{ patientId: String(patientId) }}
        className="flex gap-2 items-center link link-hover text-slate-600"
      >
        <ArrowLeft size={16} />
        Patient
      </Link>

      <div className="w-full bg-white">
        <div className="rounded-lg border border-slate-300 shadow-sm flex flex-col gap-4 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Create SOAP
          </h2>

          <form onSubmit={createHook.onSubmit} className="space-y-4">
            {createHook.apiError && (
              <div className="alert alert-soft alert-error">
                {createHook.apiError}
              </div>
            )}

            <div>
              <label>
                <span className="text-xs font-mono text-gray-400">
                  Activity Plan
                </span>
                <input
                  {...createHook.register('activity_plan')}
                  className="input shadow-sm w-full"
                />
              </label>
              <RowError message={createHook.errors.activity_plan?.message} />
            </div>

            <div>
              <label>
                <span className="text-xs font-mono text-gray-400">
                  Session Type
                </span>
                <input
                  {...createHook.register('session_type')}
                  className="input shadow-sm w-full"
                />
              </label>
              <RowError message={createHook.errors.session_type?.message} />
            </div>

            <div>
              <label>
                <span className="text-xs font-mono text-gray-400">
                  Subjective Notes
                </span>
                <textarea
                  {...createHook.register('subjective_notes')}
                  className="textarea w-full"
                />
              </label>
              <RowError message={createHook.errors.subjective_notes?.message} />
            </div>

            <div>
              <label>
                <span className="text-xs font-mono text-gray-400">
                  Objective Notes
                </span>
                <textarea
                  {...createHook.register('objective_notes')}
                  className="textarea w-full"
                />
              </label>
              <RowError message={createHook.errors.objective_notes?.message} />
            </div>

            <div>
              <label>
                <span className="text-xs font-mono text-gray-400">
                  Assessment
                </span>
                <textarea
                  {...createHook.register('assessment')}
                  className="textarea w-full"
                />
              </label>
              <RowError message={createHook.errors.assessment?.message} />
            </div>

            <div>
              <label>
                <span className="text-xs font-mono text-gray-400">
                  Recommendation
                </span>
                <textarea
                  {...createHook.register('recommendation')}
                  className="textarea w-full"
                />
              </label>
              <RowError message={createHook.errors.recommendation?.message} />
            </div>

            <div>
              <label>
                <span className="text-xs font-mono text-gray-400">
                  Comments
                </span>
                <textarea
                  {...createHook.register('comments')}
                  className="textarea w-full"
                />
              </label>
              <RowError message={createHook.errors.comments?.message} />
            </div>

            <button disabled={createHook.isLoading} className="btn btn-neutral">
              Create SOAP
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
