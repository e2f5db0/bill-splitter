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
      const totalAmount = amounts.reduce((a, b) => a + b, 0)
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
      const totalAmount = amounts.reduce((a, b) => a + b, 0)
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

/* POST add due(s) */
// TBA optimization algorithm
router.post('/addDue', async (req, res) => {
  const { requester, payers, amount, message } = req.body
  // add debts to all users
  if (payers[0] === 'Kaikki') {
    try {
      const users = await User.find({})
      const amountPerUser = amount / users.length
      users.forEach((user) => {
        // skip the requester
        if (user.name === requester) return
        Debt.create({
          requester: requester,
          payer: user.name,
          amount: amountPerUser,
          message: `- ${message}`
        })
      })
      res.status(200).send('Due(s) added.')
    } catch (e) {
      res.status(400).send(`Error: ${e.message}`)
    }
  // add debts to selected users only
  } else {
    try {
      const amountPerUser = amount / payers.length
      await payers.forEach(payer => {
        // skip the requester
        if (payer === requester) return
        Debt.create({
          requester: requester,
          payer: payer,
          amount: amountPerUser,
          message: `- ${message}`
        })
      })
      res.status(200).send('Due(s) added.')
    } catch (e) {
      res.status(400).send(`Error: ${e.message}`)
    }
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