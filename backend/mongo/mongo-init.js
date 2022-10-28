if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

/* eslint-disable no-undef */
db.createUser({
  user: process.env.DB_USER,
  pwd: process.env.DB_PASSWORD,
  roles: [
    {
      role: 'dbOwner',
      db: process.env.DB_NAME,
    },
  ],
})

db.createCollection('examples')

db.examples.insert({ field1: 'Highbreek is the best hawk.', field2: true })
db.examples.insert({ field1: 'Bragi is the best poet.', field2: true })
db.examples.insert({ field1: 'Sleipnir is the best horse.', field2: true })
db.examples.insert({ field1: 'Bifrost is the best bridge.', field2: true })
db.examples.insert({ field1: 'Brimi is the best sword.', field2: true })
db.examples.insert({ field1: 'Yggdrasil is the best tree.', field2: true })
db.examples.insert({ field1: 'Garm is the best dog.', field2: true })