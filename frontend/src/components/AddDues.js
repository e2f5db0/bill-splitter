import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import classNames from 'classnames'
import { AppContext } from '..'

const AddDues = (props) => {

  const baseurl = useContext(AppContext)

  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState([])
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [requestSent, setRequestSent] = useState(false)
  const [amountError, setAmountError] = useState(false)
  const [messageError, setMessageError] = useState(false)
  const [payersError, setPayersError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [buttonDisabled, setButtonDisabled] = useState(false)

  useEffect(() => {
    async function fetchUsers() {
      const config = {
        headers: { Authorization: `Bearer ${props.token}` }
      }
      const res = await axios.get(`${baseurl}/users`, config)
      setUsers(res.data)
    }
    fetchUsers()
    // preselect current user
    //setSelected([
    //  props.user,
    //  ...selected
    //])
  }, [baseurl, props.token])

  const addDue = async () => {
    if (selected.length === 0) {
      setPayersError(true)
      return
    } else {
      setPayersError(false)
    }
    if (amount === '') {
      setAmountError(true)
      return
    } else {
      setAmountError(false)
    }
    if (message === '' || !message.match(/^[a-zäö0-9 ,()-.&#!?%+]+$/i)) {
      setMessageError(true)
      return
    } else {
      setMessageError(false)
    }
    const formattedAmount = formatAmount()
    if (!formattedAmount) {
      setErrorMessage('Summan pitää olla luku.')
      return
    }
    // avoid problems from multiple button presses
    setButtonDisabled(true)
    try {
      const res = await axios.post(`${baseurl}/debts/addDue`, {
        requester: props.user,
        payers: selected,
        amount: formattedAmount,
        message: message,
        token: props.token
      })
      if (res.status === 200) {
        setRequestSent(true)
        setErrorMessage('')
      }
      setButtonDisabled(false)
    } catch (e) {
      setErrorMessage('Error: Request failed')
      if (message.length > 60) {
        setMessageError(true)
        setErrorMessage('Viesti max. 60 merkkiä.')
      } else {
        setMessageError(false)
        setErrorMessage('')
      }
      setButtonDisabled(false)
    }
  }

  const formatAmount = () => {
    const formattedAmount = amount.replace(',', '.')
    return Number(formattedAmount)
  }

  const clearInputs = () => {
    setSelected([])
    setAmount('')
    setMessage('')
    setRequestSent(false)
  }

  const handleSelection = (username) => {
    if (username === 'Asukit' && !selected.includes('Asukit')) {
      setSelected(['Asukit'])
      return
    }
    if (username !== 'Asukit' && selected.includes('Asukit')) return
    if (selected.includes(username)) {
      const newSelected = selected.filter(s => s !== username)
      setSelected(newSelected)
    } else {
      setPayersError(false)
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
          <p key='Asukit' className={classNames({ 'AddDue-user-item': !selected.includes('Asukit') }, { 'AddDue-user-item Selected': selected.includes('Asukit') }, { 'AddDue-user-item Error': payersError })} onClick={() => handleSelection('Asukit')}>{'Asukit'}</p>
          {users.length > 0 && users.map(user => <p key={user.name} className={classNames({ 'AddDue-user-item': (!selected.includes(user.name) && !payersError) }, { 'AddDue-user-item Selected': selected.includes(user.name) }, { 'AddDue-user-item Error': payersError })} onClick={() => handleSelection(user.name)}>{user.name}</p>)}
        </div>}
        {!users.length &&
          <div className='Loading-animation-container'>
            <div className='Half-circle-large'></div><div className='Half-circle-small'></div>
          </div>
        }
        <div className='AddDue-inputs'>
          <input type='text' className={classNames({ 'Input-field-amount': !amountError }, { 'Input-field-amount Error': amountError })} placeholder='Summa' value={amount} onChange={(event) => setAmount(event.target.value)} />
          <input type='text' className={classNames({ 'Input-field-message': !messageError }, { 'Input-field-message Error': messageError })} placeholder='Viesti' value={message} onChange={(event) => setMessage(event.target.value)} />
        </div>
      </div>
      {errorMessage && <p className='Error-message'>{errorMessage}</p>}
      {!requestSent && <input type='button' disabled={buttonDisabled} className='btn Add-btn' onClick={async () => await addDue()} value="Pyydä" />}
      {requestSent && <svg onClick={() => clearInputs()} className='checkmark' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle className='checkmark__circle' cx="26" cy="26" r="25" fill="none" />
        <path className='checkmark__check' fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      </svg>}
    </div>
  )
}

export default AddDues
