export const setLocalStorage = <T>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('setLocalStorage error:', e)
  }
}

export const getLocalStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : null
  } catch (e) {
    console.error('getLocalStorage error:', e)
    return null
  }
}

export const removeLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error('removeLocalStorage error:', e)
  }
}
