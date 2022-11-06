const express = require('express')
const { User } = require('../mongo')
const router = express.Router()

/* GET users listing. */
router.get('/', async (_, res) => {
  const users = await User.find({})
  res.send(users)
})

const singleRouter = express.Router()

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.user = await User.findById(id)
  if (!req.user) return res.sendStatus(404)

  next()
}

/* GET user */
singleRouter.get('/', async (req, res) => {
  res.status(200).send(req.user)
})

router.use('/:id', findByIdMiddleware, singleRouter)

module.exports = router