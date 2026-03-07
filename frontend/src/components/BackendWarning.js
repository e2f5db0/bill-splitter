import React, { useEffect } from 'react'
import { useBackendStatus } from '../contexts/BackendStatusContext'

const BackendWarning = () => {
  const { isBackendOnline } = useBackendStatus()

  useEffect(() => {
    console.log('BackendWarning: isBackendOnline =', isBackendOnline)
  }, [isBackendOnline])

  if (isBackendOnline) {
    console.log('BackendWarning: Backend is online, hiding warning')
    return null
  }

  console.log('BackendWarning: Backend is OFFLINE, showing warning banner')
  return (
    <div className='Backend-warning'>
      <div className='Backend-warning-content'>
        <span className='Backend-warning-icon'>⚠️</span>
        <span className='Backend-warning-text'>
          Backend server is unreachable.
        </span>
      </div>
    </div>
  )
}

export default BackendWarning
