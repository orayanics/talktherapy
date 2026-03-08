import { useNavigate } from '@tanstack/react-router'
import useUpdateUser from './useUpdateUser'
import type { SESSION_USER } from '~/models/system'
import { fieldError } from '~/utils/errors'

export default function ProfileUpdate(props: SESSION_USER) {
  const { name } = props
  const navigate = useNavigate()
  const { form, errors, handleChange, handleSubmit, isLoading } = useUpdateUser(
    { user_name: name },
  )

  return (
    <>
      <p className="font-bold uppercase text-primary">User Information</p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed"
      >
        <div className="flex flex-col lg:flex-row justify-between gap-2">
          <p className="font-bold">Full Name</p>
          <div>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input input-bordered w-full max-w-xs"
              disabled={isLoading}
            />
            {fieldError(errors, 'name') && (
              <p className="text-error text-sm mt-1">
                {fieldError(errors, 'name')}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 col-span-12">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isLoading}
          >
            Submit Changes
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => navigate({ to: '/profile' })}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}
