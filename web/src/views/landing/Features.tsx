import { Ambulance } from 'lucide-react'

const FEATURES = [
  {
    icon: <Ambulance />,
    title: 'Personalized Exercises',
    description:
      'Tailored exercises based on your specific speech therapy needs.',
  },
  {
    icon: <Ambulance />,
    title: 'Skilled Doctors',
    description:
      'Access to experienced speech therapists for guidance and support.',
  },
  {
    icon: <Ambulance />,
    title: 'Feedback System',
    description: 'Receive real-time feedback on your progress and performance.',
  },
  {
    icon: <Ambulance />,
    title: 'Convenience',
    description: 'Access therapy sessions and resources anytime, anywhere.',
  },
]

export default function Features() {
  return (
    <div className="bg-white min-h-screen py-40 flex flex-col gap-16">
      <h1 className="text-3xl font-bold text-primary text-center">
        Our Features
      </h1>

      <div className="flex flex-row items-center justify-center gap-8 max-w-7xl mx-auto">
        {FEATURES.map((feature, index) => {
          const { icon, title, description } = feature
          return (
            <div
              key={index}
              className="flex flex-col items-center gap-4 text-center max-w-md"
            >
              <div className="text-primary text-4xl">{icon}</div>
              <h1 className="font-mono text-xl">{title}</h1>
              <p className="text-gray-500">{description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
