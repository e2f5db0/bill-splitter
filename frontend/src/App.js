import React, { useState } from 'react'
import './App.css'
import { Switch, Route, useHistory } from 'react-router-dom'
import Login from './components/Login'
import UserSelection from './components/UserSelection'
import Main from './components/Main'
import AddDues from './components/AddDues'
import Pay from './components/Pay'
import Navbar from './components/Navbar'

const App = () => {

  const [user, setUser] = useState('')
  const [token, setToken] = useState('')

  const history = useHistory()

  const setView = (view) => {
    history.push(`/${view}`)
  }

  const views = {}

  views['login'] = <Login setToken={setToken} setView={setView} />

  views['userSelection'] = <UserSelection setUser={setUser} setView={setView} />

  views['main'] = <Main user={user} setView={setView} />

  views['addDues'] = <AddDues user={user} setView={setView} token={token} />

  views['pay'] = <Pay user={user} setView={setView} token={token} />

  return (
    <div className="App">
      <Navbar setView={setView} />
      <Switch>
        <Route exact path='/'>
          {token ? views['main'] : views['login']}
        </Route>

        <Route exact path='/login'>
          {views['login']}
        </Route>

        <Route exact path='/userSelection'>
          {token ? views['userSelection'] : views['login']}
        </Route>

        <Route exact path='/main'>
          {token ? views['main'] : views['login']}
        </Route>

        <Route exact path='/addDues'>
          {token ? views['addDues'] : views['login']}
        </Route>

        <Route exact path='/pay'>
          {token ? views['pay'] : views['login']}
        </Route>
      </Switch>
    </div>
  )
}

export default App
