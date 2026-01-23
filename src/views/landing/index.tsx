import { Link } from "@tanstack/react-router";

const LANDING_CTA = [
  { to: "/register", label: "Get Started", className: "btn btn-primary" },
  {
    to: "/login",
    label: "Already have an account? Log in",
    className: "btn btn-ghost",
  },
];

export default function index() {
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md flex flex-col gap-4">
          <h1 className="text-5xl font-bold">TalkTherapy</h1>
          <p>
            Speech service in your hands. Skilled doctors, personalized
            exercises and feedback system. All-in-one go with TalkTherapy.
          </p>
          <p>All-in-one go with TalkTherapy!</p>

          <div className="flex flex-col gap-2">
            {LANDING_CTA.map((link) => {
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
        </div>
      </div>
    </div>
  );
}
