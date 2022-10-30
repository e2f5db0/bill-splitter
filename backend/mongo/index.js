const mongoose = require('mongoose')
const User = require('./models/User')
const Debt = require('./models/Debt')
const { MONGO_URL } = require('../util/config')

if (MONGO_URL && !mongoose.connection.readyState) mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })

module.exports = {
  User,
  Debt
}