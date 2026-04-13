import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type {
  ALERT_TYPE,
  AlertContextValue,
  AlertState,
} from '@/types/component'
import { AlertToast } from '@/components/AlertToast'

export const AlertContext = createContext<AlertContextValue | null>(null)

// Module-level store for use outside the React tree (e.g. axios interceptors, queryFns)
let _globalShowAlert: AlertContextValue['showAlert'] | null = null

export const showAlertGlobal = (message: string, type: ALERT_TYPE) => {
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

  const showAlert = useCallback((message: string, type: ALERT_TYPE) => {
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
