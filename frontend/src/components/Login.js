import React, { useState } from 'react'
import axios from 'axios'

const Login = (props) => {

    const baseurl = process.env.REACT_APP_BACKEND_URL

    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const login = async () => {
        try {
            const res = await axios.post(`${baseurl}/login`, { password: password })
            if (res.data.token) {
                props.setToken(res.data.token)
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
                <button className='btn' onClick={async () => await login()}>Login</button>
                {errorMessage && <p>{errorMessage}</p>}
            </div>
        </div>
    )
}

export default Login
