import { keepPreviousData, QueryClient } from '@tanstack/react-query'

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        placeholderData: keepPreviousData,
      },
    },
  })
  return {
    queryClient,
  }
}
export default function TanstackQueryProvider() {}
