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
        <button className="btn btn-primary mt-4">Login</button>
        <button disabled className="btn btn-primary mt-4">
          Login
        </button>
      </div>
    </form>
  );
}
