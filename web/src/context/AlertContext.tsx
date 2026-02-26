import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { AlertToast } from '~/components/Alert/AlertToast'

type AlertType = 'success' | 'error' | 'info'

interface AlertContextValue {
  showAlert: (message: string, type: AlertType) => void
  hideAlert: () => void
}

interface AlertState {
  message: string
  type: AlertType
  visible: boolean
  id: number // increment to retrigger animation on repeat calls
}

export const AlertContext = createContext<AlertContextValue | null>(null)

// Module-level store for use outside the React tree (e.g. axios interceptors, queryFns)
let _globalShowAlert: AlertContextValue['showAlert'] | null = null

export const showAlertGlobal = (message: string, type: AlertType) => {
  _globalShowAlert?.(message, type)
}

export const useAlert = () => {
  const context = useContext(AlertContext)
  if (!context) throw new Error('useAlert must be used within an AlertProvider')
  return context
}

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alert, setAlert] = useState<AlertState>({
    message: '',
    type: 'info',
    visible: false,
    id: 0,
  })

  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, visible: false }))
  }, [])

  const showAlert = useCallback((message: string, type: AlertType) => {
    setAlert((prev) => ({
      message,
      type,
      visible: true,
      id: prev.id + 1,
    }))
  }, [])

  useEffect(() => {
    _globalShowAlert = showAlert
    return () => {
      _globalShowAlert = null
    }
  }, [showAlert])

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AlertToast
        key={alert.id}
        message={alert.message}
        type={alert.type}
        visible={alert.visible}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  )
}
