const cors = require('cors')
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}
const express = require('express')
var bodyParser = require('body-parser')

const app = express()

const indexRouter = require('./routes/index')
const examplesRouter = require('./routes/examples')

app.use(cors())
app.use(bodyParser.json())

app.use('/', indexRouter)
app.use('/examples', examplesRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`) // eslint-disable-line no-console
})