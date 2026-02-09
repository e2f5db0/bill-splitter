import React, { useState } from 'react'
import sanat from '../resources/k-sanalista.js'
import spin from '../resources/spin-icon.png'
import logoutIcon from '../resources/logout-icon.png'
import classNames from 'classnames'

const Navbar = (props) => {

  const randomKWord = () => {
    const rand = Math.floor(Math.random() * (sanat.length - 1))
    const randK = sanat[rand]
    return randK
  }

  const rotation = () => {
    setRotate(true)
    setTimeout(() => {
      setRotate(false)
    }, 1000)
  }

  const logout = () => {
    localStorage.clear()
    window.location.reload()
  }

  const [rotate, setRotate] = useState(false)
  const [dailyK, setDailyK] = useState(randomKWord())

  return (
    <div className='Navbar'>
      <h1 className='Heading' onClick={() => props.setView('main')}>KommuuniApp</h1>
      {localStorage.getItem('token') !== null && <img className='logout' src={logoutIcon} alt="logout" onClick={() => logout()} />}
      <div className='Daily-k-container'>
        <h3 className='Daily-k'>– kommuunin {dailyK}</h3>
        <img className={classNames({ 'Spin-icon': !rotate }, { 'Spin-icon Rotate': rotate })} src={spin} onClick={() => { rotation(); setDailyK(randomKWord()) }} alt='spin-icon.png' />
      </div>
    </div>
  )
}

export default Navbar
