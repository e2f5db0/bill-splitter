const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).send('Backend running...')
})

router.get('/ping', (req, res) => {
  res.send('pong')
})

module.exports = router
