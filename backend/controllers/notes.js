const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')

notesRouter.get('/', (req, res) => {
    Note.find({}).populate('user', {username: 1, name: 1})
    .then((notes) => {
      res.json(notes)
    })
})


notesRouter.get('/:id', (req, res, next) => {
  const id = req.params.id

  Note.findById(id)
  .then((note) => {
    if (note)
      res.json(note)
    else
      res.status(404).end()
  })
  .catch((error) => next(error))
})

notesRouter.post('/', async (req, res, next) => {
  const decodedToken = jwt.verify(req.token, config.SECRET)
  
  if (!decodedToken.id) {
    res.status(401).json({error:"invalid token"})
  }

  const body = req.body
  const user = await User.findById(decodedToken.id)
  
  const note = new Note({
      content: body.content,
      important: body.important || false,
      user: user.id
  })

  note.save()
  .then((savedNote) => {
    res.status(201).json(savedNote)
  })
  .then(() => {
    user.notes = user.notes.concat(note._id)
    user.save()
  })
  .catch((error) => next(error))
})

notesRouter.delete('/:id', (req, res, next) => {

  Note.findById(req.params.id)
  .then((note) => {
    if (!note)
      return next();
    Note.findByIdAndDelete(req.params.id)
    .then(() => {
      res.json(note)
    })
  })
  .catch(error => {
    next(error)
  })
})

notesRouter.put('/:id', (req, res, next) => {
  const body = req.body

  const note = {
    content: body.content,
    important: body.important
  }

  Note.findByIdAndUpdate(req.params.id, note, {
    new: true,
    runValidators: true,
    context: 'query'
  })
  .then((updatedNote) => {
    res.json(updatedNote)
  })
  .catch(error => next(error))
})

module.exports = notesRouter