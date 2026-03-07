import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '..'

const Main = (props) => {

  const baseurl = useContext(AppContext)

  const [userDebts, setUserDebts] = useState([])
  const [userDues, setUserDues] = useState([])

  useEffect(() => {
    async function fetchDebts() {
      const config = {
        headers: { Authorization: `Bearer ${props.token}` }
      }
      const res = await axios.get(`${baseurl}/debts/${props.user}`, config)
      setUserDebts(res.data)
    }
    async function fetchDues() {
      const config = {
        headers: { Authorization: `Bearer ${props.token}` }
      }
      const res = await axios.get(`${baseurl}/debts/dues/${props.user}`, config)
      setUserDues(res.data)
    }
    fetchDebts()
    fetchDues()
  }, [baseurl, props.user, props.token])

  return (
    <div className='Container'>
      <h1>{props.user} </h1>
      <div className='Debt-dashboard' onClick={() => props.setView('pay')}>
        <h4 className='Debts-title'>Maksettava:</h4>
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
      <div className='Debt-dashboard' onClick={() => props.setView('dues')}>
        <h4 className='Dues-title'>Saamatta:</h4>
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
