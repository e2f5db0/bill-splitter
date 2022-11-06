import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import classNames from 'classnames'

const Pay = (props) => {

  const baseurl = process.env.REACT_APP_BACKEND_URL

  const [debts, setDebts] = useState([])
  const [selected, setSelected] = useState('')
  const [paymentSent, setPaymentSent] = useState(false)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [messages, setMessages] = useState([])
  const [showMessages, setShowMessages] = useState(false)
  const [amountToBePayed, setAmountToBePayed] = useState('')
  const [paymentConfirmation, setPaymentConfirmation] = useState(false)

  const fetchDebts = useCallback(async () => {
    const res = await axios.get(`${baseurl}/debts/${props.user}`)
    setDebts(res.data)
    // preselect if there is only one requester
    if (res.data.length === 1) {
      const debt = res.data[0]
      setSelected(debt.requester)
      setTotalAmount(debt.totalAmount)
      formatMessages(debt.messages)
    }
  }, [baseurl, props.user])
  
  useEffect(() => {
    fetchDebts()
  }, [baseurl, fetchDebts])

  const formatMessages = (msgs) => {
    let allMessages = []
    for (const msg of msgs) {
      const formattedRows = msg.split('|')
      for (const row of formattedRows) {
        allMessages = [
          row,
          ...allMessages
        ]
      }
    }
    setMessages(allMessages)
  }

  const pay = async () => {
    // amount is optional
    let formattedAmount
    if (amountToBePayed !== '') {
      formattedAmount = Number(amountToBePayed.replace(',', '.'))
      // NaN if amount is not a number
      if (!formattedAmount) {
        setError(true)
        return
      } else {
        setError(false)
      }
    }
    if (!paymentConfirmation) {
      setPaymentConfirmation(true)
      return
    }
    try {
      const res = await axios.post(`${baseurl}/debts/pay`, {
        payer: props.user,
        requester: selected,
        amount: formattedAmount
      })
      if (res.status === 200) {
        setPaymentSent(true)
        setPaymentConfirmation(false)
        setErrorMessage('')
      }
    } catch (e) {
      setErrorMessage(`Error: ${e.message}`)
    }
  }

  const handleSelection = (username) => {
    fetchDebts()
    setShowMessages(false)
    setPaymentSent(false)
    setPaymentConfirmation(false)
    if (selected === username) {
      setSelected('')
      setErrorMessage('')
    } else {
      setSelected(username)
      // show debt details for the selected user
      const debt = debts.filter(debt => debt.requester === username)[0]
      setTotalAmount(debt.totalAmount)
      formatMessages(debt.messages)
    }
  }

  const clearSelection = () => {
    fetchDebts()
    setSelected('')
    setAmountToBePayed('')
    setPaymentSent(false)
    setPaymentConfirmation(false)
  }

  return (
    <div className='Container'>
      <div className='Payment-container'>
        <h2>Maksa</h2>
        {debts.length > 0 && <div className='Payment-user-selection'>
          {debts.length > 0 && debts.map(debt => <p key={debt.requester} className={classNames({ 'Payment-user-item': selected !== debt.requester }, { 'Payment-user-item Selected': selected === debt.requester })} onClick={() => handleSelection(debt.requester)}>{debt.requester}</p>)}
        </div>}
        <div>
          <p>Velat:</p>
          {selected && <h2>{totalAmount}€</h2>}
          {!selected && <h2>- €</h2>}
          {showMessages && <div className='Payment-message-list'>
            {messages.map(message => <p key={message}>{message}</p>)}
          </div>}
          {(!showMessages && selected !== '') && <div className='Payment-messages-button' onClick={() => setShowMessages(true)}>
            <p>Näytä viestit</p>
          </div>}
        </div>
      </div>
      <div className='Payment-inputs'>
        {selected && <input type='text' className={classNames({ 'Payment-input-field-amount': !error }, { 'Payment-input-field-amount Error': error })} placeholder='Summa (optional)' value={amountToBePayed} onChange={(event) => setAmountToBePayed(event.target.value)} />}
        {(!paymentSent && selected) && <button className='btn Pay-btn' onClick={async () => await pay()}>{paymentConfirmation ? 'Vahvista' : 'Maksa'}</button>}
        {errorMessage && <p>{errorMessage}</p>}
        {paymentSent && <svg onClick={() => clearSelection()} className='checkmark' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle className='checkmark__circle' cx="26" cy="26" r="25" fill="none" />
          <path className='checkmark__check' fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>}
      </div>
    </div>
  )
}

export default Pay
