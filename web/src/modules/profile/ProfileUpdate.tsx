import { useNavigate } from '@tanstack/react-router'
import { UserResponse } from '~/models/system'
import useUpdateUser from './useUpdateUser'
import { fieldError } from '~/utils/errors'

export default function ProfileUpdate(props: UserResponse) {
  const { name } = props
  const navigate = useNavigate()
  const { form, errors, handleChange, handleSubmit, isLoading } = useUpdateUser(
    { name: name },
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
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">User Picture</p>
          <div className="h-20 w-20 bg-gray-300 rounded-lg" />
        </div>

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

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Email Address</p>
          {/* <p>{email}</p> */}
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
            className="btn btn-neutral"
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
