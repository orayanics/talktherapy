export type AlertType = 'success' | 'error' | 'info' | 'warning'

export interface AlertContextValue {
  showAlert: (message: string, type: AlertType) => void
  hideAlert: () => void
}

export interface AlertState {
  message: string
  type: AlertType
  visible: boolean
  id: number
}

export interface AlertToastProps {
  message: string
  type: AlertType
  visible: boolean
  onClose: () => void
  duration?: number
}
