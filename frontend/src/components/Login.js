import React, { useContext, useState } from 'react'
import axios from 'axios'
import { AppContext } from '..'

const Login = (props) => {

  const baseurl = useContext(AppContext)

  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const login = async () => {
    try {
      const res = await axios.post(`${baseurl}/login`, { password: password })
      if (res.data.token) {
        props.setToken(res.data.token)
        localStorage.setItem('token', res.data.token)
        setErrorMessage('')
        props.setView('userSelection')
      } else {
        setErrorMessage('Invalid credentials.')
      }
    } catch (error) {
      setErrorMessage('Invalid credentials.')
    }
  }

  return (
    <div className='Container'>
      <div className='Login-container'>
        <input className='Login-password-field' type='password' value={password} onChange={(event) => setPassword(event.target.value)} />
        <input type='button' className='btn' onClick={async () => await login()} value='Login' />
        {errorMessage && <p>{errorMessage}</p>}
      </div>
    </div>
  )
}

export default Login
