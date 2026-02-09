import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { AppContext } from '..'

const UserSelection = (props) => {

  const baseurl = useContext(AppContext)

  const [users, setUsers] = useState([])

  useEffect(() => {
    async function fetchUsers() {
      const config = {
        headers: { Authorization: `Bearer ${props.token}` }
      }
      const res = await axios.get(`${baseurl}/users`, config)
      setUsers(res.data)
    }
    fetchUsers()
  }, [baseurl, props.token])

  const selectUser = (user) => {
    props.setUser(user)
    localStorage.setItem('user', user)
    props.setView('main')
  }

  return (
    <div className='Container'>
      <div className='Login-container'>
        {users.map(user =>
          <div key={user._id} className='Login-name-container' onClick={() => selectUser(user.name)}>
            <p>{user.name}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserSelection
