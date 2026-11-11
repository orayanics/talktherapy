import useUpdateProfileForm from '#/modules/profile/hooks/useUpdateProfileForm'
import FormInput from '#/components/Form/FormInput'

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
          <div className="alert alert-soft alert-error" role="alert">
            {apiError}
          </div>
        )}

        <FormInput
          htmlFor="profile-name"
          label="Display Name"
          error={errors.name?.message}
          errorId="profile-name-error"
        >
          <input
            id="profile-name"
            {...register('name')}
            placeholder="Name"
            className="input w-full"
          />
        </FormInput>

        <FormInput
          htmlFor="profile-current-password"
          label="Current password"
          error={errors.currentPassword?.message}
          errorId="profile-current-password-error"
        >
          <p className="text-xs text-slate-500">
            Leave blank to keep current password.
          </p>
          <input
            id="profile-current-password"
            {...register('currentPassword')}
            type="password"
            placeholder="Current password"
            className="input w-full"
            autoComplete="current-password"
          />
        </FormInput>
        <FormInput
          htmlFor="profile-new-password"
          label="New password"
          error={errors.newPassword?.message}
          errorId="profile-new-password-error"
        >
          <input
            id="profile-new-password"
            {...register('newPassword')}
            type="password"
            placeholder="New password"
            className="input w-full"
            autoComplete="new-password"
          />
        </FormInput>
        <FormInput
          htmlFor="profile-confirm-password"
          label="Confirm new password"
          error={errors.confirmPassword?.message}
          errorId="profile-confirm-password-error"
        >
          <input
            id="profile-confirm-password"
            {...register('confirmPassword')}
            type="password"
            placeholder="Confirm new password"
            className="input w-full"
            autoComplete="new-password"
          />
        </FormInput>

        <button disabled={isLoading} className="btn btn-neutral w-full">
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
    </form>
  )
}
