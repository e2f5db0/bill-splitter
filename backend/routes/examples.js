const express = require('express')
const { Example } = require('../mongo')
const router = express.Router()

/* GET examples listing. */
router.get('/', async (_, res) => {
  const examples = await Example.find({})
  res.send(examples)
})

/* POST examples to listing. */
router.post('/', async (req, res) => {
  const example = await Example.create({
    field1: req.body.field1,
    field2: req.body.field2
  })
  res.send(example)
})

const singleRouter = express.Router()

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.example = await Example.findById(id)
  if (!req.example) return res.sendStatus(404)

  next()
}

/* DELETE example. */
singleRouter.delete('/', async (req, res) => {
  await req.example.delete()
  res.sendStatus(200)
})

/* GET example. */
singleRouter.get('/', async (req, res) => {
  res.status(200).send(req.example)
})

/* PUT example. */
singleRouter.put('/', async (req, res) => {
  const { field1, field2 } = req.body
  const newExample = await Example.findOneAndUpdate(
    { _id: req.example._id },
    { field1, field2 },
    { new: true, useFindAndModify: false }
  )
  res.status(200).send(newExample)
})

router.use('/:id', findByIdMiddleware, singleRouter)

module.exports = router