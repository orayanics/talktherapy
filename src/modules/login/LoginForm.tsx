import { Link } from "@tanstack/react-router";

export default function LoginForm() {
  return (
    <form
      onSubmit={() => {
        alert("login");
      }}
    >
      <div className="flex flex-col gap-4">
        <label className="input w-full">
          <span className="label">Email</span>
          <input type="email" placeholder="email@email.com" />
        </label>

        <label className="input w-full">
          <span className="label">Password</span>
          <input type="password" placeholder="********" />
        </label>

        <div className="flex flex-col items-center gap-2 ">
          <button className="btn btn-primary w-full mt-4">Login</button>
          <Link to="/register">
            Don't have an account?{" "}
            <span className="link link-hover">Register here!</span>
          </Link>
        </div>
      </div>
    </form>
  );
}
