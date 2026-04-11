import useUpdateProfileForm from './useUpdateProfileForm'

export default function FormProfile({
  id,
  defaultName,
}: {
  id: string
  defaultName?: string
}) {
  const { register, onSubmit, errors, apiError, isLoading } =
    useUpdateProfileForm(id, {
      name: defaultName,
    })

  return (
    <form onSubmit={onSubmit}>
      <div className="card-body">
        {apiError && (
          <div className="alert alert-soft alert-error">{apiError}</div>
        )}

        <input
          {...register('name')}
          placeholder="Name"
          className="input w-full"
        />
        {errors.name && <p>{errors.name.message}</p>}

        <button disabled={isLoading} className="btn btn-neutral">
          Update Profile
        </button>
      </div>
    </form>
  )
}
