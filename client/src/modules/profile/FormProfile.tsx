import FormLabel from '@/components/Form/FormLabel'
import useUpdateProfileForm from './useUpdateProfileForm'
import RowError from '@/components/Table/RowError'

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
          <div className="alert alert-soft alert-error">{apiError}</div>
        )}

        <div className="space-y-2">
          <FormLabel title="Display Name" />
          <input
            {...register('name')}
            placeholder="Name"
            className="input w-full"
          />
          <RowError message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <FormLabel title="Change Password" />
          <p className="text-xs text-slate-500">
            Leave blank to keep current password.
          </p>
          <input
            {...register('currentPassword')}
            type="password"
            placeholder="Current password"
            className="input w-full"
            autoComplete="current-password"
          />
          <RowError message={errors.currentPassword?.message} />
          <input
            {...register('newPassword')}
            type="password"
            placeholder="New password"
            className="input w-full"
            autoComplete="new-password"
          />
          <RowError message={errors.newPassword?.message} />
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="Confirm new password"
            className="input w-full"
            autoComplete="new-password"
          />
          <RowError message={errors.confirmPassword?.message} />
        </div>

        <button disabled={isLoading} className="btn btn-neutral w-full">
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
    </form>
  )
}
