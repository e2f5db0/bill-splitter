const express = require('express')
const { Debt } = require('../mongo')
const { User } = require('../mongo')
const router = express.Router()

/* GET all debts */
router.get('/', async (_, res) => {
  const debts = await Debt.find({})
  res.send(debts)
})

/* GET debts by payer */
router.get('/:payer', async (req, res) => {
  const { payer } = req.params
  const debts = await Debt.find({ payer: payer })
  // aggregate entries per payer
  const users = await User.find({})
  let aggregatedDebts = []
  users.forEach(user => {
    const debtsPerRequester = debts.filter(d => d.requester === user.name)
    if (debtsPerRequester.length > 0) {
      const amounts = debtsPerRequester.map(d => d.amount)
      let totalAmount = amounts.reduce((a, b) => a + b, 0)
      totalAmount = totalAmount.toFixed(1)
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
router.get('/dues/:requester', async (req, res) => {
  const { requester } = req.params
  const dues = await Debt.find({ requester: requester })
  // aggregate entries per payer
  const users = await User.find({})
  let aggregatedDues = []
  users.forEach(user => {
    const duesPerPayer = dues.filter(d => d.payer === user.name)
    if (duesPerPayer.length > 0) {
      const amounts = duesPerPayer.map(d => d.amount)
      let totalAmount = amounts.reduce((a, b) => a + b, 0)
      totalAmount = totalAmount.toFixed(1)
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
    negativeAmount = negativeAmount.toFixed(1)
    await Debt.create({
      requester: payer,
      payer: requester,
      amount: negativeAmount,
      message: `+ ${message} ( ${newDebtAmount}€ )`
    })
  } else if (totalOtherwayDebt < newDebtAmount) { // if new debt is bigger than old debt
    await Debt.deleteMany({ requester: payer, payer: requester })
    let reducedAmount = newDebtAmount - totalOtherwayDebt
    reducedAmount = reducedAmount.toFixed(1)
    let messageAmountsFlipped = `- ${message} ( ${newDebtAmount}€ )`
    for (const debt of oldDebts) {
      const flippedMessage = debt.message.replace('-', '+')
      messageAmountsFlipped += `|${flippedMessage}`
    }
    await Debt.create({
      requester: requester,
      payer: payer,
      amount: reducedAmount,
      message: messageAmountsFlipped
    })
  } else { // all debts between requester and payer cancel each other
    await Debt.deleteMany({ requester: payer, payer: requester })
  }
}

/* POST add due(s) */
router.post('/addDue', async (req, res) => {
  try {
    const { requester, payers, amount, message } = req.body
    let actualPayers
    let amountPerUser
    if (payers[0] === 'Kaikki') {
      const users = await User.find({})
      actualPayers = users.map(user => user.name)
    } else {
      actualPayers = payers
    }
    amountPerUser = amount / actualPayers.length
    amountPerUser = amountPerUser.toFixed(1)
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
  const { payer, requester } = req.body
  try {
    await Debt.deleteMany({ payer: payer, requester: requester })
    res.status(200).send('Debts paid.')
  } catch (e) {
    res.status(400).send(`Error: ${e.message}`)
  }
})

const singleRouter = express.Router()

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.debt = await Debt.findById(id)
  if (!req.debt) return res.sendStatus(404)

  next()
}

/* GET single debt */
singleRouter.get('/', async (req, res) => {
  res.status(200).send(req.debt)
})

router.use('/:id', findByIdMiddleware, singleRouter)

module.exports = router