import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import SoapFields from './SoapFields'
import useUpdateSoapForm from '#/modules/soaps/hooks/useUpdateSoapForm'

export default function UpdateSoapPage() {
  const { patientId, soapId } = useParams({
    from: '/_private/(clinician)/patients/$patientId/soap/$soapId/update',
  })

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
        <div className="rounded-box border border-slate-300 shadow-sm flex flex-col gap-4 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Update SOAP
          </h2>

          <form onSubmit={updateHook.onSubmit} className="space-y-4">
            {updateHook.apiError && (
              <div className="alert alert-soft alert-error" role="alert">
                {updateHook.apiError}
                {updateHook.isConflict && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={updateHook.reloadLatest}
                  >
                    Load latest note (discard unsaved edits)
                  </button>
                )}
              </div>
            )}

            <SoapFields
              register={updateHook.register}
              errors={updateHook.errors}
              idPrefix="soap-update"
            />

            <button disabled={updateHook.isLoading} className="btn btn-neutral">
              Update SOAP
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
