import { Link } from "@tanstack/react-router";

const PUBLIC_LINKS = [
  { to: "/login", label: "Login" },
  { to: "/register", label: "Get Started", className: "btn btn-primary" },
];

export default function NavbarPublic() {
  return (
    <nav className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <Link to={"/"} className="btn btn-ghost text-xl">
          talktherapy
        </Link>
      </div>

      <div className="navbar-end gap-1">
        {PUBLIC_LINKS.map((link) => {
          const { to, label, className } = link;
          return (
            <Link
              key={to}
              to={to}
              className={`${className || "btn btn-ghost"}`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
