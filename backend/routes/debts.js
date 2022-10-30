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

/* DELETE single debt */
singleRouter.delete('/', async (req, res) => {
  await req.debt.delete()
  res.sendStatus(200)
})

router.use('/:id', findByIdMiddleware, singleRouter)

module.exports = router