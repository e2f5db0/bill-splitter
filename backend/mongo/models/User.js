const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: String,
  totalDebt: Number,
  totalDue: Number
})

module.exports = mongoose.model('User', userSchema)