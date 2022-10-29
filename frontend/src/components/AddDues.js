import React, { useEffect, useState } from 'react'
import axios from 'axios'
import classNames from 'classnames'

const querystring = require('querystring')

const AddDues = () => {

  // TBA use values from database
  const hardcodedUsers = [
    {
      id: 0,
      name: 'Kaikki'
    },
    {
      id: 1,
      name: 'Lepakko'
    },
    {
      id: 2,
      name: 'Susi'
    },
    {
      id: 3,
      name: 'Karibu'
    },
    {
      id: 4,
      name: 'Sammakko'
    },
    {
      id: 5,
      name: 'Kettu'
    },
  ]

  const [users, setUsers] = useState(hardcodedUsers)
  const [selected, setSelected] = useState([])
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [fetchedOnce, setFetchedOnce] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [amountError, setAmountError] = useState(false)
  const [requestError, setRequestError] = useState(false)

  const url = process.env.REACT_APP_DATABASE_URL

  const fetchUsers = () => axios.get(`${url}/users`).then((res) => setUsers(res.data)).catch(error => console.log(error))

  // useEffect(() => {
  //   if (!fetchedOnce) {
  //     fetchUsers()
  //   }
  //   setInterval(() => {
  //     setFetchedOnce(true)
  //     fetchTopics()
  //   }, 2000)
  // }, [])

  const addDue = async () => {
    if (amount === '') {
      setAmountError(true)
      return
    } else {
      setAmountError(false)
    }
    if (selected.length === 0) {
      setRequestError(true)
      return
    } else {
      setRequestError(false)
    }
    //await axios.post(`${url}/addDue`, querystring.stringify({ selected: selected, amount: Number(amount), message: message }))
    setRequestSent(true)
  }

  const clearInputs = () => {
    setSelected([])
    setAmount('')
    setMessage('')
    setRequestSent(false)
  }

  const handleSelection = (username) => {
    if (username !== 'Kaikki' && selected.includes('Kaikki')) return
    if (selected.includes(username)) {
      setSelected(prevSelected => {
        prevSelected.filter(s => s !== username)
      })
    } else {
      setSelected([
        username,
        ...selected
      ])
    }
  }

  return (
    <div className='Container'>
      <div className='AddDue-container'>
        <h2>Pyydä</h2>
        {users.length && <div className='AddDue-user-selection'>
          {users.length > 0 && users.map(user => <p key={user.name} className={classNames({ 'AddDue-user-item': !selected.includes(user.name) }, { 'AddDue-user-item Selected': selected.includes(user.name) })} onClick={() => handleSelection(user.name)}>{user.name}</p>)}
        </div>}
        {!users.length &&
          <div className='Loading-animation-container'>
            <div className='Half-circle-large'></div><div className='Half-circle-small'></div>
          </div>
        }
        <div className='AddDue-inputs'>
          <input type='text' className={classNames({ 'Input-field-amount': !amountError }, { 'Input-field-amount Error': amountError })} placeholder='Summa' value={amount} onChange={(event) => setAmount(event.target.value)} />
          <input type='text' className='Input-field-message' placeholder='Viesti' value={message} onChange={(event) => setMessage(event.target.value)} />
        </div>
        {!requestSent && <button className={classNames({ 'btn Add-btn': !requestError }, { 'btn Add-btn Error': requestError })} onClick={async () => await addDue()}>Pyydä</button>}
        {requestSent && <svg onClick={() => clearInputs()} class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
          <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>}
      </div>
    </div>
  )
}

export default AddDues
