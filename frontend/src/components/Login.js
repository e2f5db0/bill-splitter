import React, { useEffect, useState } from 'react'
import axios from 'axios'

const Login = (props) => {

  const baseurl = process.env.REACT_APP_BACKEND_URL

  const [users, setUsers] = useState([])

  useEffect(() => {
    async function fetchUsers() {
      const res = await axios.get(`${baseurl}/users`)
      setUsers(res.data)
    }
    fetchUsers()
  }, [])

  return (
    <div className='Container'>
      <div className='Login-container'>
        {users.map(user =>
          <div key={user._id} className='Login-name-container' onClick={() => props.setUser(user.name)}>
            <p>{user.name}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
