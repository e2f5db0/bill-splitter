import React, { useEffect, useState } from 'react'
import axios from 'axios'
import classNames from 'classnames'

const querystring = require('querystring')

const Pay = (props) => {

  // TBA use values from database
  // users to which the current user needs to pay
  const hardcodedDebts = [
    {
      id: 1,
      name: 'Susi',
      totalAmount: 10,
      messages: [
        {
          id: 1,
          message: 'sähkölasku'
        },
        {
          id: 2,
          message: 'pepe'
        },
      ]
    },
    {
      id: 2,
      name: 'Sammakko',
      totalAmount: 3,
      messages: [
        {
          id: 3,
          message: 'patukka'
        },
        {
          id: 4,
          message: 'kauppa'
        }
      ]
    }
  ]

  const [users, setUsers] = useState(hardcodedDebts)
  const [selected, setSelected] = useState('')
  const [paymentSent, setPaymentSent] = useState(false)
  const [error, setError] = useState(false)
  const [totalAmount, setTotalAmount] = useState('')
  const [messages, setMessages] = useState([])
  const [fetchedOnce, setFetchedOnce] = useState(false)

  const url = process.env.REACT_APP_DATABASE_URL

  const fetchUsers = () => axios.get(`${url}/users`).then((res) => setUsers(res.data)).catch(error => console.log(error))

  //useEffect(() => {
  //    if (!fetchedOnce) {
  //        fetchTopics()
  //    }
  //    setInterval(() => {
  //        fetchUsers()
  //        setFetchedOnce(true)
  //    }, 2000)
  //}, [])

  const pay = async (id) => {
    if (selected.length === 0) {
      setError(true)
      return
    } else {
      setError(false)
    }
    //await axios.post(`${url}/pay/${id}`, querystring.stringify({ user: props.user }))
    setPaymentSent(true)
  }

  const handleSelection = (username) => {
    if (selected === username) {
      setSelected('')
    } else {
      setSelected(username)
      // show debt details for the selected user
      const user = users.filter(u => u.name === username)[0]
      setTotalAmount(user.totalAmount)
      setMessages(user.messages)
    }
  }

  const clearSelection = () => {
    setSelected('')
    setPaymentSent(false)
  }

  return (
    <div className='Container'>
      <h2>Maksa</h2>
      <div className='Payment-container'>
        {users.length && <div className='Payment-user-selection'>
          {users.length > 0 && users.map(user => <p key={user.name} className={classNames({ 'Payment-user-item': !selected.includes(user.name) }, { 'AddDue-user-item Selected': selected.includes(user.name) })} onClick={() => handleSelection(user.name)}>{user.name}</p>)}
        </div>}
        {!users.length &&
          <div className='Loading-animation-container'>
            <div className='Half-circle-large'></div><div className='Half-circle-small'></div>
          </div>
        }
        <div>
          <p>Velat yhteensä:</p>
          {totalAmount && <h2>{totalAmount}€</h2>}
          {!totalAmount && <h2>- €</h2>}
          <div className='Payment-message-list'>
            {messages.map(m => <p className='Debt-dashboard-item-right'>{m.message}</p>)}
          </div>
        </div>
      </div>
      {!paymentSent && <button className={classNames({ 'btn Add-btn': !error }, { 'btn Add-btn Error': error })} onClick={async () => await pay()}>Maksa</button>}
      {paymentSent && <svg onClick={() => clearSelection()} class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
        <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      </svg>}
    </div>
  )
}

export default Pay
