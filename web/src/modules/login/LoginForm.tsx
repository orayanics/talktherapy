import { Link } from "@tanstack/react-router";
import useLogin from "./useLogin";

export default function LoginForm() {
  const { form, errors, isLoading, handleChange, handleSubmit } = useLogin();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className="flex flex-col gap-4">
        {/* TODO: Check errors.message instanceof */}
        {errors?.message && !errors.errors && (
          <p className="text-error text-center text-xs mt-1">
            {errors.message instanceof Object
              ? errors.message.response
              : errors.message}
          </p>
        )}
        <div>
          <label className="input w-full">
            <span className="label">Email</span>
            <input
              type="email"
              placeholder="email@email.com"
              value={form.email}
              name="email"
              onChange={handleChange}
            />
          </label>
          {errors?.errors?.email && (
            <p className="text-error text-xs mt-1">{errors.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label className="input w-full">
            <span className="label">Password</span>
            <input
              type="password"
              placeholder="********"
              value={form.password}
              name="password"
              onChange={handleChange}
            />
          </label>
          {errors?.errors?.password && (
            <p className="text-error text-xs mt-1">
              {errors.errors.password[0]}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 ">
          <button
            className="btn btn-primary w-full mt-4"
            type="submit"
            disabled={isLoading}
          >
            Login
          </button>
          <Link to="/register">
            Don't have an account?{" "}
            <span className="link link-hover">Register here!</span>
          </Link>
        </div>
      </div>
    </form>
  );
}
