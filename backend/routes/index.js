const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).send('Backend running...')
})

router.post('/login', async (req, res) => {
  const { password } = req.body
  
  // Get password hash from environment variable
  const passwordHash = process.env.LOGIN_PASSWORD_HASH
  
  if (!passwordHash) {
    console.error('ERROR: LOGIN_PASSWORD_HASH is not set in environment variables')
    return res.status(500).send("Server configuration error. Please contact administrator.")
  }
  
  let success = await bcrypt.compare(password, passwordHash)
  if (success) {
    const userForToken = {
      username: 'kommuuni',
      id: 1,
    }
    const token = jwt.sign(userForToken, process.env.SECRET)
    res.send({ token })
  } else {
    res.status(401).send("Incorrect credentials.")
  }
})

router.get('/ping', (req, res) => {
  res.send('pong')
})

module.exports = router
