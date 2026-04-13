import { Link } from '@tanstack/react-router'

export default function Landing() {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center lg:max-w-7xl max-w-sm w-full gap-6 lg:p-0">
        <div className="max-w-2xl text-4xl lg:text-6xl text-center mx-auto my-12">
          <div
            className="badge bg-primary/20 shadow-primary/40 shadow-sm
          px-6 py-4 text-primary rounded-full"
          >
            talktherapy
          </div>
          <p className="font-serif text-primary">Your voice, matters.</p>
          <p className="font-serif text-primary/60">Every word, yours.</p>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <p className="text-slate-500 text-md lg:text-xl">
            Don't let anything hold you back. With{' '}
            <span className="font-serif text-2xl text-primary">
              TalkTherapy
            </span>
            , you can easily find and book appointments with licensed
            therapists, all from the comfort of your home.
          </p>
        </div>

        <div className="space-x-4">
          <Link to="/register" className="btn btn-primary rounded-full">
            Book an Appointment
          </Link>

          <Link
            to="/login"
            className="btn btn-primary btn-outline rounded-full"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
