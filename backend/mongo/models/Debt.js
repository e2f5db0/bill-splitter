const mongoose = require('mongoose')

const debtSchema = new mongoose.Schema({
  requester: String,
  payer: String,
  amount: Number,
  message: String
})

module.exports = mongoose.model('Debt', debtSchema)