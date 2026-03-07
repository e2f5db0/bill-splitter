import axios from 'axios'

let backendStatusCallbacks = {
  markBackendOffline: null,
  markBackendOnline: null
}

// Setup axios interceptor - this runs immediately when imported
console.log('Setting up axios interceptor (early initialization)...')

axios.interceptors.response.use(
  (response) => {
    // On successful response, mark backend as online
    console.log('Axios: Successful response, marking backend online')
    if (backendStatusCallbacks.markBackendOnline) {
      backendStatusCallbacks.markBackendOnline()
    }
    return response
  },
  (error) => {
    console.log('Axios: Error caught by interceptor', error)
    console.log('Error code:', error.code)
    console.log('Error message:', error.message)
    console.log('Error response:', error.response)
    console.log('Error response status:', error.response?.status)
    
    // Check if error is network-related (backend unreachable)
    const hasNoResponse = !error.response
    const isNetworkErrorCode = error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED'
    const isNetworkErrorMessage = error.message === 'Network Error'
    const isServerError = error.response && error.response.status >= 500
    const isAborted = error.code === 'ERR_CANCELED' || error.message === 'Request aborted'
    
    console.log('hasNoResponse:', hasNoResponse)
    console.log('isNetworkErrorCode:', isNetworkErrorCode)
    console.log('isNetworkErrorMessage:', isNetworkErrorMessage)
    console.log('isServerError:', isServerError)
    console.log('isAborted:', isAborted)
    
    const isNetworkError = hasNoResponse || isNetworkErrorCode || isNetworkErrorMessage || isServerError || isAborted

    console.log('Final isNetworkError:', isNetworkError)
    
    if (isNetworkError) {
      console.log('Network error detected! Calling markBackendOffline...')
      if (backendStatusCallbacks.markBackendOffline) {
        backendStatusCallbacks.markBackendOffline(error)
        console.log('markBackendOffline called')
      } else {
        console.log('WARNING: markBackendOffline callback not registered yet')
      }
    } else {
      console.log('Non-network error, backend still considered online')
    }

    return Promise.reject(error)
  }
)

// Export function to register callbacks from BackendStatusContext
export const registerBackendStatusCallbacks = (markOffline, markOnline) => {
  console.log('Registering backend status callbacks')
  backendStatusCallbacks.markBackendOffline = markOffline
  backendStatusCallbacks.markBackendOnline = markOnline
}
