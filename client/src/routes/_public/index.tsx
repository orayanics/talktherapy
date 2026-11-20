import { createFileRoute } from '@tanstack/react-router'
import Landing from '#/modules/landing/components/Landing'

export const Route = createFileRoute('/_public/')({
  head: () => ({
    meta: [
      { title: 'TalkTherapy | Your voice matters' },
      {
        name: 'description',
        content:
          'Connect with a therapist, make time for speech practice, and keep your care together with TalkTherapy.',
      },
    ],
  }),
  component: App,
})

function App() {
  return <Landing />
}
