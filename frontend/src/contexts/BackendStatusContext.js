import React, { createContext, useState, useContext } from 'react'

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
