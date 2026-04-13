export interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

export type ALERT_TYPE = 'success' | 'error' | 'info' | 'warning'

export interface AlertContextValue {
  showAlert: (message: string, type: ALERT_TYPE) => void
  hideAlert: () => void
}

export interface AlertState {
  message: string
  type: ALERT_TYPE
  visible: boolean
  id: number
}

export interface AlertToastProps {
  message: string
  type: ALERT_TYPE
  visible: boolean
  onClose: () => void
  duration?: number
}
