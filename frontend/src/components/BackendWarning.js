import React from 'react'
import { useBackendStatus } from '../contexts/BackendStatusContext'

const BackendWarning = () => {
  const { isBackendOnline } = useBackendStatus()

  if (isBackendOnline) {
    return null
  }

  return (
    <div className='Backend-warning'>
      <div className='Backend-warning-content'>
        <span className='Backend-warning-icon'>⚠️</span>
        <span className='Backend-warning-text'>
          Backend server is offline.
        </span>
      </div>
    </div>
  )
}

export default BackendWarning
