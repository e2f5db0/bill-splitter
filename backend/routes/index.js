const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).send('Backend running...')
})

router.post('/login', async (req, res) => {
  const { password } = req.body
  let success = await bcrypt.compare(password, '$2b$10$EtnnFTd0Nw6I.EY9.mkFbOMYSuF1N9A35az8X..uIs9Lr3idwdBJW')
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
