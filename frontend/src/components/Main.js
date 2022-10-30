import axios from 'axios'
import React, { useState } from 'react'

const Main = (props) => {

  const hardCodedDebts = [
    {
      id: 1,
      receiver: 'Sammakko',
      totalAmount: 3,
      messages: ['Tippabisse', 'Patukka']
    },
    {
      id: 2,
      receiver: 'Susi',
      totalAmount: 10,
      messages: ['Sähkölasku']
    }
  ]

  const hardCodedDues = [
    {
      id: 1,
      user: 'Karibu',
      totalAmount: 10,
      messages: ['Tippabisse', 'Patukka']
    },
    {
      id: 2,
      user: 'Lepakko',
      totalAmount: 10,
      messages: ['Tippabisse', 'Patukka']
    }
  ]

  const fetchDebts = (user) => {
    // TBA fetch debts for the current user
  }

  const fetchDues = (user) => {
    // TBA fetch dues for the current user
  }

  const [userDebts, setUserDebts] = useState(hardCodedDebts)

  return (
    <div className='Container'>
      <h1>{props.user} </h1>
      <div className='Debt-dashboard'>
        <h4>Velat:</h4>
        <div className='Debt-dashboard-list'>
          {hardCodedDebts.length > 0 ? hardCodedDebts.map(debt => {
            return (
              <div key={debt.id} className='Debt-dashboard-row'>
                <small className='Debt-dashboard-item-left'>{debt.receiver}: </small>
                <b className='Debt-dashboard-item-right'><small>{debt.totalAmount}€</small></b>
              </div>
            )
          }) : <small>Ei velkoja.</small>}
        </div>
      </div>
      <div className='Debt-dashboard'>
        <h4>Saamatta:</h4>
        <div className='Debt-dashboard-list'>
          {hardCodedDues.length > 0 ? hardCodedDues.map(due => {
            return (
              <div key={due.id} className='Debt-dashboard-row'>
                <small className='Debt-dashboard-item-left'>{due.user}: </small>
                <b className='Debt-dashboard-item-right'><small>{due.totalAmount}€</small></b>
              </div>
            )
          }) : <small>Ei velkoja.</small>}
        </div>
      </div>
      <div className='Main-button' onClick={() => props.setView('addDues')}>
        <p>Pyydä</p>
      </div>
      <div className='Main-button' onClick={() => props.setView('pay')}>
        <p>Maksa</p>
      </div>
    </div>
  )
}

export default Main
