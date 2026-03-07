import React, { useState, useEffect } from 'react'
import './App.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './components/Login'
import UserSelection from './components/UserSelection'
import Main from './components/Main'
import AddDues from './components/AddDues'
import Pay from './components/Pay'
import Navbar from './components/Navbar'
import Dues from './components/Dues'
import BackendWarning from './components/BackendWarning'
import { useBackendStatus } from './contexts/BackendStatusContext'
import axios from 'axios'

const App = () => {
  const { markBackendOffline, markBackendOnline } = useBackendStatus()

  const [user, setUser] = useState(localStorage.getItem('user'))
  const [token, setToken] = useState(localStorage.getItem('token'))

  const navigate = useNavigate()

  // Setup axios interceptor to detect backend connectivity issues
  useEffect(() => {
    console.log('Setting up axios interceptor...')
    
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        // On successful response, mark backend as online
        console.log('Axios: Successful response, marking backend online')
        markBackendOnline()
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
        
        console.log('hasNoResponse:', hasNoResponse)
        console.log('isNetworkErrorCode:', isNetworkErrorCode)
        console.log('isNetworkErrorMessage:', isNetworkErrorMessage)
        console.log('isServerError:', isServerError)
        
        const isNetworkError = hasNoResponse || isNetworkErrorCode || isNetworkErrorMessage || isServerError

        console.log('Final isNetworkError:', isNetworkError)
        
        if (isNetworkError) {
          console.log('Network error detected! Calling markBackendOffline...')
          markBackendOffline(error)
          console.log('markBackendOffline called')
        } else {
          console.log('Non-network error, backend still considered online')
        }

        return Promise.reject(error)
      }
    )

    // Cleanup: Remove interceptor when component unmounts
    return () => {
      console.log('Removing axios interceptor')
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [markBackendOffline, markBackendOnline])

  const setView = (view) => {
    navigate(`/${view}`)
  }

  const views = {}

  views['login'] = <Login setToken={setToken} setView={setView} />

  views['userSelection'] = <UserSelection setUser={setUser} setView={setView} token={token} />

  views['main'] = <Main user={user} setView={setView} token={token} />

  views['addDues'] = <AddDues user={user} setView={setView} token={token} />

  views['pay'] = <Pay user={user} setView={setView} token={token} />

  views['dues'] = <Dues user={user} setView={setView} token={token} />

  return (
    <div className="App">
      <BackendWarning />
      <Navbar setView={setView} />
      <Routes>
        <Route path='/' element={token ? views['main'] : views['login']} />
        <Route path='/login' element={views['login']} />
        <Route path='/userSelection' element={token ? views['userSelection'] : views['login']} />
        <Route path='/main' element={token ? views['main'] : views['login']} />
        <Route path='/addDues' element={token ? views['addDues'] : views['login']} />
        <Route path='/pay' element={token ? views['pay'] : views['login']} />
        <Route path='/dues' element={token ? views['dues'] : views['login']} />
      </Routes>
    </div>
  )
}

export default App
