import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import classNames from 'classnames'
import { AppContext } from '..'

const Dues = (props) => {

  const baseurl = useContext(AppContext)

  const [debts, setDebts] = useState([])
  const [selected, setSelected] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [messages, setMessages] = useState([])
  const [showMessages, setShowMessages] = useState(false)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState('')
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [removedDebtMessage, setRemovedDebtMessage] = useState('')
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const fetchDebts = async () => {
      const config = {
        headers: { Authorization: `Bearer ${props.token}` }
      }
      const res = await axios.get(`${baseurl}/debts/dues/${props.user}`, config)
      setDebts(res.data)
      // preselect if there is only one payer
      if (res.data.length === 1) {
        const debt = res.data[0]
        setSelected(debt.payer)
        setTotalAmount(debt.totalAmount)
        setMessages(debt.messages)
      }
    }
    fetchDebts()
  }, [baseurl, props.user, props.token])

  const handleSelection = (username) => {
    setShowMessages(false)
    if (selected === username) {
      setSelected('')
    } else {
      setSelected(username)
      // show debt details for the selected user
      const debt = debts.filter(debt => debt.payer === username)[0]
      setTotalAmount(debt.totalAmount)
      setMessages(debt.messages)
    }
  }

  const removeDue = async () => {
    if (messageToDelete) {
      setButtonDisabled(true)
      try {
        await axios.post(`${baseurl}/debts/remove`, {
          payer: selected,
          requester: props.user,
          message: messageToDelete,
          token: props.token
        })
        handleShowConfirmationDialog()
        setButtonDisabled(false)
        // Show notification with the removed debt message
        setRemovedDebtMessage(messageToDelete)
        setShowNotification(true)
        setCountdown(10)
      } catch (e) {
        console.warn(e)
        setButtonDisabled(false)
      }
    }
  }

  // Handle countdown timer and navigation
  useEffect(() => {
    let timer
    if (showNotification && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (showNotification && countdown === 0) {
      setShowNotification(false)
      props.setView('main')
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [showNotification, countdown, props])

  const handleShowConfirmationDialog = () => {
    setShowConfirmationDialog(!showConfirmationDialog)
  }

  const handleRemove = (message) => {
    setMessageToDelete(message)
    handleShowConfirmationDialog()
  }

  return (
    <div className='Container'>
      {showNotification && <div className='Notification-container'>
        <div className='Notification-box'>
          <div className='Notification-content'>
            <h3>Velka poistettu</h3>
            <p>{removedDebtMessage}</p>
          </div>
          <div className='Notification-timer'>
            Sulkeutuu {countdown}s
          </div>
          <div className='Notification-progress-bar'>
            <div 
              className='Notification-progress-fill' 
              style={{ width: `${(countdown / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>}
      {showConfirmationDialog && <div className='backdrop'>
        <div className='Dues-confirmation-dialog'>
          <p>Haluatko varmasti poistaa velan?</p>
          <p><b>{messageToDelete}</b></p>
          <div>
            <input type='button' className='Dues-confirmation-dialog-cancel-button' onClick={() => handleShowConfirmationDialog()} value="Peruuta" />
            <input type='button' className='Dues-confirmation-dialog-delete-button' disabled={buttonDisabled} onClick={() => removeDue()} value="Poista" />
          </div>
        </div>
      </div>}
      <div className='Payment-container'>
        <h2>Saamatta</h2>
        {debts.length > 0 && <div className='Payment-user-selection'>
          {debts.length > 0 && debts.map(debt => <p key={debt.payer} className={classNames({ 'Payment-user-item': selected !== debt.payer }, { 'Payment-user-item Selected': selected === debt.payer })} onClick={() => handleSelection(debt.payer)}>{debt.payer}</p>)}
        </div>}
        <div>
          <p>Velat:</p>
          {selected && <h2>{totalAmount}€</h2>}
          {!selected && <h2>- €</h2>}
          {showMessages && <div className='Payment-message-list'>
            {messages.map(message => <span key={message} className='Payment-message-list-item'>{message} <input type='button' className='Remove-button' onClick={() => handleRemove(message)} value='Poista' /></span>)}
          </div>}
          {(!showMessages && selected !== '') && <div className='Payment-messages-button' onClick={() => setShowMessages(true)}>
            <p>Näytä viestit</p>
          </div>}
        </div>
      </div>
    </div>
  )
}

export default Dues
