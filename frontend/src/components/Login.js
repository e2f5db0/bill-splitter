import React, { useEffect } from 'react'

const Login = (props) => {

  const members = ['Kettu', 'Susi', 'Sammakko', 'Karibu', 'Lepakko']

  useEffect(() => {
    props.setMemberCount(members.length)
  }, [])

  return (
    <div className='Container'>
      {members.map(name => 
        <div key={name} className='Login-name-container' onClick={() => props.setUser(name)}>
          <p>{name}</p>
        </div>
      )}
    </div>
  )
}

export default Login
