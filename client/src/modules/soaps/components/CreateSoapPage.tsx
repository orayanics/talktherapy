import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import SoapFields from './SoapFields'
import useCreateSoapForm from '#/modules/soaps/hooks/useCreateSoapForm'

export default function CreateSoapPage({
  patientId: drawerPatientId,
  onClose,
}: {
  patientId?: string
  onClose?: () => void
}) {
  const params = useParams({ strict: false })
  const patientId = drawerPatientId ?? params.patientId!
  const createHook = useCreateSoapForm({ patientId, onSuccess: onClose })

  return (
    <div className="space-y-6">
      {!onClose && (
        <Link
          to="/patients/$patientId"
          params={{ patientId: String(patientId) }}
          className="flex gap-2 items-center link link-hover text-slate-600"
        >
          <ArrowLeft size={16} />
          Patient
        </Link>
      )}

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
  )
}
