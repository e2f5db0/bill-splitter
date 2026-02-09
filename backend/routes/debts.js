const jwt = require('jsonwebtoken')
const express = require('express')
const { Debt } = require('../mongo')
const { User } = require('../mongo')
const router = express.Router()

// Authentication middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  try {
    const authorization = req.get('authorization')
    let token = null
    
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      token = authorization.substring(7)
    }
    
    if (!token) {
      return res.status(401).json({ error: 'token missing' })
    }
    
    const decodedToken = jwt.verify(token, process.env.SECRET)
    
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' })
    }
    
    req.userId = decodedToken.id
    next()
  } catch (error) {
    return res.status(401).json({ error: 'token invalid' })
  }
}

/* GET all debts */
router.get('/', authenticateToken, async (_, res) => {
  const debts = await Debt.find({})
  res.send(debts)
})

const illegalInput = (input) => {
  if (!input) return false
  if (typeof (input) === 'object') {
    try {
      for (const i of input) {
        if (!i.match(/^[a-zäö]+$/i)) return true
      }
    } catch (error) {
      return false
    }
  }
  if (input.length > 60) return true
  if (typeof (input) === 'string' && !input.match(/^[a-zäö0-9 ,()-.&#!?%+]+$/i)) return true
  if (typeof (input) === 'number' && !String(input).match(/^[0-9.]+$/i)) return true
  return false
}

/* GET debts by payer */
router.get('/:payer', authenticateToken, async (req, res) => {
  const { payer } = req.params
  if (illegalInput(payer)) {
    res.status(400).send('Error: illegal input.')
    return
  }
  const debts = await Debt.find({ payer: payer })
  // aggregate entries per payer
  const users = await User.find({})
  let aggregatedDebts = []
  users.forEach(user => {
    const debtsPerRequester = debts.filter(d => d.requester === user.name)
    if (debtsPerRequester.length > 0) {
      const amounts = debtsPerRequester.map(d => d.amount)
      let totalAmount = amounts.reduce((a, b) => a + b, 0)
      totalAmount = totalAmount.toFixed(2)
      const messages = debtsPerRequester.map(d => d.message)
      const aggregatedDebt = {
        requester: user.name,
        totalAmount: totalAmount,
        messages: messages
      }
      aggregatedDebts = [
        aggregatedDebt,
        ...aggregatedDebts
      ]
    }
  })
  res.send(aggregatedDebts)
})

/* GET dues by requester */
router.get('/dues/:requester', authenticateToken, async (req, res) => {
  const { requester } = req.params
  if (illegalInput(requester)) {
    res.status(400).send('Error: illegal input.')
    return
  }
  const dues = await Debt.find({ requester: requester })
  // aggregate entries per payer
  const users = await User.find({})
  let aggregatedDues = []
  users.forEach(user => {
    const duesPerPayer = dues.filter(d => d.payer === user.name)
    if (duesPerPayer.length > 0) {
      const amounts = duesPerPayer.map(d => d.amount)
      let totalAmount = amounts.reduce((a, b) => a + b, 0)
      totalAmount = totalAmount.toFixed(2)
      const messages = duesPerPayer.map(d => d.message)
      const aggregatedDue = {
        payer: user.name,
        totalAmount: totalAmount,
        messages: messages
      }
      aggregatedDues = [
        aggregatedDue,
        ...aggregatedDues
      ]
    }
  })
  res.send(aggregatedDues)
})

// when the requester has existing debt to the payer
const handleCounterDebt = async (oldDebts, requester, payer, newDebtAmount, message) => {
  let totalOtherwayDebt = 0
  if (oldDebts.length > 1) {
    for (const debt of oldDebts) {
      totalOtherwayDebt += debt.amount
    }
  } else {
    totalOtherwayDebt = oldDebts[0].amount
  }
  // if old debt is not wiped by the new debt
  if (totalOtherwayDebt > newDebtAmount) {
    let negativeAmount = newDebtAmount * (-1)
    negativeAmount = negativeAmount.toFixed(2)
    await Debt.create({
      requester: payer,
      payer: requester,
      amount: negativeAmount,
      message: `+ ${message} ( ${newDebtAmount}€ )`
    })
    // if old debt is wiped by the new debt
  } else if (totalOtherwayDebt < newDebtAmount) {
    await Debt.deleteMany({ requester: payer, payer: requester })
    let messageHistoryAmountsFlipped = `- ${message} ( ${newDebtAmount}€ )`
    for (const debt of oldDebts) {
      // flip plus to minus and minus to plus
      const flippedMessage = debt.message.replace('-', '§').replace('+', '#').replace('§', '+').replace('#', '-')
      await Debt.create({
        requester: requester,
        payer: payer,
        amount: 0,
        message: flippedMessage
      })
    }
    let reducedAmount = newDebtAmount - totalOtherwayDebt
    reducedAmount = reducedAmount.toFixed(2)
    await Debt.create({
      requester: requester,
      payer: payer,
      amount: reducedAmount,
      message: messageHistoryAmountsFlipped
    })
  } else { // all debts between requester and payer cancel each other
    await Debt.deleteMany({ requester: payer, payer: requester })
  }
}

/* POST add due(s) */
router.post('/addDue', async (req, res) => {
  try {
    const { token } = req.body
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
      res.status(401).json({ error: 'token missing or invalid' })
      return
    }
    const { requester, payers, amount, message } = req.body
    // sanitize inputs
    if (illegalInput(requester) ||
      illegalInput(payers) ||
      illegalInput(amount) ||
      illegalInput(message)) {
      res.status(400).send('Error: illegal input.')
      return
    }
    let actualPayers
    let amountPerUser
    if (payers[0] === 'Asukit') {
      const users = await User.find({})
      actualPayers = users.map(user => user.name)
    } else {
      actualPayers = payers
    }
    amountPerUser = amount / actualPayers.length
    amountPerUser = amountPerUser.toFixed(2)
    for (const payer of actualPayers) {
      // skip the requester
      if (payer === requester) continue
      // check if debt(s) exists the other way
      const debtsOtherWay = await Debt.find({ requester: payer, payer: requester })
      if (debtsOtherWay.length > 0) {
        handleCounterDebt(debtsOtherWay, requester, payer, amountPerUser, message)
        continue
      }
      await Debt.create({
        requester: requester,
        payer: payer,
        amount: amountPerUser,
        message: `- ${message} ( ${amountPerUser}€ )`
      })
    }
    res.send('Due(s) added.')
  } catch (e) {
    res.status(400).send(`Error: ${e.message}`)
  }
})

/* POST pay debts by requester */
router.post('/pay', async (req, res) => {
  const { token } = req.body
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    res.status(401).json({ error: 'token missing or invalid' })
    return
  }
  const { payer, requester, amount } = req.body
  if (illegalInput(payer) ||
    illegalInput(requester) ||
    illegalInput(amount)) {
    res.status(400).send('Error: illegal input.')
    return
  }
  try {
    if (!amount) {
      await Debt.deleteMany({ payer: payer, requester: requester })
      res.status(200).send('Debts paid.')
      return
    }
    const debts = await Debt.find({ requester: requester, payer: payer })
    const amounts = debts.map(d => d.amount)
    let totalDebt
    if (debts.length === 1) {
      totalDebt = debts[0].amount
    } else {
      totalDebt = amounts.reduce((a, b) => a + b, 0)
    }
    if (amount < totalDebt) {
      let amountToFixed = amount.toFixed(2)
      let negativeAmount = amount * (-1)
      negativeAmount = negativeAmount.toFixed(2)
      await Debt.create({
        requester: requester,
        payer: payer,
        amount: negativeAmount,
        message: `+ Vähennys ( ${amountToFixed}€ )`
      })
      res.status(200).send('Debts paid.')
      return
    } else if (amount > totalDebt) {
      // create counter debt
      let newAmount = (totalDebt - amount) * (-1)
      newAmount = newAmount.toFixed(2)
      await Debt.create({
        requester: payer,
        payer: requester,
        amount: newAmount,
        message: `- Liikamaksu ( ${newAmount}€ )`
      })
    }
    // if amount >= totalDebt
    await Debt.deleteMany({ payer: payer, requester: requester })
    res.status(200).send('Debts paid.')
  } catch (e) {
    res.status(400).send(`Error: ${e.message}`)
  }
})

router.post('/remove', async (req, res) => {
  const { token } = req.body
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    res.status(401).json({ error: 'token missing or invalid' })
    return
  }
  const { payer, requester, message } = req.body
  await Debt.deleteOne({ payer: payer, requester: requester, message: message })
  res.status(200).send('Debts paid.')
  return
})

const singleRouter = express.Router()

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.debt = await Debt.findById(id)
  if (!req.debt) return res.sendStatus(404)

  next()
}

/* GET single debt */
singleRouter.get('/', authenticateToken, async (req, res) => {
  res.status(200).send(req.debt)
})

router.use('/:id', findByIdMiddleware, singleRouter)

module.exports = router