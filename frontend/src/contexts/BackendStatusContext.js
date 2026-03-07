import React, { createContext, useState, useContext, useEffect } from 'react'
import { registerBackendStatusCallbacks } from '../setupAxiosInterceptor'

const BackendStatusContext = createContext()

export const useBackendStatus = () => {
  const context = useContext(BackendStatusContext)
  if (!context) {
    throw new Error('useBackendStatus must be used within BackendStatusProvider')
  }
  return context
}

export const BackendStatusProvider = ({ children }) => {
  const [isBackendOnline, setIsBackendOnline] = useState(true)
  const [lastError, setLastError] = useState(null)

  const markBackendOffline = (error) => {
    console.log('BackendStatusContext: markBackendOffline called', error)
    setIsBackendOnline(false)
    setLastError(error)
  }

  const markBackendOnline = () => {
    console.log('BackendStatusContext: markBackendOnline called')
    setIsBackendOnline(true)
    setLastError(null)
  }

  // Register callbacks with the axios interceptor on mount
  useEffect(() => {
    console.log('BackendStatusContext: Registering callbacks with axios interceptor')
    registerBackendStatusCallbacks(markBackendOffline, markBackendOnline)
  }, [])

  return (
    <BackendStatusContext.Provider
      value={{
        isBackendOnline,
        lastError,
        markBackendOffline,
        markBackendOnline
      }}
    >
      {children}
    </BackendStatusContext.Provider>
  )
}
