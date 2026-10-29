import FormLabel from '#/components/Form/FormLabel'
import useUpdateProfileForm from '#/modules/profile/hooks/useUpdateProfileForm'
import RowError from '#/components/Table/RowError'

export default function FormProfile({
  defaultName,
  defaultEmail,
}: {
  defaultName?: string
  defaultEmail?: string
}) {
  const { register, onSubmit, errors, apiError, isLoading } =
    useUpdateProfileForm({ name: defaultName, email: defaultEmail })

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-6">
        {apiError && (
          <div className="alert alert-soft alert-error" role="alert">{apiError}</div>
        )}

        <div className="space-y-2">
          <FormLabel title="Display Name" htmlFor="profile-name" />
          <input
            id="profile-name"
            {...register('name')}
            placeholder="Name"
            className="input w-full"
          />
          <RowError id="profile-name-error" message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <FormLabel title="Current password" htmlFor="profile-current-password" />
          <p className="text-xs text-slate-500">
            Leave blank to keep current password.
          </p>
          <input
            id="profile-current-password" {...register('currentPassword')}
            type="password"
            placeholder="Current password"
            className="input w-full"
            autoComplete="current-password"
          />
          <RowError id="profile-current-password-error" message={errors.currentPassword?.message} />
          <input
            id="profile-new-password" {...register('newPassword')}
            type="password"
            placeholder="New password"
            className="input w-full"
            autoComplete="new-password"
          />
          <RowError id="profile-new-password-error" message={errors.newPassword?.message} />
          <input
            id="profile-confirm-password" {...register('confirmPassword')}
            type="password"
            placeholder="Confirm new password"
            className="input w-full"
            autoComplete="new-password"
          />
          <RowError id="profile-confirm-password-error" message={errors.confirmPassword?.message} />
        </div>

        <button disabled={isLoading} className="btn btn-neutral w-full">
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
    </form>
  )
}
