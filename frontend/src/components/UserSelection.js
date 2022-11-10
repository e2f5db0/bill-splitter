import React, { useEffect, useState } from 'react'
import axios from 'axios'

const UserSelection = (props) => {

  const baseurl = process.env.REACT_APP_BACKEND_URL

  const [users, setUsers] = useState([])

  useEffect(() => {
    async function fetchUsers() {
      const res = await axios.get(`${baseurl}/users`)
      setUsers(res.data)
    }
    fetchUsers()
  }, [baseurl])

  const selectUser = (user) => {
    props.setUser(user)
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
