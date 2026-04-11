import { createFileRoute } from '@tanstack/react-router'
import Landing from '@/modules/landing/Landing'
import Values from '@/modules/landing/Values'

export const Route = createFileRoute('/_public/')({ component: App })

function App() {
  return (
    <>
      <Landing />
      <Values />
    </>
  )
}
