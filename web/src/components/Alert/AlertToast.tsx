import { useEffect } from 'react'
import { FaCheck, FaExclamation } from 'react-icons/fa'

type AlertType = 'success' | 'error' | 'info' | 'warning'

interface AlertToastProps {
  message: string
  type: AlertType
  visible: boolean
  onClose: () => void
  duration?: number
}

const STYLES: Record<
  AlertType,
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

const ICONS: Record<AlertType, React.ReactNode> = {
  success: <FaCheck />,
  error: <FaExclamation />,
  info: <FaExclamation />,
  warning: <FaExclamation />,
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
      className="toast"
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
