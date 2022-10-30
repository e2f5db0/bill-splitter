import React, { useState } from 'react'
import './App.css'
import { Switch, Route, useHistory } from 'react-router-dom'
import Login from './components/Login'
import Main from './components/Main'
import AddDues from './components/AddDues'
import Pay from './components/Pay'
import Navbar from './components/Navbar'

const App = () => {

  const [user, setUser] = useState('')

  const history = useHistory()

  const setView = (view) => {
    history.push(`/${view}`)
  }

  const views = {}

  views['login'] = <Login setUser={setUser} />

  views['main'] = <Main user={user} setView={setView} />

  views['addDues'] = <AddDues user={user} setView={setView} />

  views['pay'] = <Pay user={user} setView={setView} />

  return (
    <div className="App">
      <Navbar setView={setView} />
      <Switch>
        <Route exact path='/'>
          {user ? views['main'] : views['login']}
        </Route>

        <Route exact path='/main'>
          {user ? views['main'] : views['login']}
        </Route>

        <Route exact path='/addDues'>
          {user ? views['addDues'] : views['login']}
        </Route>

        <Route exact path='/pay'>
          {user ? views['pay'] : views['login']}
        </Route>
      </Switch>
    </div>
  )
}

export default App
