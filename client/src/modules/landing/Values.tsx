import { Link } from '@tanstack/react-router'

const CONTENT_ITEMS = [
  {
    title: 'Expert Care',
    description: 'Your journey is guided by specialists who care.',
  },
  {
    title: 'Daily Growth',
    description: 'Interactive exercises that make practice feel like a win.',
  },
  {
    title: 'Always On',
    description: 'Support that’s ready whenever you are.',
  },
]

const TEMP_IMAGE_URL =
  'https://images.unsplash.com/photo-1650611250959-1e823abf6841?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
export default function Values() {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center lg:max-w-7xl max-w-3xl w-full gap-6 lg:p-0 relative">
        <img
          src={TEMP_IMAGE_URL}
          alt="Therapy session"
          className="w-full lg:h-auto h-screen object-cover rounded-lg shadow-lg blur-[1px]"
          loading="lazy"
        />

        <div
          className="absolute translate-y-[-50%] top-1/2
        bg-white/60  backdrop-blur-md
        h-fit rounded-lg p-6
        border border-white/30 shadow-lg shadow-primary/10
        w-full max-w-md md:max-w-2xl lg:max-w-6xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h3 className="font-medium lg:text-6xl text-6xl wrap-anywhere">
                One Conversation at a Time
              </h3>
              <p>
                Access world-class speech coaching and interactive tools
                designed to build your confidence, one conversation at a time.
              </p>
              <Link to="/register" className="btn btn-neutral rounded-full">
                Book an Appointment
              </Link>
            </div>

            <div className="space-y-6">
              {CONTENT_ITEMS.map((item) => (
                <div key={item.title}>
                  <h3 className="text-2xl font-medium">{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
