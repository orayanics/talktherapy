import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import SoapFields from './SoapFields'
import useCreateSoapForm from '#/modules/soaps/hooks/useCreateSoapForm'

export default function CreateSoapPage() {
  const { patientId } = useParams({
    from: '/_private/(clinician)/patients/$patientId/create',
  })
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
        <div className="rounded-box border border-slate-300 shadow-sm flex flex-col gap-4 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Create SOAP
          </h2>

          <form onSubmit={createHook.onSubmit} className="space-y-4">
            {createHook.apiError && (
              <div className="alert alert-soft alert-error" role="alert">
                {createHook.apiError}
              </div>
            )}

            <SoapFields
              register={createHook.register}
              errors={createHook.errors}
              idPrefix="soap"
            />

            <button disabled={createHook.isLoading} className="btn btn-neutral">
              Create SOAP
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
