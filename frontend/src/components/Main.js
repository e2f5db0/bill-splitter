import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Main = (props) => {

  const baseurl = process.env.REACT_APP_BACKEND_URL

  const [userDebts, setUserDebts] = useState([])
  const [userDues, setUserDues] = useState([])

  useEffect(() => {
    async function fetchDebts() {
      const res = await axios.get(`${baseurl}/debts/${props.user}`)
      setUserDebts(res.data)
    }
    async function fetchDues() {
      const res = await axios.get(`${baseurl}/debts/dues/${props.user}`)
      setUserDues(res.data)
    }
    fetchDebts()
    fetchDues()
  }, [baseurl, props.user])

  return (
    <div className='Container'>
      <h1>{props.user} </h1>
      <div className='Debt-dashboard'>
        <h4>Maksettava:</h4>
        <div className='Debt-dashboard-list'>
          {userDebts.length > 0 ? userDebts.map(debt => {
            return (
              <div key={debt.requester} className='Debt-dashboard-row'>
                <small className='Debt-dashboard-item-left'>{debt.requester}: </small>
                <b className='Debt-dashboard-item-right'><small>{debt.totalAmount}€</small></b>
              </div>
            )
          }) : <small>0 €</small>}
        </div>
      </div>
      <div className='Debt-dashboard'>
        <h4>Saamatta:</h4>
        <div className='Debt-dashboard-list'>
          {userDues.length > 0 ? userDues.map(due => {
            return (
              <div key={due.payer} className='Debt-dashboard-row'>
                <small className='Debt-dashboard-item-left'>{due.payer}: </small>
                <b className='Debt-dashboard-item-right'><small>{due.totalAmount}€</small></b>
              </div>
            )
          }) : <small>0 €</small>}
        </div>
      </div>
      <div className='Main-button' onClick={() => props.setView('addDues')}>
        <p>Pyydä</p>
      </div>
      {userDebts.length > 0 && <div className='Main-button' onClick={() => props.setView('pay')}>
        <p>Maksa</p>
      </div>}
    </div>
  )
}

export default Main
