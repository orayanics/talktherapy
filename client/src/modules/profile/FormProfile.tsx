import useUpdateProfileForm from './useUpdateProfileForm'

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
      <div className="card-body space-y-6">
        {apiError && (
          <div className="alert alert-soft alert-error">{apiError}</div>
        )}

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Display Name
          </label>
          <input
            {...register('name')}
            placeholder="Name"
            className="input w-full"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="divider my-0" />

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Email Address
          </label>
          {defaultEmail && (
            <p className="text-xs text-slate-500">Current: {defaultEmail}</p>
          )}
          <input
            {...register('email')}
            type="email"
            placeholder="New email address"
            className="input w-full"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="divider my-0" />

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Change Password
          </label>
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
          {errors.currentPassword && (
            <p className="text-sm text-red-500">
              {errors.currentPassword.message}
            </p>
          )}
          <input
            {...register('newPassword')}
            type="password"
            placeholder="New password"
            className="input w-full"
            autoComplete="new-password"
          />
          {errors.newPassword && (
            <p className="text-sm text-red-500">{errors.newPassword.message}</p>
          )}
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="Confirm new password"
            className="input w-full"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button disabled={isLoading} className="btn btn-neutral w-full">
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
    </form>
  )
}
