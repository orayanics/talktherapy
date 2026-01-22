import { Link } from "@tanstack/react-router";

export default function LoginForm() {
  return (
    <form
      onSubmit={() => {
        alert("login");
      }}
    >
      <div className="flex flex-col gap-4">
        <input className="input" type="email" placeholder="Email" />
        <input className="input" type="password" placeholder="Password" />

        <div className="flex flex-col gap-2">
          <button className="btn btn-primary mt-4">Login</button>
          <button>
            Don't have an account?{" "}
            <Link to="/register" className="btn-link">
              Register here.
            </Link>
          </button>
        </div>
      </div>
    </form>
  );
}
