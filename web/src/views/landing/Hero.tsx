import { Link } from '@tanstack/react-router'

const LANDING_CTA = [
  { to: '/register', label: 'Get Started', className: 'btn btn-primary' },
  {
    to: '/login',
    label: 'Already have an account? Log in',
    className: 'btn btn-ghost',
  },
]

export default function Hero() {
  return (
    <div className="hero min-h-screen pattern-boxes pattern-color-primary pattern-bg-white pattern-size-8">
      <div className="fade-scroll-up hero-content text-center">
        <div className="max-w-min flex flex-col gap-4 [&>p]:text-gray-500 [&>p]:text-lg">
          <h1 className="font-mono text-6xl lg:text-7xl font-bold bg-linear-to-r from-primary via-sky-500 to-blue-400 bg-clip-text text-transparent">
            TalkTherapy
          </h1>
          <p>
            Speech service in your hands. Skilled doctors, personalized
            exercises and feedback system.
          </p>
          <p>All-in-one go with TalkTherapy!</p>

          <div className="flex flex-col gap-2">
            {LANDING_CTA.map((link) => {
              const { to, label, className } = link
              return (
                <Link
                  key={to}
                  to={to}
                  className={`${className || 'btn btn-ghost'}`}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
