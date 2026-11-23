import { createFileRoute } from '@tanstack/react-router'
import Landing from '#/modules/landing/components/Landing'

const title = 'TalkTherapy | Speech therapy appointments and practice'
const description =
  'TalkTherapy helps patients and families request speech therapy appointments, find speech practice exercises, and access care resources.'
const origin = import.meta.env.VITE_PUBLIC_ORIGIN
const canonical = origin ? new URL('/', origin).href : undefined
const image = import.meta.env.VITE_PUBLIC_SOCIAL_IMAGE_URL

export const Route = createFileRoute('/')({
  ssr: true,
  head: () => ({
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      ...(canonical ? [{ property: 'og:url', content: canonical }] : []),
      ...(image ? [{ property: 'og:image', content: image }] : []),
    ],
    links: canonical ? [{ rel: 'canonical', href: canonical }] : [],
  }),
  component: Landing,
})
