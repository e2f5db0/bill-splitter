require('dotenv').config()

const MONGO_URL = process.env.NODE_ENV === 'development' ? process.env.MONGO_URL_DEV : process.env.MONGO_URL

module.exports = {
  MONGO_URL,
}