// 16
// 32
// 192
// 512

// from assets
import xs from '~/assets/16x16.png'
import sm from '~/assets/32x32.png'
import md from '~/assets/192x192.png'
import lg from '~/assets/512x512.png'

export default function LogoIcon({ size = 'md' }) {
  const sizes: Record<string, string> = {
    xs,
    sm,
    md,
    lg,
  }
  const currentSize = sizes[size] || md

  return <img src={currentSize} alt="TalkTherapy Logo" />
}
