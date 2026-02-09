const jwt = require('jsonwebtoken')
const express = require('express')
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

/* GET users listing. */
router.get('/', authenticateToken, async (_, res) => {
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
singleRouter.get('/', authenticateToken, async (req, res) => {
  res.status(200).send(req.user)
})

router.use('/:id', findByIdMiddleware, singleRouter)

module.exports = router