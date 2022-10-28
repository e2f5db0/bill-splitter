const mongoose = require('mongoose')
const Example = require('./models/Example')
const { MONGO_URL } = require('../util/config')

if (MONGO_URL && !mongoose.connection.readyState) mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })

module.exports = {
  Example
}