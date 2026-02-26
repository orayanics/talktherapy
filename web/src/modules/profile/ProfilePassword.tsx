import { useNavigate } from "@tanstack/react-router";
import useUpdatePassword from "./useUpdatePassword";

export default function ProfilePassword() {
  const navigate = useNavigate();
  const { form, errors, handleChange, handleSubmit, isLoading } =
    useUpdatePassword();

  return (
    <>
      <p className="font-bold uppercase text-primary">User Information</p>
      {errors?.message && !errors.errors && (
        <div className="alert alert-error shadow-lg">
          <p>
            {" "}
            {errors.message instanceof Object
              ? errors.message.response
              : errors.message}
          </p>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed"
      >
        <div className="flex flex-col lg:flex-row justify-between gap-2">
          <p className="font-bold">Current Password</p>
          <div className="inline-flex flex-col items-start lg:items-end">
            <input
              type="password"
              name="current_password"
              value={form.current_password}
              onChange={handleChange}
              className="input input-bordered w-full max-w-xs"
              disabled={isLoading}
            />
            {errors?.errors?.current_password && (
              <p className="text-error text-sm mt-1">
                {errors.errors.current_password[0]}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between gap-2">
          <p className="font-bold">New Password</p>
          <div className="inline-flex flex-col items-start lg:items-end">
            <input
              type="password"
              name="new_password"
              value={form.new_password}
              onChange={handleChange}
              className="input input-bordered w-full max-w-xs"
              disabled={isLoading}
            />
            {errors?.errors?.new_password && (
              <p className="text-error text-sm mt-1">
                {errors.errors.new_password[0]}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between gap-2">
          <p className="font-bold">Confirm Password</p>
          <div className="inline-flex flex-col items-start lg:items-end">
            <input
              type="password"
              name="new_password_confirmation"
              value={form.new_password_confirmation}
              onChange={handleChange}
              className="input input-bordered w-full max-w-xs"
              disabled={isLoading}
            />
            {errors?.errors?.new_password_confirmation && (
              <p className="text-error text-sm mt-1">
                {errors.errors.new_password_confirmation[0]}
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
            className="btn btn-neutral"
            onClick={() => navigate({ to: "/profile" })}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
