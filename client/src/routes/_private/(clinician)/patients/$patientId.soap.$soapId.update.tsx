import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import RowError from '@/components/Table/RowError'
import useUpdateSoapForm from '@/modules/soaps/useUpdateSoapForm'

export const Route = createFileRoute(
  '/_private/(clinician)/patients/$patientId/soap/$soapId/update',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { patientId, soapId } = Route.useParams()

  const updateHook = useUpdateSoapForm({ soapId: soapId })

  return (
    <div className="space-y-6">
      <Link
        to="/patients/$patientId"
        params={{ patientId: patientId }}
        className="flex gap-2 items-center link link-hover text-slate-600"
      >
        <ArrowLeft size={16} />
        Patient
      </Link>

      <div className="w-full bg-white">
        <div className="rounded-lg border border-slate-300 shadow-sm flex flex-col gap-4 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Update SOAP
          </h2>

          <form onSubmit={updateHook.onSubmit} className="space-y-4">
            {updateHook.apiError && (
              <div className="alert alert-soft alert-error">
                {updateHook.apiError}
              </div>
            )}

            <div>
              <label>
                <span className="text-xs font-mono text-gray-400">
                  Activity Plan
                </span>
                <input
                  {...updateHook.register('activity_plan')}
                  className="input shadow-sm w-full"
                />
              </label>
              <RowError message={updateHook.errors.activity_plan?.message} />
            </div>

            <div>
              <label>
                <span className="text-xs font-mono text-gray-400">
                  Session Type
                </span>
                <input
                  {...updateHook.register('session_type')}
                  className="input shadow-sm w-full"
                />
              </label>
              <RowError message={updateHook.errors.session_type?.message} />
            </div>

            <div>
              <label>
                <span className="text-xs font-mono text-gray-400">
                  Subjective Notes
                </span>
                <textarea
                  {...updateHook.register('subjective_notes')}
                  className="textarea w-full"
                />
              </label>
              <RowError message={updateHook.errors.subjective_notes?.message} />
            </div>

            <div>
              <label>
                <span className="text-xs font-mono text-gray-400">
                  Objective Notes
                </span>
                <textarea
                  {...updateHook.register('objective_notes')}
                  className="textarea w-full"
                />
              </label>
              <RowError message={updateHook.errors.objective_notes?.message} />
            </div>

            <div>
              <label>
                <span className="text-xs font-mono text-gray-400">
                  Assessment
                </span>
                <textarea
                  {...updateHook.register('assessment')}
                  className="textarea w-full"
                />
              </label>
              <RowError message={updateHook.errors.assessment?.message} />
            </div>

            <div>
              <label>
                <span className="text-xs font-mono text-gray-400">
                  Recommendation
                </span>
                <textarea
                  {...updateHook.register('recommendation')}
                  className="textarea w-full"
                />
              </label>
              <RowError message={updateHook.errors.recommendation?.message} />
            </div>

            <div>
              <label>
                <span className="text-xs font-mono text-gray-400">
                  Comments
                </span>
                <textarea
                  {...updateHook.register('comments')}
                  className="textarea w-full"
                />
              </label>
              <RowError message={updateHook.errors.comments?.message} />
            </div>

            <button disabled={updateHook.isLoading} className="btn btn-neutral">
              Update SOAP
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
