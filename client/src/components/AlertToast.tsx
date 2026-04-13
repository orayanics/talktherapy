import { useEffect } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import type { ALERT_TYPE, AlertToastProps } from '@/types/component'

const STYLES: Record<
  ALERT_TYPE,
  { container: string; icon: string; closeBtn: string }
> = {
  success: {
    container: 'alert-success border-success',
    icon: 'text-success',
    closeBtn: 'btn-success',
  },
  error: {
    container: 'alert-error border-error',
    icon: 'text-error',
    closeBtn: 'btn-error',
  },
  info: {
    container: 'alert-info border border-info',
    icon: 'text-info',
    closeBtn: 'btn-info',
  },
  warning: {
    container: 'alert-warning border-warning',
    icon: 'text-warning',
    closeBtn: 'btn-warning',
  },
}

const ICONS: Record<ALERT_TYPE, React.ReactNode> = {
  success: <CircleCheck />,
  error: <CircleAlert />,
  info: <CircleAlert />,
  warning: <CircleAlert />,
}

export const AlertToast = ({
  message,
  type,
  visible,
  onClose,
  duration = 4000,
}: AlertToastProps) => {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [visible, duration, onClose])

  if (!message) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="toast z-999"
      style={{
        transition: 'all 0.3s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(1rem)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div className={`alert alert-soft ${STYLES[type].container}`}>
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${STYLES[type].icon}`}
          style={{ borderColor: 'currentColor' }}
        >
          {ICONS[type]}
        </span>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className={`btn btn-soft ${STYLES[type].closeBtn} btn-sm btn-circle text-xl`}
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
