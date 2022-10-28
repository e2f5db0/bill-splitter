const mongoose = require('mongoose')

const exampleSchema = new mongoose.Schema({
  field1: String,
  field2: Boolean
})

module.exports = mongoose.model('Example', exampleSchema)