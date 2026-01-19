import { Link } from "@tanstack/react-router";

const PUBLIC_LINKS = [
  { to: "/", label: "Home" },
  { to: "/login", label: "Login" },
  { to: "/register", label: "Get Started", className: "btn-primary" },
];

export default function NavbarPublic() {
  return (
    <nav className="h-[64px] w-full bg-white border-b border-gray-200">
      <div className="flex justify-between items-center h-full container mx-auto">
        <Link to="/" className="font-bold text-lg">
          TalkTherapy
        </Link>
        <div className="flex items-center gap-3">
          {PUBLIC_LINKS.map(({ to, label, className }) => (
            <Link
              key={to}
              to={to}
              activeProps={{
                className: "font-semibold",
              }}
              className={className}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
