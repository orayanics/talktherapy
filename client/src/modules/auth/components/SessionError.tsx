import { useRouter } from '@tanstack/react-router'
import StateError from '#/components/State/StateError'

export default function SessionError() {
  const router = useRouter()
  return (
    <StateError
      message="We couldn't check your session. Please try again."
      onRetry={() => {
        void router.invalidate()
      }}
    />
  )
}
