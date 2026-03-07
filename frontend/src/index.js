import React, { createContext } from 'react'
import './index.css'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import { BackendStatusProvider } from './contexts/BackendStatusContext'

// Backend URL is set dynamically at runtime
// Priority: runtime config (window.ENV) > build-time env var > development default
const backendUrl =
  (window.ENV && window.ENV.REACT_APP_BACKEND_URL) ||
  process.env.REACT_APP_BACKEND_URL ||
  '/api'

console.log('Backend URL configured as:', backendUrl)

export const AppContext = createContext()

// Setup axios interceptor to detect backend connectivity issues
let backendStatusContext = null

export const setBackendStatusContext = (context) => {
  backendStatusContext = context
}

axios.interceptors.response.use(
  (response) => {
    // On successful response, mark backend as online
    if (backendStatusContext) {
      backendStatusContext.markBackendOnline()
    }
    return response
  },
  (error) => {
    // Check if error is network-related (backend unreachable)
    const isNetworkError =
      !error.response || // No response from server
      error.code === 'ERR_NETWORK' || // Network error
      error.code === 'ECONNREFUSED' || // Connection refused
      error.message === 'Network Error' || // Generic network error
      (error.response && error.response.status >= 500) // Server error

    if (isNetworkError && backendStatusContext) {
      backendStatusContext.markBackendOffline(error)
    }

    return Promise.reject(error)
  }
)

const root = createRoot(document.getElementById('root'))
root.render(
  <BrowserRouter>
    <BackendStatusProvider>
      <AppContext.Provider value={backendUrl}>
        <App />
      </AppContext.Provider>
    </BackendStatusProvider>
  </BrowserRouter>
)

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope)
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error)
      })
  })
}

