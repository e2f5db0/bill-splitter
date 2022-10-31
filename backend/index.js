const cors = require('cors')
require('dotenv').config()
const express = require('express')
var bodyParser = require('body-parser')

const app = express()

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const debtsRouter = require('./routes/debts')

app.use(cors())
app.use(bodyParser.json())
app.use(express.json())

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/debts', debtsRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`) // eslint-disable-line no-console
})