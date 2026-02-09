import React, { useState } from 'react'
import './App.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './components/Login'
import UserSelection from './components/UserSelection'
import Main from './components/Main'
import AddDues from './components/AddDues'
import Pay from './components/Pay'
import Navbar from './components/Navbar'
import Dues from './components/Dues'

const App = () => {

  const [user, setUser] = useState(localStorage.getItem('user'))
  const [token, setToken] = useState(localStorage.getItem('token'))

  const navigate = useNavigate()

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
