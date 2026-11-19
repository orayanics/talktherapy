import SoapFields from './SoapFields'
import useUpdateSoapForm from '#/modules/soaps/hooks/useUpdateSoapForm'

export default function UpdateSoapPage({
  soapId,
  onClose,
}: {
  soapId: string
  onClose: () => void
}) {
  const updateHook = useUpdateSoapForm({ soapId, onSuccess: onClose })

  return (
    <div className="w-full bg-white">
      <div className="flex flex-col gap-4 p-6">
        <span className="text-sm font-bold uppercase tracking-wide">
          Update SOAP
        </span>

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
  )
}
