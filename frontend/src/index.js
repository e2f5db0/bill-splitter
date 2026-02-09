import React, { createContext } from 'react'
import './index.css'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

// Backend URL is set dynamically at runtime
// Priority: runtime config (window.ENV) > build-time env var > development default
const backendUrl =
  (window.ENV && window.ENV.REACT_APP_BACKEND_URL) ||
  process.env.REACT_APP_BACKEND_URL ||
  '/api'

console.log('Backend URL configured as:', backendUrl)

export const AppContext = createContext()

const root = createRoot(document.getElementById('root'))
root.render(
  <BrowserRouter>
    <AppContext.Provider value={backendUrl}>
      <App />
    </AppContext.Provider>
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

