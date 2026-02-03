import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useLogin } from "~/api/auth/auth";

export default function LoginForm() {
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login.mutate({ email, password });
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <label className="input w-full">
          <span className="label">Email</span>
          <input
            type="email"
            placeholder="email@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="input w-full">
          <span className="label">Password</span>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <div className="flex flex-col items-center gap-2 ">
          <button className="btn btn-primary w-full mt-4" type="submit">
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
